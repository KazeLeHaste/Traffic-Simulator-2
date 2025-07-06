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
  public isBuilderMode: boolean = false; // New property to control simulation behavior

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
    
    this.graphics.drawRect(intersection.rect);
    this.ctx.lineWidth = 0.4;
    this.graphics.stroke(settings.colors.roadMarking);
    this.graphics.fillRect(intersection.rect, color, alpha);
  }

  drawSignals(road: any): void {
    // Safety checks to prevent errors
    if (!road || !road.target || !road.target.controlSignals || !road.targetSide) {
      return;
    }
    
    const intersection = road.target;
    const segment = road.targetSide;
    const sideId = road.targetSideId;
    
    // Additional safety checks
    if (!intersection.controlSignals.state || !segment || sideId === undefined) {
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
    const delta = (time - this.previousTime) || 0;
    
    if (delta > 30) {
      const adjustedDelta = delta > 100 ? 100 : delta;
      this.previousTime = time;
      
      try {
        // Only update world simulation if NOT in builder mode
        if (!this.isBuilderMode) {
          this.world.onTick(this.timeFactor * adjustedDelta / 1000);
        }
        
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
        const intersections = this.world?.intersections?.all() || {};
        const intersectionCount = Object.keys(intersections).length;
        
        for (const id in intersections) {
          const intersection = intersections[id];
          if (intersection) {
            this.drawIntersection(intersection, 0.9);
          }
        }
        
        const roads = this.world?.roads?.all() || {};
        for (const id in roads) {
          const road = roads[id];
          if (road) {
            this.drawRoad(road, 0.9);
          }
        }
        
        // Draw signals with proper safety checks
        for (const id in roads) {
          const road = roads[id];
          if (road && road.target && road.target.controlSignals) {
            try {
              this.drawSignals(road);
            } catch (error) {
              // Silently skip problematic signals to prevent console spam
            }
          }
        }
        
        const cars = this.world?.cars?.all() || {};
        // Only draw cars if NOT in builder mode
        if (!this.isBuilderMode) {
          for (const id in cars) {
            this.drawCar(cars[id]);
          }
        }
        
        // Draw tools for builder interaction
        if (this.toolIntersectionBuilder && this.toolIntersectionBuilder.draw) {
          this.toolIntersectionBuilder.draw();
        }
        if (this.toolRoadbuilder && this.toolRoadbuilder.draw) {
          this.toolRoadbuilder.draw();
        }
        if (this.toolHighlighter && this.toolHighlighter.draw) {
          this.toolHighlighter.draw();
        }
        
        this.ctx.restore(); // Restore to clean state
        
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
  
  // Method to force a single frame draw without starting animation loop
  drawSingleFrame(): void {
    this.draw(performance.now());
  }
}

export = Visualizer;
