import '../helpers';
import Tool = require('./tool');

class ToolIntersectionMover extends Tool {
  public intersection: any;

  constructor(visualizer: any, autobind?: boolean) {
    super(visualizer, autobind);
    this.intersection = null;
  }

  mousedown(e: any): void {
    // Don't allow intersection moving in simulation mode
    if (!this.visualizer.isBuilderMode) {
      return;
    }
    
    const intersection = this.getHoveredIntersection(this.getCell(e));
    if (intersection) {
      this.intersection = intersection;
      e.stopImmediatePropagation();
    }
  }

  mouseup(e: any): void {
    this.intersection = null;
  }

  mousemove(e: any): void {
    // Don't allow intersection moving in simulation mode
    if (!this.visualizer.isBuilderMode) {
      return;
    }
    
    if (this.intersection) {
      const cell = this.getCell(e);
      this.intersection.rect.left(cell.x);
      this.intersection.rect.top(cell.y);
      this.intersection.update();
    }
  }

  mouseout(e: any): void {
    this.intersection = null;
  }

  draw(): void {
    // No drawing needed for intersection mover tool
  }
}

export = ToolIntersectionMover;
