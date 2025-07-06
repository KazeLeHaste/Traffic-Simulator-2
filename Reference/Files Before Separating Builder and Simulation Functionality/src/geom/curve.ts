import '../helpers';
import Segment = require('./segment');
import Point = require('./point');

class Curve {
  public A: Point;
  public B: Point;
  public O: Point;
  public Q: Point;
  public AB: Segment;
  public AO: Segment;
  public OQ: Segment;
  public QB: Segment;
  public _length: number | null;

  constructor(A: Point, B: Point, O: Point, Q: Point) {
    this.A = A;
    this.B = B;
    this.O = O;
    this.Q = Q;
    this.AB = new Segment(this.A, this.B);
    this.AO = new Segment(this.A, this.O);
    this.OQ = new Segment(this.O, this.Q);
    this.QB = new Segment(this.Q, this.B);
    this._length = null;
  }

  get length(): number {
    if (this._length == null) {
      const pointsNumber = 10;
      let previousPoint: Point | null = null;
      this._length = 0;
      for (let i = 0; i <= pointsNumber; i++) {
        const point = this.getPoint(i / pointsNumber);
        if (previousPoint) {
          this._length += point.subtract(previousPoint).length;
        }
        previousPoint = point;
      }
    }
    return this._length;
  }

  getPoint(a: number): Point {
    // OPTIMIZE avoid points and segments
    const p0 = this.AO.getPoint(a);
    const p1 = this.OQ.getPoint(a);
    const p2 = this.QB.getPoint(a);
    const r0 = (new Segment(p0, p1)).getPoint(a);
    const r1 = (new Segment(p1, p2)).getPoint(a);
    return (new Segment(r0, r1)).getPoint(a);
  }

  getDirection(a: number): number {
    // OPTIMIZE avoid points and segments
    const p0 = this.AO.getPoint(a);
    const p1 = this.OQ.getPoint(a);
    const p2 = this.QB.getPoint(a);
    const r0 = (new Segment(p0, p1)).getPoint(a);
    const r1 = (new Segment(p1, p2)).getPoint(a);
    return (new Segment(r0, r1)).direction;
  }
}

// Set up properties using the CoffeeScript-style property decorator
Curve.property('length', {
  get: function(this: Curve) {
    if (this._length == null) {
      const pointsNumber = 10;
      let previousPoint: Point | null = null;
      this._length = 0;
      for (let i = 0; i <= pointsNumber; i++) {
        const point = this.getPoint(i / pointsNumber);
        if (previousPoint) {
          this._length += point.subtract(previousPoint).length;
        }
        previousPoint = point;
      }
    }
    return this._length;
  }
});

export = Curve;
