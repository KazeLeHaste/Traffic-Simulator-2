import '../helpers';
import Tool = require('./tool');
import Intersection = require('../model/intersection');
import Rect = require('../geom/rect');
import Point = require('../geom/point');

class ToolIntersectionBuilder extends Tool {
  public tempIntersection: any;
  public mouseDownPos: any;

  constructor(visualizer: any, autobind?: boolean) {
    super(visualizer, autobind);
    this.tempIntersection = null;
    this.mouseDownPos = null;
  }

  mousedown(e: any): void {
    // Simple shift key detection like the original
    if (e.shiftKey) {
      console.log('🟡 SHIFT+CLICK detected - creating intersection');
      
      const rawPoint = new Point(e.clientX - this.canvas.getBoundingClientRect().left, 
                                e.clientY - this.canvas.getBoundingClientRect().top);
      const cell = this.getCell(e);
      
      console.log('🟡 Raw click point:', rawPoint.x, rawPoint.y);
      console.log('🟡 Converted to cell:', cell.x, cell.y, cell.width(), cell.height());
      
      this.mouseDownPos = cell;
      
      // Create intersection exactly like the original
      this.tempIntersection = new Intersection(this.mouseDownPos);
      console.log('🟡 Created temp intersection with rect:', this.tempIntersection.rect.x, this.tempIntersection.rect.y);
      
      // Prevent other tools from handling this event
      e.stopImmediatePropagation();
    }
  }

  mouseup(e: any): void {
    if (this.tempIntersection) {
      console.log('🟡 IntersectionBuilder: Finalizing intersection creation');
      console.log('🟡 Final intersection rect:', this.tempIntersection.rect.x, this.tempIntersection.rect.y, this.tempIntersection.rect.width(), this.tempIntersection.rect.height());
      
      // Check intersection count before adding
      const beforeCount = Object.keys(this.visualizer.world.intersections.all()).length;
      console.log('🟡 Intersection count before adding:', beforeCount);
      
      // Add intersection immediately - no setTimeout delay
      this.visualizer.world.addIntersection(this.tempIntersection);
      
      // Check intersection count after adding
      const afterCount = Object.keys(this.visualizer.world.intersections.all()).length;
      console.log('🟡 Intersection count after adding:', afterCount);
      
      // Force immediate redraw regardless of running state
      this.visualizer.drawSingleFrame();
      
      this.tempIntersection = null;
    }
    this.mouseDownPos = null;
  }

  mousemove(e: any): void {
    if (this.tempIntersection) {
      const currentCell = this.getCell(e);
      // Only resize if we're dragging, preserve minimum size
      if (this.mouseDownPos && (currentCell.x !== this.mouseDownPos.x || currentCell.y !== this.mouseDownPos.y)) {
        const rect = this.visualizer.zoomer.getBoundingBox(this.mouseDownPos, currentCell);
        // Ensure minimum size is maintained
        rect.width(Math.max(rect.width(), 56));
        rect.height(Math.max(rect.height(), 56));
        this.tempIntersection.rect = rect;
      }
    }
  }

  mouseout(e: any): void {
    this.mouseDownPos = null;
    this.tempIntersection = null;
  }

  draw(): void {
    if (this.tempIntersection) {
      this.visualizer.drawIntersection(this.tempIntersection, 0.4);
    }
  }
}

export = ToolIntersectionBuilder;
