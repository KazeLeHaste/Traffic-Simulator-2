import '../helpers';
import _ = require('underscore');
import { Car, NextCarDistance } from '../interfaces';

class LanePosition {
  public car: Car;
  public id: string;
  public free: boolean;
  public position: number;
  public _lane: any;

  constructor(car: Car, lane?: any, position?: number) {
    this.car = car;
    this.id = _.uniqueId('laneposition');
    this.free = true;
    this._lane = lane;
    this.position = position || 0;
  }

  get lane(): any {
    return this._lane;
  }

  set lane(lane: any) {
    this.release();
    this._lane = lane;
    // this.acquire();
  }

  get relativePosition(): number {
    return this.position / this.lane.length;
  }

  acquire(): void {
    if (this.lane && this.lane.addCarPosition) {
      this.free = false;
      this.lane.addCarPosition(this);
    }
  }

  release(): void {
    if (!this.free && this.lane && this.lane.removeCar) {
      this.free = true;
      this.lane.removeCar(this);
    }
  }

  getNext(): LanePosition | null {
    if (this.lane && !this.free) {
      return this.lane.getNext(this);
    }
    return null;
  }

  get nextCarDistance(): NextCarDistance {
    const next = this.getNext();
    if (next) {
      const rearPosition = next.position - next.car.length / 2;
      const frontPosition = this.position + this.car.length / 2;
      return {
        car: next.car,
        distance: rearPosition - frontPosition
      };
    }
    return {
      car: null,
      distance: Infinity
    };
  }
}

// Set up properties using the CoffeeScript-style property decorator
LanePosition.property('lane', {
  get: function(this: LanePosition) {
    return this._lane;
  },
  set: function(this: LanePosition, lane: any) {
    this.release();
    this._lane = lane;
    // this.acquire();
  }
});

LanePosition.property('relativePosition', {
  get: function(this: LanePosition) {
    return this.position / this.lane.length;
  }
});

LanePosition.property('nextCarDistance', {
  get: function(this: LanePosition): NextCarDistance {
    const next = this.getNext();
    if (next) {
      const rearPosition = next.position - next.car.length / 2;
      const frontPosition = this.position + this.car.length / 2;
      return {
        car: next.car,
        distance: rearPosition - frontPosition
      };
    }
    return {
      car: null,
      distance: Infinity
    };
  }
});

export = LanePosition;
