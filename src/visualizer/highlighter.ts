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
    try {
      // Skip if visualizer or world are unavailable
      if (!this.visualizer || !this.visualizer.world || !this.visualizer.world.intersections) {
        this.hoveredCell = null; // Reset the hover state if world isn't ready
        return;
      }
      
      // Get cell safely
      const cell = this.getCell(e);
      if (!cell) {
        this.hoveredCell = null; // Reset if no cell detected
        return;
      }
      
      // Only update if cell actually changed
      if (this.hoveredCell && 
          this.hoveredCell.x === cell.x && 
          this.hoveredCell.y === cell.y) {
        return; // Skip if cell hasn't changed to avoid redundant processing
      }
      
      // Update hovered cell
      this.hoveredCell = cell;
      
      // Find intersection under hover
      const hoveredIntersection = this.getHoveredIntersection(cell);
      
      // Safely get intersections with extra verification
      try {
        const intersections = this.visualizer.world.intersections.all() || {};
        
        // Reset all intersection colors
        for (const id in intersections) {
          if (intersections[id]) {
            intersections[id].color = null;
          }
        }
        
        // Set color for hovered intersection
        if (hoveredIntersection) {
          hoveredIntersection.color = settings.colors.hoveredIntersection;
        }
        
        // Force a single redraw if visualizer exists but don't start animation loop
        if (this.visualizer.drawSingleFrame && !this.visualizer.running) {
          this.visualizer.drawSingleFrame();
        }
      } catch (innerError) {
        console.error('🔧 [HIGHLIGHTER ERROR] Error handling intersections:', innerError);
        // Reset state on error
        this.hoveredCell = null;
      }
    } catch (error) {
      console.error('🔧 [HIGHLIGHTER ERROR] mousemove failed:', error);
      this.hoveredCell = null; // Reset on error
    }
  }

  mouseout(e: any): void {
    try {
      // Clear hover state
      this.hoveredCell = null;
      
      // Reset intersection colors
      if (this.visualizer && this.visualizer.world && this.visualizer.world.intersections) {
        const intersections = this.visualizer.world.intersections.all();
        for (const id in intersections) {
          if (intersections[id]) {
            intersections[id].color = null;
          }
        }
        
        // Force a single redraw if visualizer exists but don't start animation loop
        if (this.visualizer.drawSingleFrame && !this.visualizer.running) {
          this.visualizer.drawSingleFrame();
        }
      }
    } catch (error) {
      console.error('🔧 [HIGHLIGHTER ERROR] mouseout failed:', error);
    }
  }

  reset(): void {
    try {
      // Clear hover state
      this.hoveredCell = null;
      
      // Clear any intersection colors
      if (this.visualizer && this.visualizer.world && this.visualizer.world.intersections) {
        const intersections = this.visualizer.world.intersections.all();
        for (const id in intersections) {
          if (intersections[id]) {
            intersections[id].color = null;
          }
        }
      }
    } catch (error) {
      console.error('🔧 [HIGHLIGHTER ERROR] reset failed:', error);
    }
  }

  draw(): void {
    try {
      // Safely check all needed components before drawing
      if (this.hoveredCell && 
          this.visualizer && 
          this.visualizer.graphics && 
          typeof this.visualizer.graphics.fillRect === 'function') {
        
        const color = settings.colors.hoveredGrid;
        this.visualizer.graphics.fillRect(this.hoveredCell, color, 0.5);
      }
    } catch (error) {
      console.error('🔧 [HIGHLIGHTER ERROR] draw failed:', error);
      // Reset state on error to prevent future errors
      this.hoveredCell = null;
    }
  }
}

export = ToolHighlighter;
