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

  // Check if turn is valid based on lane positioning (simplified from reference)
  isValidTurn(): boolean {
    try {
      // Get next lane and current lane
      const nextLane = this.car.nextLane;
      const sourceLane = this.current.lane;
      
      // Must have a next lane to make a turn
      if (!nextLane) {
        throw Error('no road to enter');
      }
      
      // Get the turn direction
      const turnNumber = sourceLane.getTurnDirection(nextLane);
      
      // No U-turns allowed
      if (turnNumber === 3) {
        throw Error('no U-turns are allowed');
      }
      
      // Left turns must be from the leftmost lane
      if (turnNumber === 0 && !sourceLane.isLeftmost) {
        throw Error('no left turns from this lane');
      }
      
      // Right turns must be from the rightmost lane
      if (turnNumber === 2 && !sourceLane.isRightmost) {
        throw Error('no right turns from this lane');
      }
      
      return true;
    } catch (error) {
      // Any error means the turn is invalid
      return false;
    }
  }

  // Check if traffic signals allow entry into intersection (simplified from reference)
  canEnterIntersection(): boolean {
    try {
      // Get the next lane for the car
      const nextLane = this.car.nextLane;
      const sourceLane = this.current.lane;
      
      // If no next lane, we're not planning to enter the intersection
      if (!nextLane) {
        return true;
      }
      
      // Get the intersection and its traffic signals
      const intersection = this.nextIntersection;
      
      // Get the turn direction and side ID
      const turnNumber = sourceLane.getTurnDirection(nextLane);
      const sideId = sourceLane.road.targetSideId;
      
      // Check if the signal state allows entry
      return intersection.controlSignals.state[sideId][turnNumber] === 1;
    } catch (error) {
      // On error, prevent entry for safety
      return false;
    }
  }

  // Calculate distance to the next intersection
  getDistanceToIntersection(): number {
    const distance = this.current.lane.length - this.car.length / 2 - this.current.position;
    return !this.isChangingLanes ? max(distance, 0) : Infinity;
  }

  // Check if we need to make a turn at the upcoming intersection
  timeToMakeTurn(plannedStep: number = 0): boolean {
    return this.getDistanceToIntersection() <= plannedStep;
  }

  // Move the car forward along its trajectory (simplified to match reference)
  moveForward(distance: number): void {
    try {
      // Ensure distance is valid (directly from reference)
      distance = max(distance, 0);
      
      // Update positions (directly from reference)
      this.current.position += distance;
      this.next.position += distance;
      this.temp.position += distance;
      
      // === INTERSECTION LOGIC (simplified from reference) ===
      // If at intersection and can enter it, make turn if we have a next lane
      if (this.timeToMakeTurn() && this.canEnterIntersection() && this.isValidTurn()) {
        try {
          const nextLane = this.car.popNextLane();
          if (nextLane) {
            this._startChangingLanes(nextLane, 0);
          }
        } catch (error) {
          // If turn fails, car will be removed in the car's move method
          this.car.alive = false;
          return;
        }
      }
      
      // === LANE CHANGING MANAGEMENT (directly from reference) ===
      const tempRelativePosition = this.temp.position / (this.temp.lane?.length || 1);
      const gap = 2 * this.car.length;
      
      // Phase 1: Release current lane after moving enough into new lane
      if (this.isChangingLanes && this.temp.position > gap && !this.current.free) {
        this.current.release();
      }
      
      // Phase 2: Acquire next lane as we approach it
      if (this.isChangingLanes && this.next.free && 
          this.temp.position + gap > (this.temp.lane?.length || 0)) {
        this.next.acquire();
      }
      
      // Phase 3: Complete the lane change when we reach the end of the curve
      if (this.isChangingLanes && tempRelativePosition >= 1) {
        this._finishChangingLanes();
      }
      
      // Plan ahead - if we're not changing lanes and don't have a next lane, pick one
      if (this.current.lane && !this.isChangingLanes && !this.car.nextLane) {
        try {
          this.car.pickNextLane();
        } catch (error) {
          // Sometimes there's no valid next lane, which is fine
          // The car will be despawned when it reaches the intersection
        }
      }
      
    } catch (error) {
      console.error('🚗 [TRAJ ERROR] Error in moveForward:', error);
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

  // Create a curve for turning at an intersection
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

  // Create a curve for changing to an adjacent lane
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
      
      return new Curve(p1, p2, control1, control2);
    } catch (error) {
      console.error('🚗 [TRAJ ERROR] Error creating adjacent lane curve:', error);
      
      // Emergency fallback - straight line between points
      const p1 = this.current.lane.getPoint(this.current.relativePosition);
      const p2 = this.next.lane.getPoint(this.next.relativePosition);
      
      // Simple linear control points if proper curve fails
      return new Curve(p1, p2, p1, p2);
    }
  }

  // Get the appropriate curve based on the lane change type
  private _getCurve(): Curve {
    return this.current.lane.road === this.next.lane.road
      ? this._getAdjacentLaneChangeCurve()
      : this._getIntersectionLaneChangeCurve();
  }

  // Start the lane changing process
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

  // Complete the lane changing process
  private _finishChangingLanes(): any {
    if (!this.isChangingLanes) {
      throw new Error('no lane changing is going on');
    }
    this.isChangingLanes = false;
    this.current.lane = this.next.lane;
    this.current.position = this.next.position || 0;
    this.current.acquire();
    this.next.lane = null;
    this.next.position = NaN;
    this.temp.lane = null;
    this.temp.position = NaN;
    return this.current.lane;
  }

  // Release all lane positions
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
