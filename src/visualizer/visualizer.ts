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
      enabled: false,
      showIds: false,
      showIntersections: true
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
      
      // Debug information display for intersections
      if (this.debug && this.debug.enabled) {
        this.ctx.save();
        this.ctx.fillStyle = "white";
        this.ctx.font = "1.2px Arial";
        this.ctx.textAlign = "center";
        const center = intersection.rect.center();
        
        // Display intersection ID if debug is enabled and showIds is true
        if (this.debug.showIds) {
          // Show shortened ID for cleaner display
          this.ctx.fillText(intersection.id.slice(-3), center.x, center.y - 1);
        }
        
        // Show traffic light timing info if debug.showIntersections is true
        if (this.debug.showIntersections && intersection.controlSignals) {
          if (intersection.controlSignals.flipInterval && intersection.controlSignals.phaseOffset) {
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
      if (!intersection || !intersection.controlSignals || !intersection.controlSignals.state) {
        return;
      }
      
      const segment = road.targetSide;
      const sideId = road.targetSideId;
      
      if (!segment || !segment.center || !segment.length) {
        return;
      }
      
      const lights = intersection.controlSignals.state[sideId];
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
      
      if (this.debug) {
        this.ctx.save();
        this.ctx.fillStyle = "black";
        this.ctx.font = "1px Arial";
        const center = intersection.rect.center();
        if (intersection.controlSignals.flipInterval && intersection.controlSignals.phaseOffset) {
          const flipInterval = Math.round(intersection.controlSignals.flipInterval * 100) / 100;
          const phaseOffset = Math.round(intersection.controlSignals.phaseOffset * 100) / 100;
          this.ctx.fillText(flipInterval + ' ' + phaseOffset, center.x, center.y);
        }
        this.ctx.restore();
      }
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
    const angle = car.direction;
    const center = car.coords;
    const rect = new Rect(0, 0, 1.1 * car.length, 1.7 * car.width);
    rect.center(new Point(0, 0));
    const boundRect = new Rect(0, 0, car.length, car.width);
    boundRect.center(new Point(0, 0));

    this.graphics.save();
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate(angle);
    const l = 0.90 - 0.30 * car.speed / car.maxSpeed;
    const style = chroma(car.color, 0.8, l, 'hsl').hex();
    this.graphics.fillRect(boundRect, style);
    this.graphics.restore();
    
    if (this.debug && this.debug.enabled) {
      this.ctx.save();
      this.ctx.fillStyle = "black";
      this.ctx.font = "1px Arial";
      this.ctx.fillText(car.id, center.x, center.y);

      if (car.trajectory.temp && car.trajectory.temp.lane) {
        this.graphics.drawCurve(car.trajectory.temp.lane, 0.1, 'red');
      }
      this.ctx.restore();
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
    // Calculate time delta - directly from reference
    const delta = (time - this.previousTime) || 0;
    
    if (delta > 30) {
      const adjustedDelta = delta > 100 ? 100 : delta;
      this.previousTime = time;
      
      // Step the world simulation if running
      if (!this.isBuilderMode && this.running && this.world && this.world.onTick) {
        const delta_seconds = this.timeFactor * adjustedDelta / 1000;
        this.world.onTick(delta_seconds);
      }
      
      this.updateCanvasSize();
      this.graphics.clear(settings.colors.background);
      this.graphics.save();
      this.zoomer.transform();
      this.drawGrid();
      
      // Draw intersections
      for (const id in this.world.intersections.all()) {
        const intersection = this.world.intersections.all()[id];
        this.drawIntersection(intersection, 0.9);
      }
      
      // Draw roads
      for (const id in this.world.roads.all()) {
        const road = this.world.roads.all()[id];
        this.drawRoad(road, 0.9);
      }
      
      // Draw traffic signals
      for (const id in this.world.roads.all()) {
        const road = this.world.roads.all()[id];
        this.drawSignals(road);
      }
      
      // Draw cars
      for (const id in this.world.cars.all()) {
        const car = this.world.cars.all()[id];
        this.drawCar(car);
      }
      
      // Draw tools
      this.toolIntersectionBuilder.draw();
      this.toolRoadbuilder.draw();
      this.toolHighlighter.draw();
      this.graphics.restore();
    }
    
    if (this.running) {
      window.requestAnimationFrame(this.draw);
    }
  }

  // Setup the canvas context with proper transformations
  setupContext(): void {
    if (!this.canvas || !this.ctx || !this.zoomer) {
      return;
    }
    
    // Apply zoomer transformations (scale, pan)
    if (this.zoomer) {
      this.zoomer.transform();
    }
  }

  // Draw a single frame without advancing simulation time
  // Useful for updating the UI after changes without ticking the simulation
  drawSingleFrame(): void {
    if (!this.canvas || !this.ctx || !this.zoomer || !this.world) {
      console.warn('🎨 [VIZ WARN] Cannot draw frame - missing required components');
      return;
    }
    
    try {
      // Clear the canvas with a dark background
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Setup camera transform
      this.setupContext();
      
      // ALWAYS DRAW GRID FIRST (especially important for builder mode)
      this.drawGrid();
      
      // ALWAYS DRAW ALL WORLD OBJECTS
      
      // Draw intersections
      const intersections = this.world?.intersections?.all() || {};
      for (const id in intersections) {
        const intersection = intersections[id];
        if (intersection && typeof intersection === 'object') {
          this.drawIntersection(intersection, 0.9);
        }
      }
      
      // Draw roads
      const roads = this.world?.roads?.all() || {};
      for (const id in roads) {
        const road = roads[id];
        if (road && typeof road === 'object') {
          this.drawRoad(road, 0.9);
        }
      }

      // Draw traffic signals
      for (const id in roads) {
        const road = roads[id];
        if (road) {
          this.drawSignals(road);
        }
      }
      
      // Draw cars
      const cars = this.world?.cars?.all() || {};
      for (const id in cars) {
        const car = cars[id];
        if (car && car.alive && typeof car === 'object') {
          this.drawCar(car);
        }
      }
      
      // Draw debug information if enabled
      if (this.debug.enabled) {
        // Draw intersection IDs if enabled
        if (this.debug.showIds) {
          const intersections = this.world?.intersections?.all() || {};
          for (const id in intersections) {
            const intersection = intersections[id];
            if (intersection && intersection.rect) {
              const center = intersection.rect.center();
              this.ctx.save();
              this.ctx.font = '0.8px Arial';
              this.ctx.fillStyle = 'white';
              this.ctx.fillText(id, center.x, center.y);
              this.ctx.restore();
            }
          }
        }
      }
      
    } catch (error) {
      console.error('🎨 [VIZ ERROR] Error drawing single frame:', error);
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

  // Configure tools for either builder or simulation mode
  setMode(isBuilderMode: boolean): void {
    this.isBuilderMode = isBuilderMode;
    
    // First unbind all tools to avoid conflicts
    this.toolRoadbuilder.unbind();
    this.toolIntersectionBuilder.unbind();
    this.toolIntersectionMover.unbind();
    this.toolHighlighter.unbind();
    this.toolMover.unbind();
    
    // Short delay to ensure clean slate before binding
    setTimeout(() => {
      // Set tool availability based on mode
      if (isBuilderMode) {
        // Builder mode: Enable all tools
        this.toolRoadbuilder.bind();
        this.toolIntersectionBuilder.bind();
        this.toolIntersectionMover.bind();
        this.toolHighlighter.bind();
        this.toolMover.bind();
      } else {
        // Simulation mode: Only enable mover (panning) and highlighter tools
        // Explicitly prioritize the mover tool in simulation mode
        this.toolMover.bind();
        this.toolHighlighter.bind();
      }
      
      console.log(`🎨 [VIZ INFO] Mode set to: ${isBuilderMode ? 'Builder' : 'Simulation'}, toolMover bound: ${this.toolMover.isBound}`);
    }, 50);
  }

  ensureToolsAreBound(): void {
    console.log('🔧 [TOOLS DEBUG] ensureToolsAreBound() called');
    
    // Clear any existing interval to prevent duplicates
    if (this.toolCheckInterval) {
      clearInterval(this.toolCheckInterval);
    }
    
    // Set initial tool state based on mode
    this.setMode(this.isBuilderMode);
    
    // Periodically check tool binding to ensure they stay properly bound
    this.toolCheckInterval = setInterval(() => {
      // This is a safety measure to ensure tools don't lose binding
      if (this.isBuilderMode) {
        if (!this.toolRoadbuilder.isBound) this.toolRoadbuilder.bind();
        if (!this.toolIntersectionBuilder.isBound) this.toolIntersectionBuilder.bind();
        if (!this.toolIntersectionMover.isBound) this.toolIntersectionMover.bind();
      }
      
      // These should always be bound
      if (!this.toolHighlighter.isBound) this.toolHighlighter.bind();
      if (!this.toolMover.isBound) this.toolMover.bind();
    }, 5000) as any; // Check every 5 seconds
  }

  bindTools(): void {
    // Use a more efficient binding approach that won't cause unnecessary redraws
    const currentMode = this.isBuilderMode ? 'builder' : 'simulation';
    
    // Only use tools in builder mode - simulation mode should have minimal events
    if (this.isBuilderMode) {
      // Bind the appropriate tools for builder mode
      this.toolRoadbuilder.bind();
      this.toolIntersectionBuilder.bind();
      this.toolHighlighter.bind();
      this.toolIntersectionMover.bind();
      this.toolMover.bind();
    } else {
      // In simulation mode, we only need basic movement controls
      // Unbind all tools that might be causing extra redraws
      if (this.toolRoadbuilder) this.toolRoadbuilder.unbind();
      if (this.toolIntersectionBuilder) this.toolIntersectionBuilder.unbind();
      if (this.toolHighlighter) this.toolHighlighter.unbind();
      if (this.toolIntersectionMover) this.toolIntersectionMover.unbind();
      
      // Only keep the mover tool for panning
      if (this.toolMover) this.toolMover.bind();
    }
    
    console.log(`🔧 Tools bound for ${currentMode} mode`);
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
  
  // Force a redraw without animation
  forceRedraw(): void {
    // Get current time for frame timing
    const now = performance.now();
    
    // Use 16ms as default delta (60fps equivalent) for single frame
    const delta = 16; 
    
    try {
      // Clear canvas with proper background color
      this.graphics.clear(settings.colors.background);
      
      // Save clean state
      this.ctx.save(); 
      
      // Apply zoom transformation
      if (this.zoomer) {
        this.zoomer.transform();
      }
      
      // Draw grid (always)
      this.drawGrid();
      
      // Draw intersections
      const intersections = this.world?.intersections?.all() || {};
      for (const id in intersections) {
        const intersection = intersections[id];
        if (intersection) {
          this.drawIntersection(intersection, 0.9);
        }
      }
      
      // Draw roads
      const roads = this.world?.roads?.all() || {};
      for (const id in roads) {
        const road = roads[id];
        if (road) {
          this.drawRoad(road, 0.9);
        }
      }

      // Draw traffic signals
      for (const id in roads) {
        const road = roads[id];
        if (road) {
          this.drawSignals(road);
        }
      }
      
      // Draw cars
      const cars = this.world?.cars?.all() || {};
      for (const id in cars) {
        const car = cars[id];
        if (car) {
          this.drawCar(car);
        }
      }
      
      // Restore clean state
      this.ctx.restore();
    } catch (error) {
      console.error('🎨 [VIZ ERROR] Error in drawSingleFrame:', error);
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

  // Cleanup method to properly clean up resources when navigating away
  destroy(): void {
    // Stop the animation frame
    this.stop();
    
    // Clear any intervals to prevent memory leaks
    if (this.toolCheckInterval) {
      clearInterval(this.toolCheckInterval);
      this.toolCheckInterval = null;
    }
    
    // Unbind all tools to remove event listeners
    if (this.toolRoadbuilder) this.toolRoadbuilder.unbind();
    if (this.toolIntersectionBuilder) this.toolIntersectionBuilder.unbind();
    if (this.toolHighlighter) this.toolHighlighter.unbind();
    if (this.toolIntersectionMover) this.toolIntersectionMover.unbind();
    if (this.toolMover) this.toolMover.unbind();
    
    // Remove window resize listener
    $(window).off('resize');
    
    console.log('🎨 [VIZ INFO] Visualizer resources cleaned up');
  }
}

export = Visualizer;
