import '../helpers';
import _ = require('underscore');
import Trajectory = require('./trajectory');

const { max, min, random, sqrt } = Math;

interface Lane {
  road: any;
  leftmostAdjacent: Lane;
  rightmostAdjacent: Lane;
  getTurnDirection(other: Lane): number;
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
  public s0: number;
  public timeHeadway: number;
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

  getAcceleration(): number {
    const nextCarDistance = this.trajectory.nextCarDistance;
    const distanceToNextCar = max(nextCarDistance.distance, 0);
    const a = this.maxAcceleration;
    const b = this.maxDeceleration;
    const deltaSpeed = (this.speed - (nextCarDistance.car?.speed || 0));
    const freeRoadCoeff = Math.pow(this.speed / this.maxSpeed, 4);
    const distanceGap = this.s0;
    const timeGap = this.speed * this.timeHeadway;
    const breakGap = this.speed * deltaSpeed / (2 * sqrt(a * b));
    const safeDistance = distanceGap + timeGap + breakGap;
    const busyRoadCoeff = Math.pow(safeDistance / distanceToNextCar, 2);
    const safeIntersectionDistance = 1 + timeGap + Math.pow(this.speed, 2) / (2 * b);
    const intersectionCoeff = Math.pow(safeIntersectionDistance / this.trajectory.distanceToStopLine, 2);
    const coeff = 1 - freeRoadCoeff - busyRoadCoeff - intersectionCoeff;
    return this.maxAcceleration * coeff;
  }

  move(delta: number): void {
    const acceleration = this.getAcceleration();
    this.speed += acceleration * delta;

    if (!this.trajectory.isChangingLanes && this.nextLane) {
      const currentLane = this.trajectory.current.lane;
      const turnNumber = currentLane.getTurnDirection(this.nextLane);
      let preferedLane: Lane;
      switch (turnNumber) {
        case 0:
          preferedLane = currentLane.leftmostAdjacent;
          break;
        case 2:
          preferedLane = currentLane.rightmostAdjacent;
          break;
        default:
          preferedLane = currentLane;
      }
      if (preferedLane !== currentLane) {
        this.trajectory.changeLane(preferedLane);
      }
    }

    const step = this.speed * delta + 0.5 * acceleration * Math.pow(delta, 2);
    // TODO: hacks, should have changed speed
    if (this.trajectory.nextCarDistance.distance < step) {
      console.log('bad IDM');
    }

    if (this.trajectory.timeToMakeTurn(step)) {
      if (!this.nextLane) {
        this.alive = false;
        return;
      }
    }
    this.trajectory.moveForward(step);
  }

  pickNextRoad(): any {
    const intersection = this.trajectory.nextIntersection;
    const currentLane = this.trajectory.current.lane;
    const possibleRoads = intersection.roads.filter((x: any) => 
      x.target !== currentLane.road.source
    );
    if (possibleRoads.length === 0) {
      return null;
    }
    return _.sample(possibleRoads);
  }

  pickNextLane(): Lane | null {
    if (this.nextLane) {
      throw new Error('next lane is already chosen');
    }
    this.nextLane = null;
    const nextRoad = this.pickNextRoad();
    if (!nextRoad) {
      return null;
    }
    const turnNumber = this.trajectory.current.lane.road.getTurnDirection(nextRoad);
    let laneNumber: number;
    switch (turnNumber) {
      case 0:
        laneNumber = nextRoad.lanesNumber - 1;
        break;
      case 1:
        laneNumber = _.random(0, nextRoad.lanesNumber - 1);
        break;
      case 2:
        laneNumber = 0;
        break;
      default:
        laneNumber = 0;
    }
    this.nextLane = nextRoad.lanes[laneNumber];
    if (!this.nextLane) {
      throw new Error('can not pick next lane');
    }
    return this.nextLane;
  }

  popNextLane(): Lane | null {
    const nextLane = this.nextLane;
    this.nextLane = null;
    this.preferedLane = null;
    return nextLane;
  }
}

// Set up properties using the CoffeeScript-style property decorator
Car.property('coords', {
  get: function(this: Car) {
    return this.trajectory.coords;
  }
});

Car.property('speed', {
  get: function(this: Car) {
    return this._speed;
  },
  set: function(this: Car, speed: number) {
    if (speed < 0) speed = 0;
    if (speed > this.maxSpeed) speed = this.maxSpeed;
    this._speed = speed;
  }
});

Car.property('direction', {
  get: function(this: Car) {
    return this.trajectory.direction;
  }
});

export = Car;
