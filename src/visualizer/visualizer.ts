import '../helpers';
import $ = require('jquery');
import _ = require('underscore');
import chroma = require('chroma-js');
import Point = require('../geom/point');
import Rect = require('../geom/rect');
import Graphics = require('./graphics');
import ToolMover = require('./mover');
import ToolIntersectionMover = require('./intersection-mover');
import ToolIntersectionBuilder = require('./intersection-builder');
import ToolRoadBuilder = require('./road-builder');
import ToolHighlighter = require('./highlighter');
import Zoomer = require('./zoomer');
import settings = require('../settings');
import Pool = require('../model/pool');
import Car = require('../model/car');
import Road = require('../model/road');
import Intersection = require('../model/intersection');

const { PI } = Math;

class Visualizer {
  public world: any;
  public $canvas: any;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public carImage: HTMLImageElement;
  public zoomer: Zoomer;
  public graphics: Graphics;
  public toolRoadbuilder: ToolRoadBuilder;
  public toolIntersectionBuilder: ToolIntersectionBuilder;
  public toolHighlighter: ToolHighlighter;
  public toolIntersectionMover: ToolIntersectionMover;
  public toolMover: ToolMover;
  private _running: boolean;
  public previousTime: number;
  public timeFactor: number;
  public debug: {
    enabled: boolean;
    showIds: boolean;
    showIntersections: boolean;
  };
  public isBuilderMode: boolean = false; // New property to control simulation behavior
  private toolCheckInterval: number | null = null; // Track interval to prevent duplicates
  private _errorCount: number = 0; // Track consecutive errors for error recovery

  constructor(world: any, canvasId: string = 'canvas') {
    this.world = world;
    
    // Ensure draw method is properly bound to this instance
    this.draw = this.draw.bind(this);
    
    // Get the canvas that should exist (created by page component)
    this.$canvas = $(`#${canvasId}`);
    this.canvas = this.$canvas[0] as HTMLCanvasElement;
    
    // Canvas setup
    if (!this.canvas) {
      console.error(`❌ Canvas element with id "${canvasId}" not found!`);
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    
    this.ctx = this.canvas.getContext('2d')!;
    if (!this.ctx) {
      console.error('❌ Canvas 2D context not available!');
      throw new Error('Could not get 2D context from canvas');
    }

    this.carImage = new Image();
    this.carImage.src = 'images/car.png';

    this.updateCanvasSize();
    this.zoomer = new Zoomer(4, this, true);
    this.graphics = new Graphics(this.ctx);
    
    // IMPORTANT: Create tools in correct order - mover must be created LAST so it's the fallback
    this.toolRoadbuilder = new ToolRoadBuilder(this, false); // Don't autobind in simulation mode
    this.toolIntersectionBuilder = new ToolIntersectionBuilder(this, false); // Don't autobind in simulation mode
    this.toolHighlighter = new ToolHighlighter(this, true); // Always allow highlighting
    this.toolIntersectionMover = new ToolIntersectionMover(this, false); // Don't autobind in simulation mode
    // Mover is ALWAYS enabled to allow panning in both builder and simulation modes
    this.toolMover = new ToolMover(this, true);
    
    // Set up more robust event binding that persists across page state changes
    this.ensureToolsAreBound();
    
    this._running = false;
    this.previousTime = 0;
    this.timeFactor = settings.defaultTimeFactor;
    this.debug = {
      enabled: false, // Disable debug by default
      showIds: false, // Disable showing IDs by default
      showIntersections: false // Disable showing intersection details by default
    };
    
    // Add window resize listener
    $(window).on('resize', () => {
      this.updateCanvasSize();
    });
  }

  drawIntersection(intersection: any, alpha: number): void {
    try {
      if (!intersection) {
        console.warn('🎨 [VIZ WARN] Invalid intersection passed to drawIntersection');
        return;
      }
      
      if (!intersection.rect) {
        console.warn('🎨 [VIZ WARN] Intersection missing rect:', intersection.id);
        return;
      }
      
      const color = intersection.color || settings.colors.intersection;
      
      this.graphics.drawRect(intersection.rect);
      this.ctx.lineWidth = 0.4;
      this.graphics.stroke(settings.colors.roadMarking);
      this.graphics.fillRect(intersection.rect, color, alpha);
      
      // Get center point of intersection for emoji placement
      const center = intersection.rect.center();
      
      // Add traffic control emoji based on the active strategy
      this.ctx.save();
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      
      // Determine which emoji to use based on traffic control strategy
      let trafficControlEmoji = '🚦'; // Default fixed timing traffic light
      let strategyType = 'fixed-timing'; // Default strategy
      
      if (intersection.trafficLightController) {
        const strategy = intersection.trafficLightController.getStrategy();
        strategyType = strategy.strategyType;
        
        if (strategyType === 'adaptive-timing') {
          trafficControlEmoji = '🚥'; // Adaptive timing traffic light
        } else if (strategyType === 'traffic-enforcer') {
          trafficControlEmoji = '👮'; // Traffic enforcer
        }
      }
      
      // Adjust font size based on intersection dimensions
      const rectSize = Math.min(intersection.rect.width(), intersection.rect.height());
      const fontSize = rectSize * 0.5; // Reduced to 50% of intersection size (was 70%)
      
      this.ctx.font = `${fontSize}px Arial`;
      this.ctx.fillText(trafficControlEmoji, center.x, center.y);
      this.ctx.restore();
      
      // Debug information display for intersections (only if explicitly enabled)
      if (this.debug && this.debug.enabled) {
        this.ctx.save();
        this.ctx.fillStyle = "white";
        this.ctx.font = "1.2px Arial";
        this.ctx.textAlign = "center";
        
        // Display intersection ID if debug is enabled and showIds is true
        if (this.debug.showIds) {
          // Show shortened ID for cleaner display
          this.ctx.fillText(intersection.id.slice(-3), center.x, center.y - 1);
        }
        
        // Show traffic light timing info if debug.showIntersections is true
        if (this.debug.showIntersections) {
          if (intersection.trafficLightController) {
            // Show strategy type and phase for new controllers
            const strategy = intersection.trafficLightController.getStrategy();
            const strategyType = strategy.strategyType;
            const phase = strategy.getCurrentPhase();
            const totalPhases = strategy.getTotalPhases();
            
            this.ctx.fillText(`${strategyType}|${phase+1}/${totalPhases}`, center.x, center.y + 1);
          } 
          else if (intersection.controlSignals && 
                  intersection.controlSignals.flipInterval && 
                  intersection.controlSignals.phaseOffset) {
            // Fallback for legacy control signals
            const flipInterval = Math.round(intersection.controlSignals.flipInterval * 10) / 10;
            const phaseOffset = Math.round(intersection.controlSignals.phaseOffset * 10) / 10;
            this.ctx.fillText(`${flipInterval}|${phaseOffset}`, center.x, center.y + 1);
          }
        }
        this.ctx.restore();
      }
    } catch (error) {
      console.error('🎨 [VIZ ERROR] Failed to draw intersection:', intersection?.id, error);
      throw error;
    }
  }

  drawSignals(road: any): void {
    // Comprehensive safety checks to prevent errors
    try {
      if (!road || !road.target || !road.targetSide || road.targetSideId === undefined) {
        return;
      }
      
      const intersection = road.target;
      if (!intersection) {
        return;
      }
      
      const segment = road.targetSide;
      const sideId = road.targetSideId;
      
      if (!segment || !segment.center || !segment.length) {
        return;
      }
      
      // Get signals from the new traffic light controller if available, otherwise fall back to legacy
      let lights;
      if (intersection.trafficLightController) {
        lights = intersection.getSignalState()[sideId];
      } else if (intersection.controlSignals && intersection.controlSignals.state) {
        lights = intersection.controlSignals.state[sideId];
      } else {
        return;
      }
      if (!lights || !Array.isArray(lights)) {
        return;
      }

      this.ctx.save();
      this.ctx.translate(segment.center.x, segment.center.y);
      this.ctx.rotate((sideId + 1) * PI / 2);
      this.ctx.scale(1 * segment.length, 1 * segment.length);
      
      // map lane ending to [(0, -0.5), (0, 0.5)]
      if (lights[0]) {
        this.graphics.drawTriangle(
          new Point(0.1, -0.2),
          new Point(0.2, -0.4),
          new Point(0.3, -0.2)
        );
        this.graphics.fill(settings.colors.greenLight);
      }
      if (lights[1]) {
        this.graphics.drawTriangle(
          new Point(0.3, -0.1),
          new Point(0.5, 0),
          new Point(0.3, 0.1)
        );
        this.graphics.fill(settings.colors.greenLight);
      }
      if (lights[2]) {
        this.graphics.drawTriangle(
          new Point(0.1, 0.2),
          new Point(0.2, 0.4),
          new Point(0.3, 0.2)
        );
        this.graphics.fill(settings.colors.greenLight);
      }
      this.ctx.restore();
      
      // Debug information for signals is completely disabled
      // No signal timing details will be shown
    } catch (error) {
      // Silently handle drawing errors to prevent console spam
    }
  }

  drawRoad(road: any, alpha: number): void {
    try {
      if (!road) {
        console.warn('🎨 [VIZ WARN] Invalid road passed to drawRoad');
        return;
      }
      
      if (!road.source || !road.target) {
        console.error('🎨 [VIZ ERROR] Road missing source or target:', road.id, {
          source: !!road.source,
          target: !!road.target
        });
        throw new Error('invalid road');
      }
      
      const sourceSide = road.sourceSide;
      const targetSide = road.targetSide;

    this.ctx.save();
    this.ctx.lineWidth = 0.4;
    const leftLine = road.leftmostLane.leftBorder;
    this.graphics.drawSegment(leftLine);
    this.graphics.stroke(settings.colors.roadMarking);

    const rightLine = road.rightmostLane.rightBorder;
    this.graphics.drawSegment(rightLine);
    this.graphics.stroke(settings.colors.roadMarking);
    this.ctx.restore();

    this.graphics.polyline(sourceSide.source, sourceSide.target,
      targetSide.source, targetSide.target);
    this.graphics.fill(settings.colors.road, alpha);

    this.ctx.save();
    for (let i = 1; i < road.lanes.length; i++) {
      const lane = road.lanes[i];
      const line = lane.rightBorder;
      const dashSize = 1;
      this.graphics.drawSegment(line);
      this.ctx.lineWidth = 0.2;
      this.ctx.lineDashOffset = 1.5 * dashSize;
      this.ctx.setLineDash([dashSize]);
      this.graphics.stroke(settings.colors.roadMarking);
    }
    this.ctx.restore();
    
    } catch (error) {
      console.error('🎨 [VIZ ERROR] Failed to draw road:', road?.id, error);
      throw error;
    }
  }

  drawCar(car: any): void {
    try {
      // Safety checks to avoid errors
      if (!car || !car.coords || car.direction === undefined) {
        console.warn('🎨 [VIZ WARN] Invalid car data in drawCar');
        return;
      }
    
      const angle = car.direction;
      const center = car.coords;
      const rect = new Rect(0, 0, 1.1 * car.length, 1.7 * car.width);
      rect.center(new Point(0, 0));
      const boundRect = new Rect(0, 0, car.length, car.width);
      boundRect.center(new Point(0, 0));
  
      this.graphics.save();
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(angle);
      
      // Calculate color - ensure we have valid values to prevent black cars
      let style = '#FF0000'; // Default to red if there's an issue
      try {
        // Make sure speed and maxSpeed are numbers to prevent NaN issues
        const speed = typeof car.speed === 'number' ? car.speed : 0;
        const maxSpeed = typeof car.maxSpeed === 'number' && car.maxSpeed > 0 ? car.maxSpeed : 1;
        
        // Calculate a luminance value that can't go too dark
        const l = Math.max(0.4, 0.90 - 0.30 * speed / maxSpeed);
        
        // Use the car's color or a default if not present
        const carColor = car.color || '#3388FF';
        style = chroma(carColor, 0.8, l, 'hsl').hex();
      } catch (colorError) {
        // Fallback to a visible color if there's an issue with chroma
        style = '#FF4433';
      }
      
      // Draw the car with the calculated or fallback style
      this.graphics.fillRect(boundRect, style);
      
      // Draw vehicle emoji based on car size and color
      this.ctx.save();
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      
      // Select emoji based on vehicle size and other attributes
      let emoji = '🚗'; // Default car emoji
      
      // Use different emojis based on car dimensions
      if (car.length > 4.5) {
        emoji = '🚚'; // Truck for longer vehicles
      } else if (car.length > 3.8) {
        emoji = '🚙'; // SUV for medium-sized vehicles
      } else if (car.length < 3.2 && car.width < 1.6) {
        emoji = '🏍️'; // Motorcycle for smaller vehicles
      } else if (car.color === 60) { // Yellow hue in HSL
        emoji = '🚕'; // Taxi for yellow cars
      } else if (car.length > 3.5 && car.width > 2.0) {
        emoji = '🚌'; // Bus for wider vehicles
      }
      
      // Adjust font size based on car dimensions
      const fontSize = Math.min(car.length, car.width) * 0.9;
      this.ctx.font = `${fontSize}px Arial`;
      
      // Draw the emoji centered within the car
      this.ctx.fillText(emoji, 0, 0);
      this.ctx.restore();
      
      this.graphics.restore();
      
      // Debug information is completely disabled for clean visualization
      // No car IDs or trajectory paths will be shown
    } catch (error) {
      console.error('🎨 [VIZ ERROR] Error in drawCar:', error);
      // Continue execution - don't let one car crash the whole render
    }
  }

  drawGrid(): void {
    const gridSize = settings.gridSize;
    
    // Calculate grid bounds that will be visible on screen
    const halfWidth = this.canvas.width / 2;
    const halfHeight = this.canvas.height / 2;
    const scale = this.zoomer.scale * this.zoomer.defaultZoom;
    
    // Calculate visible world coordinates
    const visibleLeft = -halfWidth / scale;
    const visibleRight = halfWidth / scale;
    const visibleTop = -halfHeight / scale;
    const visibleBottom = halfHeight / scale;
    
    const sz = 2; // Grid point size
    
    // Draw grid within visible bounds
    for (let i = Math.floor(visibleLeft / gridSize) * gridSize; i <= visibleRight; i += gridSize) {
      for (let j = Math.floor(visibleTop / gridSize) * gridSize; j <= visibleBottom; j += gridSize) {
        const rect = new Rect(i - sz / 2, j - sz / 2, sz, sz);
        this.graphics.fillRect(rect, settings.colors.gridPoint);
      }
    }
  }

  updateCanvasSize(): void {
    // Get the canvas container dimensions instead of full window
    const canvasContainer = this.canvas.parentElement;
    if (!canvasContainer) return;
    
    const containerRect = canvasContainer.getBoundingClientRect();
    const targetWidth = Math.max(containerRect.width, 600);
    const targetHeight = Math.max(containerRect.height, 400);
    
    const currentWidth = this.canvas.width;
    const currentHeight = this.canvas.height;
    
    if (currentWidth !== targetWidth || currentHeight !== targetHeight) {
      // Set the canvas dimensions to fit the container
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
      
      // Set CSS dimensions to fill the container
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      
      // Ensure canvas is positioned correctly within its container
      this.canvas.style.position = 'relative';
      this.canvas.style.display = 'block';
      
      // Update zoomer's screen center when canvas size changes (only if zoomer exists and is initialized)
      if (this.zoomer && this.zoomer.screenCenter) {
        this.zoomer.screenCenter = new Point(targetWidth / 2, targetHeight / 2);
        this.zoomer.center = new Point(targetWidth / 2, targetHeight / 2);
      }
      
      // Force a repaint
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, 1, 1);
      this.ctx.clearRect(0, 0, 1, 1);
    }
  }

  draw = (time: number): void => {
    // Calculate time delta - capped for stability
    const delta = (time - this.previousTime) || 0;
    
    // Process draw cycle at stable frame rate
    if (delta > 16) { // ~60fps target rate
      const adjustedDelta = Math.min(delta, 100); // Cap at 100ms for stability
      this.previousTime = time;
      
      try {
        // FORCE complete transformation reset with fallback
        if (this.ctx.resetTransform) {
          this.ctx.resetTransform();
        } else {
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        // Clear canvas with proper background color - ensure it's always clearing with the right color
        this.graphics.clear(settings.colors.background);
        
        this.ctx.save(); // Save the clean state
        
        // Apply zoom transformation
        if (this.zoomer) {
          this.zoomer.transform();
        }
        
        // ALWAYS draw these elements regardless of simulation state
        this.drawGrid();
        
        // Step the world simulation if running in simulation mode
        if (!this.isBuilderMode && this.running && this.world && this.world.onTick) {
          try {
            console.log('🎨 [SIM DEBUG] Calling world.onTick() with delta:', this.timeFactor * adjustedDelta / 1000);
            console.log('🎨 [SIM DEBUG] Current carsNumber:', this.world.carsNumber);
            console.log('🎨 [SIM DEBUG] Current cars count:', Object.keys(this.world?.cars?.all() || {}).length);
            
            this.world.onTick(this.timeFactor * adjustedDelta / 1000);
            
            console.log('🎨 [SIM DEBUG] After onTick, cars count:', Object.keys(this.world?.cars?.all() || {}).length);
          } catch (simError) {
            console.error('🎨 [SIM ERROR] Error in simulation tick:', simError);
            console.error('🎨 [SIM ERROR] Stack trace:', simError.stack);
            // Continue rendering even if simulation step fails
          }
        }
        
        // ALWAYS DRAW ALL WORLD OBJECTS, regardless of simulation state or errors
        // This ensures we never get a black canvas during simulation
        
        // Draw intersections
        const intersections = this.world?.intersections?.all() || {};
        for (const id in intersections) {
          const intersection = intersections[id];
          try {
            if (intersection && typeof intersection === 'object') {
              this.drawIntersection(intersection, 0.9);
            }
          } catch (error) {
            // Log but continue with other elements
            console.error('🎨 [VIZ ERROR] Failed to draw intersection:', id, error);
          }
        }
        
        // Draw roads
        const roads = this.world?.roads?.all() || {};
        for (const id in roads) {
          const road = roads[id];
          try {
            if (road && typeof road === 'object') {
              this.drawRoad(road, 0.9);
            }
          } catch (error) {
            // Log but continue with other elements
            console.error('🎨 [VIZ ERROR] Failed to draw road:', id, error);
          }
        }

        // Draw traffic signals for roads
        for (const id in roads) {
          const road = roads[id];
          try {
            if (road) {
              this.drawSignals(road);
            }
          } catch (error) {
            // Log but continue with other elements
            console.error('🎨 [VIZ ERROR] Failed to draw signals:', id, error);
          }
        }
        
        // Draw cars - CRITICAL for simulation visibility
        // Specifically handle cars in a way that avoids skipping them during simulation
        try {
          // Double check that cars collection exists and has vehicles
          const cars = this.world?.cars?.all() || {};
          const carCount = Object.keys(cars).length;
          
          // Always try to draw cars, regardless of builder/simulation mode
          // This ensures vehicles are visible during simulation
          for (const id in cars) {
            try {
              if (cars[id]) {
                this.drawCar(cars[id]);
              }
            } catch (carError) {
              // Log but continue with other cars - don't let one bad car ruin everything
              console.error('🎨 [VIZ ERROR] Failed to draw car:', id, carError);
            }
          }
          
          // If in simulation mode but no cars were found, try to refresh them
          if (!this.isBuilderMode && this.running && carCount === 0 && this.world?.refreshCars) {
            console.log('🎨 [VIZ DEBUG] No cars found in simulation mode, trying to refresh');
            try {
              this.world.refreshCars();
            } catch (refreshError) {
              console.error('🎨 [VIZ ERROR] Failed to refresh cars:', refreshError);
            }
          }
        } catch (carsError) {
          console.error('🎨 [VIZ ERROR] Error processing cars:', carsError);
        }
        
        // Draw builder tools last (only relevant in builder mode)
        if (this.isBuilderMode) {
          if (this.toolIntersectionBuilder && this.toolIntersectionBuilder.draw) {
            this.toolIntersectionBuilder.draw();
          }
          if (this.toolRoadbuilder && this.toolRoadbuilder.draw) {
            this.toolRoadbuilder.draw();
          }
          if (this.toolHighlighter && this.toolHighlighter.draw) {
            this.toolHighlighter.draw();
          }
        }
        
        this.ctx.restore(); // Restore to clean state
        
      } catch (error) {
        console.error('🎨 [VIZ ERROR] ERROR in draw cycle:', error);
        
        // Recovery: try to clear the canvas with the right color
        try {
          this.ctx.resetTransform();
          this.graphics.clear(settings.colors.background);
        } catch (clearError) {
          console.error('🎨 [VIZ ERROR] ERROR clearing canvas during recovery:', clearError);
        }
      }
    }
    
    // ALWAYS request the next frame when running - this is critical for simulation
    if (this.running) {
      window.requestAnimationFrame(this.draw);
    }
  }

  unbindAllTools(): void {
    console.log('🔧 [TOOLS DEBUG] unbindAllTools() called');
    
    const tools = [
      this.toolRoadbuilder,
      this.toolIntersectionBuilder,
      this.toolHighlighter,
      this.toolIntersectionMover,
      this.toolMover
    ];
    
    tools.forEach((tool) => {
      if (tool && tool.isBound) {
        try {
          console.log('🔧 [TOOLS DEBUG] Unbinding tool:', tool.constructor.name);
          tool.unbind();
        } catch (error) {
          console.error('🔧 [TOOLS ERROR] Failed to unbind tool:', error);
        }
      }
    });
    
    console.log('🔧 [TOOLS DEBUG] unbindAllTools() completed');
  }

  resetToolStates(): void {
    console.log('🔧 [TOOLS DEBUG] resetToolStates() called');
    
    const tools = [
      this.toolRoadbuilder,
      this.toolIntersectionBuilder,
      this.toolHighlighter,
      this.toolIntersectionMover,
      this.toolMover
    ];
    
    tools.forEach((tool) => {
      if (tool) {
        try {
          // Reset highlighter state specifically
          if ((tool as any).hoveredCell !== undefined) {
            console.log('🔧 [TOOLS DEBUG] Resetting hoveredCell for tool');
            (tool as any).hoveredCell = null;
          }
          
          // Reset any other tool-specific state
          if (typeof (tool as any).reset === 'function') {
            console.log('🔧 [TOOLS DEBUG] Calling tool.reset() method');
            (tool as any).reset();
          }
          
        } catch (error) {
          console.error('🔧 [TOOLS ERROR] Failed to reset tool state:', error);
        }
      }
    });
    
    // Clear any intersection colors that might be stuck
    if (this.world && this.world.intersections) {
      const intersections = this.world.intersections.all();
      for (const id in intersections) {
        if (intersections[id]) {
          intersections[id].color = null;
        }
      }
    }
    
    console.log('🔧 [TOOLS DEBUG] resetToolStates() completed');
  }

  ensureToolsAreBound(): void {
    console.log('🔧 [TOOLS DEBUG] ensureToolsAreBound() called');
    
    // Clear any existing tool check intervals first
    if (this.toolCheckInterval !== null) {
      clearInterval(this.toolCheckInterval);
      this.toolCheckInterval = null;
    }
    
    const tools = [
      this.toolRoadbuilder,
      this.toolIntersectionBuilder,
      this.toolHighlighter,
      this.toolIntersectionMover,
      this.toolMover
    ];
    
    // Properly unbind all tools first to ensure clean state
    tools.forEach((tool) => {
      if (tool && tool.isBound) {
        try {
          console.log('🔧 [TOOLS DEBUG] Unbinding tool to rebind:', tool.constructor.name);
          tool.unbind();
        } catch (error) {
          console.error('🔧 [TOOLS ERROR] Failed to unbind tool:', error);
        }
      }
    });
    
    // Now bind all tools
    tools.forEach((tool) => {
      if (tool) {
        try {
          console.log('🔧 [TOOLS DEBUG] Binding tool:', tool.constructor.name);
          tool.bind();
        } catch (error) {
          console.error('🔧 [TOOLS ERROR] Failed to bind tool:', error);
        }
      }
    });
    
    console.log('🔧 [TOOLS DEBUG] ensureToolsAreBound() completed');
  }

  get running(): boolean {
    return this._running;
  }

  set running(running: boolean) {
    if (running) {
      this.start();
    } else {
      this.stop();
    }
  }

  start(): void {
    if (!this._running) {
      this._running = true;
      this.draw(0);
    }
  }

  stop(): void {
    this._running = false;
  }
  
  // Method to force a single frame draw without starting animation loop
  drawSingleFrame(): void {
    console.log('🎨 [VIZ DEBUG] drawSingleFrame() called');
    
    try {
      // Force a complete redraw by calling draw with current time
      const currentTime = performance.now();
      this.previousTime = currentTime - 33; // ~30fps timing for smooth single frame
      
      // Store current running state
      const wasRunning = this.running;
      
      // Temporarily disable running flag to prevent animation loop
      this._running = false;
      
      // Ensure transformation is reset
      if (this.ctx.resetTransform) {
        this.ctx.resetTransform();
      } else {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      // Clear with proper background to ensure no black canvas
      this.graphics.clear(settings.colors.background);
      
      // Draw the frame with a larger delta to ensure all elements are drawn
      this.draw(currentTime);
      
      // If the canvas is still black or appears incorrect, force another full redraw
      setTimeout(() => {
        if (this.ctx && this.canvas) {
          // Check a pixel to see if it's black (this is a heuristic)
          const pixelData = this.ctx.getImageData(this.canvas.width/2, this.canvas.height/2, 1, 1).data;
          const isBlack = pixelData[0] < 20 && pixelData[1] < 20 && pixelData[2] < 20;
          
          if (isBlack) {
            console.log('🎨 [VIZ DEBUG] Canvas appears black, forcing another redraw');
            // Force a complete redraw cycle
            if (this.ctx.resetTransform) {
              this.ctx.resetTransform();
            } else {
              this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            this.graphics.clear(settings.colors.background);
            this.draw(performance.now());
          }
        }
        
        // Restore original running state
        this._running = wasRunning;
        
        // If it was running, ensure animation loop continues
        if (wasRunning) {
          window.requestAnimationFrame(this.draw);
        }
      }, 50);
    } catch (error) {
      console.error('🎨 [VIZ ERROR] drawSingleFrame failed:', error);
      
      // Recovery attempt - reset running state
      this._running = false;
      
      // Try a simple redraw to recover
      try {
        this.ctx.resetTransform();
        this.graphics.clear(settings.colors.background);
      } catch (e) {
        console.error('🎨 [VIZ ERROR] Recovery failed:', e);
      }
    }
  }

  // Method to force canvas refresh after state changes
  forceRefresh(): void {
    console.log('🎨 [VIZ DEBUG] forceRefresh() called');
    
    try {
      // Safety check - don't proceed if critical components are missing
      if (!this.canvas || !this.ctx || !this.graphics) {
        console.error('🎨 [VIZ ERROR] Missing required objects for refresh');
        return;
      }
      
      // Store current state
      const wasRunning = this._running;
      
      // First, stop any running animation
      if (wasRunning) {
        this._running = false;
      }
      
      // Force transformation reset
      if (this.ctx.resetTransform) {
        this.ctx.resetTransform();
      } else {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      // Clear with proper background - use a known good color
      this.ctx.fillStyle = settings.colors.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Then use the graphics method for proper clearing
      this.graphics.clear(settings.colors.background);
      
      // Ensure the world state is valid - check for cars, roads, and intersections
      if (this.world) {
        // Make sure pools are accessible
        if (!this.world.cars || !this.world.cars.all) {
          console.warn('🎨 [VIZ WARN] Cars pool missing or invalid - recreating');
          this.world.cars = this.world.cars || new Pool(Car);
        }
        
        if (!this.world.roads || !this.world.roads.all) {
          console.warn('🎨 [VIZ WARN] Roads pool missing or invalid - recreating');
          this.world.roads = this.world.roads || new Pool(Road);
        }
        
        if (!this.world.intersections || !this.world.intersections.all) {
          console.warn('🎨 [VIZ WARN] Intersections pool missing or invalid - recreating');
          this.world.intersections = this.world.intersections || new Pool(Intersection);
        }
      }
      
      // Reset and rebind tools to ensure clean state
      this.unbindAllTools();
      this.resetToolStates();
      
      // Wait briefly to ensure all DOM operations complete
      setTimeout(() => {
        try {
          // Rebind all tools
          this.ensureToolsAreBound();
          
          // Draw a single frame first to ensure canvas is rendered
          this.drawSingleFrame();
          
          // After the single frame draw, if we should be running
          // wait a bit then restore animation state
          if (wasRunning) {
            setTimeout(() => {
              this._running = true;
              window.requestAnimationFrame(this.draw);
              console.log('🎨 [VIZ DEBUG] Animation loop restarted');
            }, 100);
          }
          
          console.log('🎨 [VIZ DEBUG] forceRefresh() completed successfully');
        } catch (innerError) {
          console.error('🎨 [VIZ ERROR] Inner forceRefresh operation failed:', innerError);
        }
      }, 100);
    } catch (error) {
      console.error('🎨 [VIZ ERROR] forceRefresh failed:', error);
      
      // Emergency recovery
      try {
        if (this.ctx && this.graphics) {
          this.ctx.resetTransform();
          this.graphics.clear('#333333'); // Use a different color to show recovery
        }
      } catch (e) {
        console.error('🎨 [VIZ ERROR] Emergency recovery failed:', e);
      }
    }
  }

  // Debug method to check world state
  debugWorldState(): void {
    console.log('🔍 DEBUG: World State Check:');
    console.log('  - World exists:', !!this.world);
    console.log('  - Intersections pool:', !!this.world?.intersections);
    console.log('  - Roads pool:', !!this.world?.roads);
    console.log('  - Cars pool:', !!this.world?.cars);
    
    if (this.world?.intersections) {
      const intersections = this.world.intersections.all();
      console.log('  - Intersections count:', Object.keys(intersections || {}).length);
      if (Object.keys(intersections || {}).length > 0) {
        console.log('  - First intersection:', Object.values(intersections || {})[0]);
      }
    }
    
    if (this.world?.roads) {
      const roads = this.world.roads.all();
      console.log('  - Roads count:', Object.keys(roads || {}).length);
      if (Object.keys(roads || {}).length > 0) {
        console.log('  - First road:', Object.values(roads || {})[0]);
      }
    }
    
    if (this.world?.cars) {
      const cars = this.world.cars.all();
      console.log('  - Cars count:', Object.keys(cars || {}).length);
    }
  }

  // Cleanup method to prevent memory leaks
  destroy(): void {
    // Stop any running animation
    this.stop();
    
    // Clear tool check interval
    if (this.toolCheckInterval) {
      clearInterval(this.toolCheckInterval);
      this.toolCheckInterval = null;
    }
    
    // Unbind tools
    const tools = [
      this.toolRoadbuilder,
      this.toolIntersectionBuilder,
      this.toolHighlighter,
      this.toolIntersectionMover,
      this.toolMover
    ];
    
    tools.forEach(tool => {
      if (tool && tool.unbind) {
        tool.unbind();
      }
    });
  }

  // DEBUG: Simple canvas test method (removed to prevent red background flash)
  // testCanvasRendering(): void {
  //   console.log('🧪 Testing basic canvas rendering...');
  //   
  //   // Clear any existing transforms
  //   this.ctx.resetTransform();
  //   
  //   // Clear canvas with solid color
  //   this.ctx.fillStyle = '#ff0000';
  //   this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  //   
  //   // Draw test shapes at screen coordinates
  //   this.ctx.fillStyle = '#00ff00';
  //   this.ctx.fillRect(50, 50, 200, 100);
  //   
  //   this.ctx.fillStyle = '#0000ff';
  //   this.ctx.fillRect(300, 200, 150, 100);
  //   
  //   // Draw large visible text
  //   this.ctx.fillStyle = '#ffffff';
  //   this.ctx.font = 'bold 30px Arial';
  //   this.ctx.fillText('CANVAS TEST OK!', 50, 150);
  //   
  //   this.ctx.font = 'bold 20px Arial';
  //   this.ctx.fillText('Canvas size: ' + this.canvas.width + 'x' + this.canvas.height, 50, 180);
  //   
  //   console.log('🧪 Basic canvas test completed - should be RED with GREEN/BLUE boxes');
  // }
  
  // Method to set the time factor (simulation speed)
  setTimeFactor(factor: number): void {
    if (typeof factor !== 'number' || isNaN(factor)) {
      console.error('Invalid time factor:', factor);
      return;
    }
    console.log('Setting time factor to:', factor);
    this.timeFactor = Math.max(0.1, Math.min(5.0, factor)); // Clamp between 0.1 and 5.0
  }
}

export = Visualizer;
