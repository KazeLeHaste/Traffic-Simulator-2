import '../helpers';
import _ = require('underscore');
import Segment = require('../geom/segment');

interface LanePosition {
  id: string;
  lane: Lane;
  position: number;
  free: boolean;
}

interface Road {
  sourceSideId: number;
  targetSideId: number;
  getTurnDirection(other: any): number;
}

class Lane {
  public sourceSegment: Segment;
  public targetSegment: Segment;
  public road: Road;
  public leftAdjacent: Lane | null;
  public rightAdjacent: Lane | null;
  public leftmostAdjacent: Lane | null;
  public rightmostAdjacent: Lane | null;
  public carsPositions: { [key: string]: LanePosition };
  public middleLine: Segment;
  public length: number;
  public direction: number;

  constructor(sourceSegment: Segment, targetSegment: Segment, road: Road) {
    this.sourceSegment = sourceSegment;
    this.targetSegment = targetSegment;
    this.road = road;
    this.leftAdjacent = null;
    this.rightAdjacent = null;
    this.leftmostAdjacent = null;
    this.rightmostAdjacent = null;
    this.carsPositions = {};
    this.update();
  }

  toJSON(): any {
    const obj = _.extend({}, this);
    delete obj.carsPositions;
    return obj;
  }

  get sourceSideId(): number {
    return this.road.sourceSideId;
  }

  get targetSideId(): number {
    return this.road.targetSideId;
  }

  get isRightmost(): boolean {
    return this === this.rightmostAdjacent;
  }

  get isLeftmost(): boolean {
    return this === this.leftmostAdjacent;
  }

  get leftBorder(): Segment {
    return new Segment(this.sourceSegment.source, this.targetSegment.target);
  }

  get rightBorder(): Segment {
    return new Segment(this.sourceSegment.target, this.targetSegment.source);
  }

  update(): void {
    this.middleLine = new Segment(this.sourceSegment.center, this.targetSegment.center);
    this.length = this.middleLine.length;
    this.direction = this.middleLine.direction;
  }

  getTurnDirection(other: any): number {
    return this.road.getTurnDirection(other.road);
  }

  getDirection(): number {
    return this.direction;
  }

  getPoint(a: number): any {
    return this.middleLine.getPoint(a);
  }

  addCarPosition(carPosition: LanePosition): void {
    if (carPosition.id in this.carsPositions) {
      throw new Error('car is already here');
    }
    this.carsPositions[carPosition.id] = carPosition;
  }

  removeCar(carPosition: LanePosition): void {
    if (!(carPosition.id in this.carsPositions)) {
      throw new Error('removing unknown car');
    }
    delete this.carsPositions[carPosition.id];
  }

  getNext(carPosition: LanePosition): LanePosition | null {
    if (carPosition.lane !== this) {
      throw new Error('car is on other lane');
    }
    let next: LanePosition | null = null;
    let bestDistance = Infinity;
    for (const id in this.carsPositions) {
      const o = this.carsPositions[id];
      const distance = o.position - carPosition.position;
      if (!o.free && 0 < distance && distance < bestDistance) {
        bestDistance = distance;
        next = o;
      }
    }
    return next;
  }
}

// Set up properties using the CoffeeScript-style property decorator
Lane.property('sourceSideId', {
  get: function(this: Lane) {
    return this.road.sourceSideId;
  }
});

Lane.property('targetSideId', {
  get: function(this: Lane) {
    return this.road.targetSideId;
  }
});

Lane.property('isRightmost', {
  get: function(this: Lane) {
    return this === this.rightmostAdjacent;
  }
});

Lane.property('isLeftmost', {
  get: function(this: Lane) {
    return this === this.leftmostAdjacent;
  }
});

Lane.property('leftBorder', {
  get: function(this: Lane) {
    return new Segment(this.sourceSegment.source, this.targetSegment.target);
  }
});

Lane.property('rightBorder', {
  get: function(this: Lane) {
    return new Segment(this.sourceSegment.target, this.targetSegment.source);
  }
});

export = Lane;
