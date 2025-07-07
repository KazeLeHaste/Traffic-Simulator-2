import '../helpers';
import LanePosition = require('./lane-position');
import Curve = require('../geom/curve');
import _ = require('underscore');
import { Car, NextCarDistance } from '../interfaces';

const { min, max } = Math;

class Trajectory {
  public car: Car;
  public current: LanePosition;
  public next: LanePosition;
  public temp: LanePosition;
  public isChangingLanes: boolean;

  constructor(car: Car, lane: any, position?: number) {
    this.car = car;
    position = position || 0;
    this.current = new LanePosition(car, lane, position);
    this.current.acquire();
    this.next = new LanePosition(car);
    this.temp = new LanePosition(car);
    this.isChangingLanes = false;
  }

  get lane(): any {
    return this.temp.lane || this.current.lane;
  }

  get absolutePosition(): number {
    return this.temp.lane ? this.temp.position : this.current.position;
  }

  get relativePosition(): number {
    return this.absolutePosition / this.lane.length;
  }

  get direction(): number {
    return this.lane.getDirection(this.relativePosition);
  }

  get coords(): any {
    return this.lane.getPoint(this.relativePosition);
  }

  get nextCarDistance(): NextCarDistance {
    const a = this.current.nextCarDistance;
    const b = this.next.nextCarDistance;
    return a.distance < b.distance ? a : b;
  }

  get distanceToStopLine(): number {
    if (!this.canEnterIntersection()) {
      return this.getDistanceToIntersection();
    }
    return Infinity;
  }

  get nextIntersection(): any {
    return this.current.lane.road.target;
  }

  get previousIntersection(): any {
    return this.current.lane.road.source;
  }

  isValidTurn(): boolean {
    // TODO right turn is only allowed from the right lane
    const nextLane = this.car.nextLane;
    const sourceLane = this.current.lane;
    if (!nextLane) {
      throw new Error('no road to enter');
    }
    const turnNumber = sourceLane.getTurnDirection(nextLane);
    if (turnNumber === 3) {
      throw new Error('no U-turns are allowed');
    }
    if (turnNumber === 0 && !sourceLane.isLeftmost) {
      throw new Error('no left turns from this lane');
    }
    if (turnNumber === 2 && !sourceLane.isRightmost) {
      throw new Error('no right turns from this lane');
    }
    return true;
  }

  canEnterIntersection(): boolean {
    const nextLane = this.car.nextLane;
    const sourceLane = this.current.lane;
    if (!nextLane) {
      return true;
    }
    const intersection = this.nextIntersection;
    const turnNumber = sourceLane.getTurnDirection(nextLane);
    const sideId = sourceLane.road.targetSideId;
    return intersection.controlSignals.state[sideId][turnNumber];
  }

  getDistanceToIntersection(): number {
    const distance = this.current.lane.length - this.car.length / 2 - this.current.position;
    return !this.isChangingLanes ? max(distance, 0) : Infinity;
  }

  timeToMakeTurn(plannedStep: number = 0): boolean {
    return this.getDistanceToIntersection() <= plannedStep;
  }

  moveForward(distance: number): void {
    try {
      // Ensure distance is valid
      distance = max(distance, 0);
      if (distance === 0) {
        return; // Nothing to do
      }
      
      // Check for potential collision before moving
      // Get information about the car ahead
      const nextCarInfo = this.nextCarDistance;
      
      // If there's a car ahead, ensure we don't move through it
      if (nextCarInfo.car && nextCarInfo.distance < distance) {
        // We would collide with the next car if we moved the full distance
        // Limit our movement to just before the next car
        const safeDistance = max(nextCarInfo.distance - 0.5, 0); // 0.5 meter safety margin
        
        // Debug collision avoidance only when significantly reducing distance
        if (safeDistance < distance * 0.5) {
          console.log(`🚗 [TRAJ INFO] Collision avoided: wanted to move ${distance.toFixed(2)}m but next car is ${nextCarInfo.distance.toFixed(2)}m ahead`);
        }
        
        distance = safeDistance;
      }
      
      // Update positions
      this.current.position += distance;
      this.next.position += distance;
      this.temp.position += distance;
      
      // Check if we need to make a turn at an intersection
      const atIntersection = this.timeToMakeTurn();
      const canEnter = this.canEnterIntersection();
      
      if (atIntersection && canEnter && this.car.nextLane) {
        try {
          // We're at an intersection and have green light - perform the turn
          const nextLane = this.car.popNextLane();
          if (nextLane) {
            console.log('🚗 [TRAJ INFO] Car is at intersection and proceeding to next lane');
            this._startChangingLanes(nextLane, 0);
          }
        } catch (turnError) {
          console.error('🚗 [TRAJ ERROR] Error making turn at intersection:', turnError);
        }
      } else if (atIntersection && !canEnter) {
        // We're at a red light - log this event
        console.log('🚗 [TRAJ INFO] Car waiting at red light/intersection');
      }
      
      // Calculate relative position and gap for lane changing
      let tempLaneLength = this.temp.lane?.length;
      if (!tempLaneLength || tempLaneLength <= 0) {
        tempLaneLength = 1; // Avoid division by zero
      }
      
      const tempRelativePosition = this.temp.position / tempLaneLength;
      const gap = 2 * this.car.length;
      
      // === Lane changing state management ===
      
      // Phase 1: Starting lane change - We've moved enough to start releasing current lane
      if (this.isChangingLanes && this.temp.position > gap && !this.current.free) {
        this.current.release();
        console.log('🚗 [TRAJ INFO] Released current lane during lane change');
      }
      
      // Phase 2: Middle of lane change - We're approaching new lane and can acquire it
      if (this.isChangingLanes && this.next.free && 
          this.temp.position + gap > (this.temp.lane?.length || 0)) {
        this.next.acquire();
        console.log('🚗 [TRAJ INFO] Acquired next lane during lane change');
      }
      
      // Phase 3: End of lane change - We've completed the curved trajectory
      if (this.isChangingLanes && tempRelativePosition >= 1) {
        this._finishChangingLanes();
        console.log('🚗 [TRAJ INFO] Completed lane change');
      }
      
      // Plan ahead - if we don't have a next lane selected, pick one
      if (this.current.lane && !this.isChangingLanes && !this.car.nextLane) {
        try {
          // Don't spam logs during normal operation
          const nextLane = this.car.pickNextLane();
          if (nextLane) {
            console.log('🚗 [TRAJ INFO] Selected next lane:', nextLane.id || 'unknown');
          }
        } catch (pickError) {
          console.error('🚗 [TRAJ ERROR] Error picking next lane:', pickError);
        }
      }
    } catch (error) {
      console.error('🚗 [TRAJ ERROR] Error in moveForward:', error);
      console.error('🚗 [TRAJ ERROR] Stack trace:', error.stack);
    }
  }

  changeLane(nextLane: any): void {
    if (this.isChangingLanes) {
      throw new Error('already changing lane');
    }
    if (!nextLane) {
      throw new Error('no next lane');
    }
    if (nextLane === this.lane) {
      throw new Error('next lane == current lane');
    }
    if (this.lane.road !== nextLane.road) {
      throw new Error('not neighbouring lanes');
    }
    const nextPosition = this.current.position + 3 * this.car.length;
    if (nextPosition >= this.lane.length) {
      throw new Error('too late to change lane');
    }
    this._startChangingLanes(nextLane, nextPosition);
  }

  private _getIntersectionLaneChangeCurve(): Curve {
    try {
      // When turning at an intersection, we need to create a curve that simulates
      // the car's path through the intersection from one road to another
      
      // Get the end point of current lane and start point of next lane
      const p1 = this.current.lane.getPoint(1.0); // End of current lane
      const p2 = this.next.lane.getPoint(0.0);    // Start of next lane
      
      if (!p1 || !p2) {
        throw new Error('Invalid points for intersection curve creation');
      }
      
      // Get the intersection center for better curve calculation
      const intersection = this.nextIntersection;
      const center = intersection.rect.center();
      
      // Calculate control points based on the turn type
      const sourceLane = this.current.lane;
      const targetLane = this.next.lane;
      const turnNumber = sourceLane.getTurnDirection(targetLane);
      
      // Calculate control points based on the turn type
      let control1, control2;
      
      switch(turnNumber) {
        case 0: // Left turn
          // For left turns, we want a wider curve
          control1 = center.add(p1.subtract(center).rotate(-Math.PI/4).mult(0.5));
          control2 = center.add(p2.subtract(center).rotate(Math.PI/4).mult(0.5));
          break;
          
        case 2: // Right turn
          // For right turns, we want a tighter curve
          control1 = p1.add(p2.subtract(p1).mult(0.25));
          control2 = p1.add(p2.subtract(p1).mult(0.75));
          break;
          
        case 1: // Straight
        default:
          // For going straight, use simpler control points
          control1 = p1.add(center.subtract(p1).mult(0.5));
          control2 = p2.add(center.subtract(p2).mult(0.5));
          break;
      }
      
      return new Curve(p1, p2, control1, control2);
      
    } catch (error) {
      console.error('🚗 [TRAJ ERROR] Error creating intersection curve:', error);
      
      // Fallback to using adjacent lane change curve if this fails
      return this._getAdjacentLaneChangeCurve();
    }
  }

  private _getAdjacentLaneChangeCurve(): Curve {
    try {
      // Get points for current and next positions
      const p1 = this.current.lane.getPoint(this.current.relativePosition);
      const p2 = this.next.lane.getPoint(this.next.relativePosition);
      
      if (!p1 || !p2) {
        throw new Error('Invalid points for curve creation');
      }
      
      const distance = p2.subtract(p1).length;
      
      // Create a smoother curve for lane change by adjusting control points
      let controlPointFactor = 0.3; // Default control point factor
      
      // If high speed, make the curve more gradual
      if (this.car.speed > 15) {
        controlPointFactor = 0.4; // More gradual curve at higher speeds
      }
      
      // Create control points for smooth Bezier curve
      const direction1 = this.current.lane.middleLine.vector.normalized.mult(distance * controlPointFactor);
      const control1 = p1.add(direction1);
      
      const direction2 = this.next.lane.middleLine.vector.normalized.mult(distance * controlPointFactor);
      const control2 = p2.subtract(direction2);
      
      // Create the curve with proper control points
      return new Curve(p1, p2, control1, control2);
    } catch (error) {
      console.error('🚗 [TRAJ ERROR] Error creating lane change curve:', error);
      
      // Fallback to a simpler curve if there's an error
      const p1 = this.current.lane.getPoint(this.current.relativePosition);
      const p2 = this.next.lane.getPoint(this.next.relativePosition);
      const midpoint = p1.add(p2.subtract(p1).mult(0.5));
      
      return new Curve(p1, p2, midpoint, midpoint);
    }
  }

  private _getCurve(): Curve {
    // Choose the appropriate curve type based on context
    try {
      // If this is a lane change within the same road
      if (this.current.lane.road === this.next.lane.road) {
        return this._getAdjacentLaneChangeCurve();
      } 
      // If this is a turn at an intersection
      else {
        // Verify we're at an intersection
        const atIntersection = this.getDistanceToIntersection() <= 1.0;
        
        if (atIntersection) {
          return this._getIntersectionLaneChangeCurve();
        } else {
          console.warn('🚗 [TRAJ WARN] Attempt to change to lane on different road not at intersection');
          // Fall back to adjacent lane curve if something's wrong
          return this._getAdjacentLaneChangeCurve();
        }
      }
    } catch (error) {
      console.error('🚗 [TRAJ ERROR] Error selecting curve type:', error);
      // Fall back to adjacent lane curve if there's an error
      return this._getAdjacentLaneChangeCurve();
    }
  }

  private _startChangingLanes(nextLane: any, nextPosition: number): void {
    if (this.isChangingLanes) {
      throw new Error('already changing lane');
    }
    if (!nextLane) {
      throw new Error('no next lane');
    }
    this.isChangingLanes = true;
    this.next.lane = nextLane;
    this.next.position = nextPosition;

    const curve = this._getCurve();

    this.temp.lane = curve;
    this.temp.position = 0; // this.current.lane.length - this.current.position
    this.next.position -= this.temp.lane.length;
  }

  private _finishChangingLanes(): any {
    if (!this.isChangingLanes) {
      throw new Error('no lane changing is going on');
    }
    this.isChangingLanes = false;
    // TODO swap current and next
    this.current.lane = this.next.lane;
    this.current.position = this.next.position || 0;
    this.current.acquire();
    this.next.lane = null;
    this.next.position = NaN;
    this.temp.lane = null;
    this.temp.position = NaN;
    return this.current.lane;
  }

  release(): void {
    if (this.current) {
      this.current.release();
    }
    if (this.next) {
      this.next.release();
    }
    if (this.temp) {
      this.temp.release();
    }
  }
}

// Set up properties using the CoffeeScript-style property decorator
Trajectory.property('lane', {
  get: function(this: Trajectory) {
    return this.temp.lane || this.current.lane;
  }
});

Trajectory.property('absolutePosition', {
  get: function(this: Trajectory) {
    return this.temp.lane ? this.temp.position : this.current.position;
  }
});

Trajectory.property('relativePosition', {
  get: function(this: Trajectory) {
    return this.absolutePosition / this.lane.length;
  }
});

Trajectory.property('direction', {
  get: function(this: Trajectory) {
    return this.lane.getDirection(this.relativePosition);
  }
});

Trajectory.property('coords', {
  get: function(this: Trajectory) {
    return this.lane.getPoint(this.relativePosition);
  }
});

Trajectory.property('nextCarDistance', {
  get: function(this: Trajectory): NextCarDistance {
    const a = this.current.nextCarDistance;
    const b = this.next.nextCarDistance;
    return a.distance < b.distance ? a : b;
  }
});

Trajectory.property('distanceToStopLine', {
  get: function(this: Trajectory) {
    if (!this.canEnterIntersection()) {
      return this.getDistanceToIntersection();
    }
    return Infinity;
  }
});

Trajectory.property('nextIntersection', {
  get: function(this: Trajectory) {
    return this.current.lane.road.target;
  }
});

Trajectory.property('previousIntersection', {
  get: function(this: Trajectory) {
    return this.current.lane.road.source;
  }
});

export = Trajectory;
