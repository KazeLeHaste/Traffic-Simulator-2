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
  public debug: boolean;

  constructor(world: any) {
    this.world = world;
    this.$canvas = $('#canvas');
    this.canvas = this.$canvas[0] as HTMLCanvasElement;
    
    // Canvas setup - minimal logging
    if (!this.canvas) {
      console.error('❌ Canvas element not found!');
      throw new Error('Canvas element with id "canvas" not found');
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
    
    // Create tools in correct order matching the original CoffeeScript
    this.toolRoadbuilder = new ToolRoadBuilder(this, true);
    this.toolIntersectionBuilder = new ToolIntersectionBuilder(this, true);
    this.toolHighlighter = new ToolHighlighter(this, true);
    this.toolIntersectionMover = new ToolIntersectionMover(this, true);
    // Create mover last as fallback for leftover events
    this.toolMover = new ToolMover(this, true);
    
    // Set up more robust event binding that persists across page state changes
    this.ensureToolsAreBound();
    
    this._running = false;
    this.previousTime = 0;
    this.timeFactor = settings.defaultTimeFactor;
    this.debug = false;
    
    // Add window resize listener
    $(window).on('resize', () => {
      this.updateCanvasSize();
    });
  }

  drawIntersection(intersection: any, alpha: number): void {
    const color = intersection.color || settings.colors.intersection;
    
    // Debug intersection drawing - log more frequently during creation
    if (Math.random() < 0.01) { // 1% chance to see what's being drawn
      console.log('🎨 Drawing intersection:', {
        id: intersection.id,
        rect: { x: intersection.rect.x, y: intersection.rect.y, w: intersection.rect.width(), h: intersection.rect.height() },
        color: color,
        alpha: alpha
      });
    }
    
    this.graphics.drawRect(intersection.rect);
    this.ctx.lineWidth = 0.4;
    this.graphics.stroke(settings.colors.roadMarking);
    this.graphics.fillRect(intersection.rect, color, alpha);
  }

  drawSignals(road: any): void {
    const lightsColors = [settings.colors.redLight, settings.colors.greenLight];
    const intersection = road.target;
    const segment = road.targetSide;
    const sideId = road.targetSideId;
    const lights = intersection.controlSignals.state[sideId];

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
      const flipInterval = Math.round(intersection.controlSignals.flipInterval * 100) / 100;
      const phaseOffset = Math.round(intersection.controlSignals.phaseOffset * 100) / 100;
      this.ctx.fillText(flipInterval + ' ' + phaseOffset, center.x, center.y);
      this.ctx.restore();
    }
  }

  drawRoad(road: any, alpha: number): void {
    if (!road.source || !road.target) {
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
    // this.graphics.drawImage(this.carImage, rect);
    this.graphics.fillRect(boundRect, style);
    this.graphics.restore();
    
    if (this.debug) {
      this.ctx.save();
      this.ctx.fillStyle = "black";
      this.ctx.font = "1px Arial";
      this.ctx.fillText(car.id.toString(), center.x, center.y);

      const curve = car.trajectory.temp?.lane;
      if (curve) {
        this.graphics.drawCurve(curve, 0.1, 'red');
      }
      this.ctx.restore();
    }
  }

  drawGrid(): void {
    const gridSize = settings.gridSize;
    const box = this.zoomer.getBoundingBox();
    if (box.area() >= 2000 * gridSize * gridSize) return;
    const sz = 0.4;

    for (let i = box.left(); i <= box.right(); i += gridSize) {
      for (let j = box.top(); j <= box.bottom(); j += gridSize) {
        const rect = new Rect(i - sz / 2, j - sz / 2, sz, sz);
        this.graphics.fillRect(rect, settings.colors.gridPoint);
      }
    }
  }

  updateCanvasSize(): void {
    // Use multiple methods to get accurate window dimensions
    const windowWidth = window.innerWidth || $(window).width() || document.documentElement.clientWidth || 800;
    const windowHeight = window.innerHeight || $(window).height() || document.documentElement.clientHeight || 600;
    
    const currentWidth = this.canvas.width;
    const currentHeight = this.canvas.height;
    
    console.log('🎪 Canvas size check:', {
      current: { width: currentWidth, height: currentHeight },
      target: { width: windowWidth, height: windowHeight },
      needsUpdate: currentWidth !== windowWidth || currentHeight !== windowHeight
    });
    
    if (currentWidth !== windowWidth || currentHeight !== windowHeight) {
      console.log('🎪 Updating canvas size from', currentWidth, 'x', currentHeight, 'to', windowWidth, 'x', windowHeight);
      
      // Set the canvas dimensions directly
      this.canvas.width = windowWidth;
      this.canvas.height = windowHeight;
      
      // Set CSS dimensions to match exactly
      this.canvas.style.width = windowWidth + 'px';
      this.canvas.style.height = windowHeight + 'px';
      
      // Ensure canvas is positioned correctly
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0px';
      this.canvas.style.left = '0px';
      this.canvas.style.display = 'block';
      
      // Update zoomer's screen center when canvas size changes (only if zoomer exists and is initialized)
      if (this.zoomer && this.zoomer.screenCenter) {
        this.zoomer.screenCenter = new Point(windowWidth / 2, windowHeight / 2);
        this.zoomer.center = new Point(windowWidth / 2, windowHeight / 2);
        console.log('🎪 Updated zoomer center to:', windowWidth / 2, windowHeight / 2);
      }
      
      // Force a repaint
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, 1, 1);
      this.ctx.clearRect(0, 0, 1, 1);
    }
  }

  draw = (time: number): void => {
    const delta = (time - this.previousTime) || 0;
    
    if (delta > 30) {
      const adjustedDelta = delta > 100 ? 100 : delta;
      this.previousTime = time;
      
      try {
        // Resume normal world updates - intersection creation is working fine
        this.world.onTick(this.timeFactor * adjustedDelta / 1000);
        
        // Only update canvas size when actually needed, not every frame
        // This might be causing the flickering
        // this.updateCanvasSize();
        
        // FORCE complete transformation reset with fallback
        if (this.ctx.resetTransform) {
          this.ctx.resetTransform();
        } else {
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.save(); // Save the clean state
        
        this.graphics.clear(settings.colors.background);
        
        // Apply zoom transformation
        this.zoomer.transform();
        this.drawGrid();
        
        // ALWAYS get fresh intersection list to ensure new intersections are drawn
        const intersections = this.world.intersections.all();
        const intersectionCount = Object.keys(intersections).length;
        
        // Enhanced debug intersection drawing
        if (Math.random() < 0.02) { // 2% chance to log for better visibility
          console.log('🎨 Draw loop: Drawing', intersectionCount, 'intersections');
          console.log('🎨 Intersection IDs:', Object.keys(intersections));
        }
        
        for (const id in intersections) {
          this.drawIntersection(intersections[id], 0.9);
        }
        
        const roads = this.world.roads.all();
        for (const id in roads) {
          this.drawRoad(roads[id], 0.9);
        }
        
        for (const id in roads) {
          this.drawSignals(roads[id]);
        }
        
        const cars = this.world.cars.all();
        for (const id in cars) {
          this.drawCar(cars[id]);
        }
        
        this.toolIntersectionBuilder.draw();
        this.toolRoadbuilder.draw();
        this.toolHighlighter.draw();
        
        this.ctx.restore(); // Restore to clean state
        
        // Test: Draw a bright red square that should always be visible (after zoom restore)
        this.ctx.fillStyle = '#FF0000'; // Bright red
        this.ctx.fillRect(50, 50, 100, 100);
        
        // Test: Draw intersection count as text - FORCE FRESH COUNT
        const currentIntersectionCount = Object.keys(this.world.intersections.all()).length;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Intersections: ${currentIntersectionCount}`, 10, 30);
        
      } catch (error) {
        console.error('🚨 ERROR in draw cycle:', error);
      }
    }
    
    if (this.running) {
      window.requestAnimationFrame(this.draw);
    }
  }

  ensureToolsAreBound(): void {
    // Immediate binding check - match original order
    const tools = [
      this.toolRoadbuilder,
      this.toolIntersectionBuilder,
      this.toolHighlighter,
      this.toolIntersectionMover,
      this.toolMover
    ];
    
    tools.forEach(tool => {
      if (!tool.isBound) {
        tool.bind();
      }
    });
    
    // Set up periodic check to ensure tools stay bound - reduce frequency to avoid performance issues
    setInterval(() => {
      let needsRebinding = false;
      tools.forEach(tool => {
        if (!tool.isBound) {
          tool.bind();
          needsRebinding = true;
        }
      });
    }, 5000); // Check every 5 seconds instead of every second
    
    // Also re-bind on focus/visibility changes
    $(window).on('focus', () => {
      tools.forEach(tool => {
        if (!tool.isBound) {
          tool.bind();
        }
      });
    });
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
  
  drawSingleFrame(): void {
    // Draw a single frame without starting the animation loop
    // Used when simulation is paused but we need to show changes
    this.draw(performance.now());
  }
}

export = Visualizer;
