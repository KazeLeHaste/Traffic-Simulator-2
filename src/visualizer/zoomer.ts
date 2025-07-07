import '../helpers';
import $ = require('jquery');
import 'jquery-mousewheel';
import Point = require('../geom/point');
import Rect = require('../geom/rect');
import settings = require('../settings');

const { min, max } = Math;

class Zoomer {
  public defaultZoom: number;
  public visualizer: any;
  public ctx: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;
  private _scale: number;
  public screenCenter: Point;
  public center: Point;

  constructor(defaultZoom: number, visualizer: any, autobind?: boolean) {
    this.defaultZoom = defaultZoom;
    this.visualizer = visualizer;
    this.ctx = this.visualizer.ctx;
    this.canvas = this.ctx.canvas;
    this._scale = 1;
    
    // Get canvas dimensions, with fallbacks
    const width = this.canvas.width || 800;
    const height = this.canvas.height || 600;
    
    this.screenCenter = new Point(width / 2, height / 2);
    this.center = new Point(width / 2, height / 2);
    
    // Bind mousewheel event for zooming
    if (autobind) {
      $(this.canvas).on('mousewheel DOMMouseScroll wheel', this.mousewheel.bind(this));
    }
  }

  get scale(): number {
    return this._scale;
  }

  set scale(scale: number) {
    this.zoom(scale, this.screenCenter);
  }

  toCellCoords(point: Point): Rect {
    const gridSize = settings.gridSize;
    const centerOffset = point.subtract(this.center).divide(this.scale).divide(this.defaultZoom);
    const x = Math.floor(centerOffset.x / gridSize) * gridSize;
    const y = Math.floor(centerOffset.y / gridSize) * gridSize;
    return new Rect(x, y, gridSize, gridSize);
  }

  getBoundingBox(cell1?: Rect, cell2?: Rect): Rect {
    cell1 = cell1 || this.toCellCoords(new Point(0, 0));
    cell2 = cell2 || this.toCellCoords(new Point(this.canvas.width, this.canvas.height));
    const xMin = min(cell1.left(), cell2.left());
    const xMax = max(cell1.right(), cell2.right());
    const yMin = min(cell1.top(), cell2.top());
    const yMax = max(cell1.bottom(), cell2.bottom());
    return new Rect(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  transform(): void {
    // Ensure we have valid center coordinates
    if (!this.center) {
      this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
    }
    
    // Apply translation to center
    this.ctx.translate(this.center.x, this.center.y);
    
    // Apply scaling
    const k = this.scale * this.defaultZoom;
    this.ctx.scale(k, k);
  }

  zoom(k?: number, zoomCenter?: Point): void {
    k = k || 1;
    if (zoomCenter) {
      const offset = this.center.subtract(zoomCenter);
      this.center = zoomCenter.add(offset.mult(k / this._scale));
    }
    this._scale = k;
  }

  moveCenter(offset: Point): void {
    this.center = this.center.add(offset);
  }

  mousewheel(e: any): void {
    // Reduced logging to prevent console spam
    // console.log('🔷 Zoomer mousewheel event detected:', e.type, 'deltaY:', e.deltaY, 'wheelDelta:', e.originalEvent?.wheelDelta);
    e.preventDefault();
    
    const originalEvent = e.originalEvent || e;
    let deltaY = originalEvent.deltaY || -e.deltaY || e.detail || 0;
    
    // Handle different wheel event formats
    if (originalEvent.wheelDelta) {
      deltaY = -originalEvent.wheelDelta;
    }
    
    // Normalize wheel delta
    if (originalEvent.deltaMode === 1) { // DOM_DELTA_LINE
      deltaY *= 40;
    } else if (originalEvent.deltaMode === 2) { // DOM_DELTA_PAGE
      deltaY *= 800;
    }
    
    const zoomFactor = Math.pow(2, -0.001 * deltaY);
    const newScale = this.scale * zoomFactor;
    
    // console.log('🔷 Zoom calculation: deltaY=', deltaY, 'zoomFactor=', zoomFactor, 'newScale=', newScale);
    
    // Constrain zoom levels
    if (newScale > 0.05 && newScale < 5) {
      const rect = this.canvas.getBoundingClientRect();
      const mousePoint = new Point(e.clientX - rect.left, e.clientY - rect.top);
      // console.log('🔷 Applying zoom at point:', mousePoint.x, mousePoint.y);
      this.zoom(newScale, mousePoint);
    } else {
      // console.log('🔷 Zoom level constrained:', newScale);
    }
  }
}

export = Zoomer;
