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
    distance = max(distance, 0);
    this.current.position += distance;
    this.next.position += distance;
    this.temp.position += distance;
    
    if (this.timeToMakeTurn() && this.canEnterIntersection() && this.isValidTurn()) {
      this._startChangingLanes(this.car.popNextLane(), 0);
    }
    
    const tempRelativePosition = this.temp.position / (this.temp.lane?.length || 1);
    const gap = 2 * this.car.length;
    
    if (this.isChangingLanes && this.temp.position > gap && !this.current.free) {
      this.current.release();
    }
    
    if (this.isChangingLanes && this.next.free && 
        this.temp.position + gap > (this.temp.lane?.length || 0)) {
      this.next.acquire();
    }
    
    if (this.isChangingLanes && tempRelativePosition >= 1) {
      this._finishChangingLanes();
    }
    
    if (this.current.lane && !this.isChangingLanes && !this.car.nextLane) {
      this.car.pickNextLane();
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
    // Implementation needed
    throw new Error('Not implemented');
  }

  private _getAdjacentLaneChangeCurve(): Curve {
    const p1 = this.current.lane.getPoint(this.current.relativePosition);
    const p2 = this.next.lane.getPoint(this.next.relativePosition);
    const distance = p2.subtract(p1).length;
    const direction1 = this.current.lane.middleLine.vector.normalized.mult(distance * 0.3);
    const control1 = p1.add(direction1);
    const direction2 = this.next.lane.middleLine.vector.normalized.mult(distance * 0.3);
    const control2 = p2.subtract(direction2);
    return new Curve(p1, p2, control1, control2);
  }

  private _getCurve(): Curve {
    // FIXME: race condition due to using relativePosition on intersections
    return this._getAdjacentLaneChangeCurve();
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
