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

  // Debounce mouse move to reduce excessive redraws
  private lastMoveTime: number = 0;
  private readonly MOVE_THROTTLE_MS: number = 30; // Limit to ~30fps for moves

  mousemove(e: any): void {
    // Throttle mouse move events to reduce canvas redraws
    const now = Date.now();
    if (now - this.lastMoveTime < this.MOVE_THROTTLE_MS) {
      return;
    }
    this.lastMoveTime = now;

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
