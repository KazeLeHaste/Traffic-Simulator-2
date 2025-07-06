import '../helpers';
import $ = require('jquery');
require('jquery-mousewheel');
import _ = require('underscore');
import Point = require('../geom/point');
import Rect = require('../geom/rect');

const METHODS = [
  'click',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseout',
  'mousewheel',
  'contextmenu'
];

class Tool {
  public visualizer: any;
  public ctx: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;
  public isBound: boolean;
  private boundMethods: { [key: string]: (e: any) => void } = {};

  constructor(visualizer: any, autobind?: boolean) {
    this.visualizer = visualizer;
    this.ctx = this.visualizer.ctx;
    this.canvas = this.ctx.canvas;
    this.isBound = false;
    if (autobind) {
      this.bind();
    }
  }

  bind(): void {
    this.isBound = true;
    
    for (const method of METHODS) {
      if ((this as any)[method]) {
        // We need to bind the methods to preserve 'this' context
        this.boundMethods[method] = (this as any)[method].bind(this);
        $(this.canvas).on(method, this.boundMethods[method]);
      }
    }
  }

  unbind(): void {
    this.isBound = false;
    for (const method of METHODS) {
      if (this.boundMethods[method]) {
        $(this.canvas).off(method, this.boundMethods[method]);
      }
    }
    this.boundMethods = {};
  }

  toggleState(): void {
    if (this.isBound) {
      this.unbind();
    } else {
      this.bind();
    }
  }

  draw(): void {
    // Override in subclasses
  }

  getPoint(e: any): Point {
    const rect = this.canvas.getBoundingClientRect();
    const point = new Point(e.clientX - rect.left, e.clientY - rect.top);
    
    // Reduced coordinate debugging - only log on shift+click
    if (e.shiftKey) {
      console.log('🎯 Shift+Click coordinate calculation:');
      console.log('  Event coords:', e.clientX, e.clientY);
      console.log('  Canvas rect:', rect.left, rect.top, rect.width, rect.height);
      console.log('  Canvas size:', this.canvas.width, this.canvas.height);
      console.log('  Calculated point:', point.x, point.y);
    }
    
    return point;
  }

  getCell(e: any): Rect {
    return this.visualizer.zoomer.toCellCoords(this.getPoint(e));
  }

  getHoveredIntersection(cell: Rect): any {
    const intersections = this.visualizer.world.intersections.all();
    for (const id in intersections) {
      const intersection = intersections[id];
      if (intersection.rect.containsRect(cell)) {
        return intersection;
      }
    }
    return null;
  }
}

export = Tool;
