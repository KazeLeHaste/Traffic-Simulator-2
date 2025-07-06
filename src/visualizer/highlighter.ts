import '../helpers';
import Tool = require('./tool');
import settings = require('../settings');

class ToolHighlighter extends Tool {
  public hoveredCell: any;

  constructor(visualizer: any, autobind?: boolean) {
    super(visualizer, autobind);
    this.hoveredCell = null;
  }

  mousemove(e: any): void {
    const cell = this.getCell(e);
    const hoveredIntersection = this.getHoveredIntersection(cell);
    this.hoveredCell = cell;
    
    const intersections = this.visualizer.world.intersections.all();
    for (const id in intersections) {
      intersections[id].color = null;
    }
    
    if (hoveredIntersection) {
      hoveredIntersection.color = settings.colors.hoveredIntersection;
    }
  }

  mouseout(e: any): void {
    this.hoveredCell = null;
  }

  draw(): void {
    if (this.hoveredCell) {
      const color = settings.colors.hoveredGrid;
      this.visualizer.graphics.fillRect(this.hoveredCell, color, 0.5);
    }
  }
}

export = ToolHighlighter;
