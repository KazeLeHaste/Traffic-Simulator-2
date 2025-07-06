import '../helpers';
import Tool = require('./tool');

class ToolMover extends Tool {
  public startPosition: any;

  constructor(visualizer: any, autobind?: boolean) {
    super(visualizer, autobind);
    this.startPosition = null;
  }

  contextmenu(e: any): boolean {
    return false;
  }

  mousedown(e: any): void {
    // Always handle mousedown like the original - let other tools stop propagation first
    this.startPosition = this.getPoint(e);
    e.stopImmediatePropagation();
  }

  mouseup(e: any): void {
    this.startPosition = null;
  }

  mousemove(e: any): void {
    if (this.startPosition) {
      const currentPosition = this.getPoint(e);
      const offset = currentPosition.subtract(this.startPosition);
      this.visualizer.zoomer.moveCenter(offset);
      this.startPosition = currentPosition;
    }
  }

  mouseout(e: any): void {
    this.startPosition = null;
  }

  draw(): void {
    // No drawing needed for mover tool
  }
}

export = ToolMover;
