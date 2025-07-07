import '../helpers';
import _ = require('underscore');
import Trajectory = require('./trajectory');

const { max, min, random, sqrt } = Math;

interface Lane {
  road: any;
  leftmostAdjacent: Lane;
  rightmostAdjacent: Lane;
  leftAdjacent?: Lane;
  rightAdjacent?: Lane;
  carsPositions?: {[key: string]: any};
  isLeftmost?: boolean;
  isRightmost?: boolean;
  getTurnDirection(other: Lane): number;
  getNext?(carPosition: any): any;
  addCarPosition?(carPosition: any): void;
  removeCar?(carPosition: any): void;
  getDirection(relativePosition?: number): number;
  getPoint(relativePosition: number): any;
  length: number;
  middleLine?: any;
}

interface LanePositionResult {
  distance: number;
  car: Car | null;
}

class Car {
  public id: string;
  public color: number;
  public _speed: number;
  public width: number;
  public length: number;
  public maxSpeed: number;
  public s0: number;           // Minimum distance (meters)
  public timeHeadway: number;  // Time headway (seconds)
  public maxAcceleration: number;
  public maxDeceleration: number;
  public trajectory: Trajectory;
  public alive: boolean;
  public preferedLane: Lane | null;
  public nextLane: Lane | null;

  constructor(lane: any, position: number) {
    this.id = _.uniqueId('car');
    this.color = (300 + 240 * random()) % 360;
    this._speed = 0;
    this.width = 1.7;
    this.length = 3 + 2 * random();
    
    // IDM parameters - exactly as reference implementation
    this.maxSpeed = 30;
    this.s0 = 2;
    this.timeHeadway = 1.5;
    this.maxAcceleration = 1;
    this.maxDeceleration = 3;
    
    this.trajectory = new Trajectory(this, lane, position);
    this.alive = true;
    this.preferedLane = null;
    this.nextLane = null;
  }

  static copy(car: any): Car {
    const result = Object.create(Car.prototype);
    _.extend(result, car);
    return result;
  }

  get coords(): any {
    return this.trajectory.coords;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(speed: number) {
    if (speed < 0) speed = 0;
    if (speed > this.maxSpeed) speed = this.maxSpeed;
    this._speed = speed;
  }

  get direction(): number {
    return this.trajectory.direction;
  }

  release(): void {
    this.trajectory.release();
  }

  // Calculate acceleration based on Intelligent Driver Model (exact reference implementation)
  getAcceleration(): number {
    // Get the distance to the next car ahead
    const nextCarDistance = this.trajectory.nextCarDistance;
    const distanceToNextCar = max(nextCarDistance.distance, 0);
    
    // IDM parameters - directly from reference
    const a = this.maxAcceleration;
    const b = this.maxDeceleration;
    
    // Calculate relative speed difference
    const deltaSpeed = (this.speed - (nextCarDistance.car?.speed || 0));
    
    // === INTELLIGENT DRIVER MODEL (IDM) CALCULATION - Reference Implementation ===
    
    // 1. Free road coefficient - (v/v_0)^4
    const freeRoadCoeff = Math.pow(this.speed / this.maxSpeed, 4);
    
    // 2. Calculate desired safe following distance
    const distanceGap = this.s0;                                    // Minimum gap when stopped
    const timeGap = this.speed * this.timeHeadway;                  // Time headway component
    const breakGap = this.speed * deltaSpeed / (2 * sqrt(a * b));   // Breaking gap component
    const safeDistance = distanceGap + timeGap + breakGap;
    
    // 3. Calculate interaction coefficient with leading vehicle
    const busyRoadCoeff = Math.pow(safeDistance / distanceToNextCar, 2);
    
    // 4. Intersection handling - exactly as reference
    const safeIntersectionDistance = 1 + timeGap + Math.pow(this.speed, 2) / (2 * b);
    const intersectionCoeff = Math.pow(safeIntersectionDistance / this.trajectory.distanceToStopLine, 2);
    
    // 5. Calculate final acceleration coefficient
    const coeff = 1 - freeRoadCoeff - busyRoadCoeff - intersectionCoeff;
    
    // Return the final acceleration
    return this.maxAcceleration * coeff;
  }

  move(delta: number): void {
    // Calculate acceleration using the Intelligent Driver Model
    const acceleration = this.getAcceleration();
    
    // Update speed based on acceleration
    this.speed += acceleration * delta;

    // === LANE CHANGING LOGIC (exactly from reference) ===
    if (!this.trajectory.isChangingLanes && this.nextLane) {
      const currentLane = this.trajectory.current.lane;
      const turnNumber = currentLane.getTurnDirection(this.nextLane);
      
      // Choose preferred lane based on turn direction (exactly from reference)
      let preferedLane;
      switch (turnNumber) {
        case 0: // Left turn
          preferedLane = currentLane.leftmostAdjacent;
          break;
        case 2: // Right turn
          preferedLane = currentLane.rightmostAdjacent;
          break;
        default: // Forward
          preferedLane = currentLane;
      }
      
      // Attempt lane change if not in preferred lane
      if (preferedLane !== currentLane) {
        try {
          this.trajectory.changeLane(preferedLane);
        } catch (error) {
          // Lane change failed, continue in current lane
        }
      }
    }

    // Calculate distance to travel in this step
    const step = this.speed * delta + 0.5 * acceleration * delta * delta;
    
    // Debug IDM behavior as in reference (only in debug mode)
    if (this.trajectory.nextCarDistance.distance < step) {
      // console.log('bad IDM'); // Commented out to prevent console spam
    }

    // Check if we need to make a turn at intersection
    if (this.trajectory.timeToMakeTurn(step)) {
      // If no next lane available, car dies (reaches destination)
      if (!this.nextLane) {
        this.alive = false;
        return;
      }
    }
    
    // Move forward
    this.trajectory.moveForward(step);
  }

  // Select a road to turn to at the next intersection (directly from reference)
  pickNextRoad(): any {
    const intersection = this.trajectory.nextIntersection;
    const currentLane = this.trajectory.current.lane;
    
    // Filter possible roads to avoid U-turns (directly from reference)
    const possibleRoads = intersection.roads.filter((road: any) => 
      road.target !== currentLane.road.source
    );
    
    // If no roads available, return null (car will be despawned)
    if (possibleRoads.length === 0) {
      return null;
    }
    
    // Randomly select a road (directly from reference)
    return _.sample(possibleRoads);
  }

  // Choose the next lane based on where we want to turn
  pickNextLane(): Lane | null {
    // Make sure we don't already have a next lane (directly from reference)
    if (this.nextLane) {
      throw Error('next lane is already chosen');
    }
    
    // Reset next lane and preferred lane references
    this.nextLane = null;
    this.preferedLane = null;
    
    // Get the next road to turn into
    const nextRoad = this.pickNextRoad();
    
    // If no road is available, return null - car will be marked not alive
    if (!nextRoad) {
      return null;
    }
    
    // Choose lane based on the turn we're about to make (directly from reference)
    const turnNumber = this.trajectory.current.lane.road.getTurnDirection(nextRoad);
    let laneNumber;
    
    switch (turnNumber) {
      case 0: // Left turn - use leftmost lane
        laneNumber = nextRoad.lanesNumber - 1;
        break;
      case 1: // Straight - use a random lane
        laneNumber = _.random(0, nextRoad.lanesNumber - 1);
        break;
      case 2: // Right turn - use rightmost lane
        laneNumber = 0;
        break;
      default:
        laneNumber = 0;
    }
    
    // Set the next lane
    this.nextLane = nextRoad.lanes[laneNumber];
    
    // Verify that we have a valid lane
    if (!this.nextLane) {
      throw Error('cannot pick next lane');
    }
    
    return this.nextLane;
  }

  // Return the next lane and clear the stored reference (directly from reference)
  popNextLane(): Lane | null {
    const nextLane = this.nextLane;
    this.nextLane = null;
    this.preferedLane = null;
    return nextLane;
  }
}

export = Car;
