import '../helpers';
import _ = require('underscore');
import Point = require('./point');
import Segment = require('./segment');

const { abs } = Math;

class Rect {
  public x: number;
  public y: number;
  public _width: number;
  public _height: number;

  constructor(x: number, y: number, _width: number = 0, _height: number = 0) {
    this.x = x;
    this.y = y;
    this._width = _width;
    this._height = _height;
  }

  static copy(rect: Rect): Rect {
    return new Rect(rect.x, rect.y, rect._width, rect._height);
  }

  toJSON(): any {
    return _.extend({}, this);
  }

  area(): number {
    return this.width() * this.height();
  }

  left(left?: number): number {
    if (left !== undefined) {
      this.x = left;
    }
    return this.x;
  }

  right(right?: number): number {
    if (right !== undefined) {
      this.x = right - this.width();
    }
    return this.x + this.width();
  }

  width(width?: number): number {
    if (width !== undefined) {
      this._width = width;
    }
    return this._width;
  }

  top(top?: number): number {
    if (top !== undefined) {
      this.y = top;
    }
    return this.y;
  }

  bottom(bottom?: number): number {
    if (bottom !== undefined) {
      this.y = bottom - this.height();
    }
    return this.y + this.height();
  }

  height(height?: number): number {
    if (height !== undefined) {
      this._height = height;
    }
    return this._height;
  }

  center(center?: Point): Point {
    if (center) {
      this.x = center.x - this.width() / 2;
      this.y = center.y - this.height() / 2;
    }
    return new Point(this.x + this.width() / 2, this.y + this.height() / 2);
  }

  containsPoint(point: Point): boolean {
    return this.left() <= point.x && point.x <= this.right() && 
           this.top() <= point.y && point.y <= this.bottom();
  }

  containsRect(rect: Rect): boolean {
    return this.left() <= rect.left() && rect.right() <= this.right() &&
           this.top() <= rect.top() && rect.bottom() <= this.bottom();
  }

  getVertices(): Point[] {
    return [
      new Point(this.left(), this.top()),
      new Point(this.right(), this.top()),
      new Point(this.right(), this.bottom()),
      new Point(this.left(), this.bottom()),
    ];
  }

  getSide(i: number): Segment {
    const vertices = this.getVertices();
    return new Segment(vertices[i], vertices[(i + 1) % 4]);
  }

  getSectorId(point: Point): number {
    const offset = point.subtract(this.center());
    if (offset.y <= 0 && abs(offset.x) <= abs(offset.y)) {
      return 0;
    }
    if (offset.x >= 0 && abs(offset.x) >= abs(offset.y)) {
      return 1;
    }
    if (offset.y >= 0 && abs(offset.x) <= abs(offset.y)) {
      return 2;
    }
    if (offset.x <= 0 && abs(offset.x) >= abs(offset.y)) {
      return 3;
    }
    throw new Error('algorithm error');
  }

  getSector(point: Point): Segment {
    return this.getSide(this.getSectorId(point));
  }
}

export = Rect;
