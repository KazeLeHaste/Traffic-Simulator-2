import '../helpers';
import _ = require('underscore');
import Lane = require('./lane');
import settings = require('../settings');
import Segment = require('../geom/segment');

const { min, max } = Math;

interface Intersection {
  id: string;
  rect: any;
  roads: Road[];
  inRoads: Road[];
}

class Road {
  public source: Intersection;
  public target: Intersection;
  public id: string;
  public lanes: Lane[];
  public lanesNumber: number | null;
  public sourceSideId: number;
  public sourceSide: Segment;
  public targetSideId: number;
  public targetSide: Segment;

  constructor(source: Intersection, target: Intersection) {
    this.source = source;
    this.target = target;
    this.id = _.uniqueId('road');
    this.lanes = [];
    this.lanesNumber = null;
    this.update();
  }

  static copy(road: any): Road {
    const result = Object.create(Road.prototype);
    _.extend(result, road);
    if (!result.lanes) {
      result.lanes = [];
    }
    return result;
  }

  toJSON(): any {
    return {
      id: this.id,
      source: this.source.id,
      target: this.target.id
    };
  }

  get length(): number {
    return this.targetSide.target.subtract(this.sourceSide.source).length;
  }

  get leftmostLane(): Lane {
    return this.lanes[this.lanesNumber! - 1];
  }

  get rightmostLane(): Lane {
    return this.lanes[0];
  }

  getTurnDirection(other: Road): number {
    if (this.target !== other.source) {
      throw new Error('invalid roads');
    }
    const side1 = this.targetSideId;
    const side2 = other.sourceSideId;
    // 0 - left, 1 - forward, 2 - right
    const turnNumber = (side2 - side1 - 1 + 8) % 4;
    return turnNumber;
  }

  update(): void {
    if (!this.source || !this.target) {
      throw new Error('incomplete road');
    }
    this.sourceSideId = this.source.rect.getSectorId(this.target.rect.center());
    this.sourceSide = this.source.rect.getSide(this.sourceSideId).subsegment(0.5, 1.0);
    this.targetSideId = this.target.rect.getSectorId(this.source.rect.center());
    this.targetSide = this.target.rect.getSide(this.targetSideId).subsegment(0, 0.5);
    this.lanesNumber = min(this.sourceSide.length, this.targetSide.length) | 0;
    this.lanesNumber = max(2, (this.lanesNumber / settings.gridSize) | 0);
    const sourceSplits = this.sourceSide.split(this.lanesNumber, true);
    const targetSplits = this.targetSide.split(this.lanesNumber);
    
    if (!this.lanes || this.lanes.length < this.lanesNumber) {
      if (!this.lanes) {
        this.lanes = [];
      }
      for (let i = 0; i < this.lanesNumber; i++) {
        if (!this.lanes[i]) {
          this.lanes[i] = new Lane(sourceSplits[i], targetSplits[i], this);
        }
      }
    }
    
    for (let i = 0; i < this.lanesNumber; i++) {
      this.lanes[i].sourceSegment = sourceSplits[i];
      this.lanes[i].targetSegment = targetSplits[i];
      this.lanes[i].leftAdjacent = this.lanes[i + 1] || null;
      this.lanes[i].rightAdjacent = this.lanes[i - 1] || null;
      this.lanes[i].leftmostAdjacent = this.lanes[this.lanesNumber - 1];
      this.lanes[i].rightmostAdjacent = this.lanes[0];
      this.lanes[i].update();
    }
  }
}

// Set up properties using the CoffeeScript-style property decorator
Road.property('length', {
  get: function(this: Road) {
    return this.targetSide.target.subtract(this.sourceSide.source).length;
  }
});

Road.property('leftmostLane', {
  get: function(this: Road) {
    return this.lanes[this.lanesNumber! - 1];
  }
});

Road.property('rightmostLane', {
  get: function(this: Road) {
    return this.lanes[0];
  }
});

export = Road;
