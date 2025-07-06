import '../helpers';
import Point = require('./point');

class Segment {
  public source: Point;
  public target: Point;

  constructor(source: Point, target: Point) {
    this.source = source;
    this.target = target;
  }

  get vector(): Point {
    return this.target.subtract(this.source);
  }

  get length(): number {
    return this.vector.length;
  }

  get direction(): number {
    return this.vector.direction;
  }

  get center(): Point {
    return this.getPoint(0.5);
  }

  split(n: number, reverse?: boolean): Segment[] {
    const order = reverse ? 
      Array.from({ length: n }, (_, i) => n - 1 - i) : 
      Array.from({ length: n }, (_, i) => i);
    
    return order.map(k => this.subsegment(k / n, (k + 1) / n));
  }

  getPoint(a: number): Point {
    return this.source.add(this.vector.mult(a));
  }

  subsegment(a: number, b: number): Segment {
    const offset = this.vector;
    const start = this.source.add(offset.mult(a));
    const end = this.source.add(offset.mult(b));
    return new Segment(start, end);
  }
}

// Set up properties using the CoffeeScript-style property decorator
Segment.property('vector', {
  get: function(this: Segment) {
    return this.target.subtract(this.source);
  }
});

Segment.property('length', {
  get: function(this: Segment) {
    return this.vector.length;
  }
});

Segment.property('direction', {
  get: function(this: Segment) {
    return this.vector.direction;
  }
});

Segment.property('center', {
  get: function(this: Segment) {
    return this.getPoint(0.5);
  }
});

export = Segment;
