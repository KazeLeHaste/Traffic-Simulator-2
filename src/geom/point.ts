import '../helpers';

const { sqrt, atan2 } = Math;

class Point {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static property = Function.prototype.property;

  get length(): number {
    return sqrt(this.x * this.x + this.y * this.y);
  }

  get direction(): number {
    return atan2(this.y, this.x);
  }

  get normalized(): Point {
    return new Point(this.x / this.length, this.y / this.length);
  }

  add(o: Point): Point {
    return new Point(this.x + o.x, this.y + o.y);
  }

  subtract(o: Point): Point {
    return new Point(this.x - o.x, this.y - o.y);
  }

  mult(k: number): Point {
    return new Point(this.x * k, this.y * k);
  }

  divide(k: number): Point {
    return new Point(this.x / k, this.y / k);
  }
}

// Set up properties using the CoffeeScript-style property decorator
Point.property('length', {
  get: function(this: Point) {
    return sqrt(this.x * this.x + this.y * this.y);
  }
});

Point.property('direction', {
  get: function(this: Point) {
    return atan2(this.y, this.x);
  }
});

Point.property('normalized', {
  get: function(this: Point) {
    return new Point(this.x / this.length, this.y / this.length);
  }
});

export = Point;
