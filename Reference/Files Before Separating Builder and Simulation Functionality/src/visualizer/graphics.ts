import '../helpers';
import Point = require('../geom/point');
import Rect = require('../geom/rect');

const { PI } = Math;

class Graphics {
  public ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  fillRect(rect: Rect, style?: string, alpha?: number): void {
    if (style) {
      this.ctx.fillStyle = style;
    }
    const _alpha = this.ctx.globalAlpha;
    if (alpha !== undefined) {
      this.ctx.globalAlpha = alpha;
    }
    this.ctx.fillRect(rect.left(), rect.top(), rect.width(), rect.height());
    this.ctx.globalAlpha = _alpha;
  }

  drawRect(rect: Rect): void {
    const vertices = rect.getVertices();
    this.ctx.beginPath();
    this.moveTo(vertices[0]);
    for (let i = 1; i < vertices.length; i++) {
      this.lineTo(vertices[i]);
    }
    this.ctx.closePath();
  }

  drawImage(image: HTMLImageElement, rect: Rect): void {
    this.ctx.drawImage(image, rect.left(), rect.top(), rect.width(), rect.height());
  }

  clear(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  moveTo(point: Point): void {
    this.ctx.moveTo(point.x, point.y);
  }

  lineTo(point: Point): void {
    this.ctx.lineTo(point.x, point.y);
  }

  drawLine(source: Point, target: Point): void {
    this.ctx.beginPath();
    this.moveTo(source);
    this.lineTo(target);
  }

  drawSegment(segment: any): void {
    this.drawLine(segment.source, segment.target);
  }

  drawCurve(curve: any, width?: number, color?: string): void {
    const pointsNumber = 10;
    if (width) {
      this.ctx.lineWidth = width;
    }
    this.ctx.beginPath();
    this.moveTo(curve.getPoint(0));
    for (let i = 0; i <= pointsNumber; i++) {
      const point = curve.getPoint(i / pointsNumber);
      this.lineTo(point);
    }
    if (curve.O) {
      this.moveTo(curve.O);
      this.ctx.arc(curve.O.x, curve.O.y, width || 1, 0, 2 * PI);
    }
    if (curve.Q) {
      this.moveTo(curve.Q);
      this.ctx.arc(curve.Q.x, curve.Q.y, width || 1, 0, 2 * PI);
    }
    if (color) {
      this.stroke(color);
    }
  }

  drawTriangle(p1: Point, p2: Point, p3: Point): void {
    this.ctx.beginPath();
    this.moveTo(p1);
    this.lineTo(p2);
    this.lineTo(p3);
  }

  fill(style: string, alpha?: number): void {
    this.ctx.fillStyle = style;
    const _alpha = this.ctx.globalAlpha;
    if (alpha !== undefined) {
      this.ctx.globalAlpha = alpha;
    }
    this.ctx.fill();
    this.ctx.globalAlpha = _alpha;
  }

  stroke(style: string): void {
    this.ctx.strokeStyle = style;
    this.ctx.stroke();
  }

  polyline(...points: Point[]): void {
    if (points.length >= 1) {
      this.ctx.beginPath();
      this.moveTo(points[0]);
      for (let i = 1; i < points.length; i++) {
        this.lineTo(points[i]);
      }
      this.ctx.closePath();
    }
  }

  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }
}

export = Graphics;
