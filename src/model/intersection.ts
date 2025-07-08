import '../helpers';
import _ = require('underscore');
import Rect = require('../geom/rect');
import TrafficLightController = require('./traffic-control/TrafficLightController');
import ControlSignals = require('./control-signals'); // Keep for backward compatibility

class Intersection {
  public rect: Rect;
  public id: string;
  public roads: any[];
  public inRoads: any[];
  public trafficLightController: TrafficLightController;
  
  // For backward compatibility
  public get controlSignals(): any {
    console.warn('Deprecated: controlSignals is deprecated. Use trafficLightController instead.');
    return this._legacyControlSignals;
  }
  
  public set controlSignals(value: any) {
    console.warn('Deprecated: Setting controlSignals is deprecated. Use trafficLightController instead.');
    this._legacyControlSignals = value;
  }
  
  private _legacyControlSignals: any;

  constructor(rect: Rect) {
    this.rect = rect;
    this.id = _.uniqueId('intersection');
    this.roads = [];
    this.inRoads = [];
    
    // Initialize the traffic light controller
    this.trafficLightController = new TrafficLightController(this);
    
    // Initialize legacy control signals for backward compatibility
    this._legacyControlSignals = new ControlSignals(this);
  }

  static copy(intersection: any): Intersection {
    intersection.rect = Rect.copy(intersection.rect);
    const result = Object.create(Intersection.prototype);
    _.extend(result, intersection);
    result.roads = [];
    result.inRoads = [];
    
    // Initialize the traffic light controller with the intersection
    if (intersection.trafficLightController) {
      result.trafficLightController = TrafficLightController.copy(
        intersection.trafficLightController, 
        result
      );
    } else {
      result.trafficLightController = new TrafficLightController(result);
    }
    
    // For backward compatibility
    if (intersection.controlSignals) {
      result._legacyControlSignals = ControlSignals.copy(intersection.controlSignals, result);
    } else {
      result._legacyControlSignals = new ControlSignals(result);
    }
    
    return result;
  }

  toJSON(): any {
    return {
      id: this.id,
      rect: this.rect,
      trafficLightController: this.trafficLightController,
      // Include controlSignals for backward compatibility
      controlSignals: this._legacyControlSignals
    };
  }

  update(): void {
    // Update connected roads
    for (const road of this.roads) {
      road.update();
    }
    for (const road of this.inRoads) {
      road.update();
    }
  }
  
  /**
   * Process a simulation tick
   * @param delta Time elapsed since last tick in seconds
   */
  onTick(delta: number): void {
    // Delegate to the traffic light controller
    if (this.trafficLightController) {
      this.trafficLightController.onTick(delta);
    }
    
    // For backward compatibility
    if (this._legacyControlSignals && this._legacyControlSignals.onTick) {
      this._legacyControlSignals.onTick(delta);
    }
  }
  
  /**
   * Get the current traffic signal state
   * @returns A 2D array where [approach][movement] represents the signal state
   *          (0 = RED, 1 = GREEN) for each approach (N,E,S,W) and movement (L,F,R)
   */
  getSignalState(): number[][] {
    // Get state from the traffic light controller
    if (this.trafficLightController) {
      return this.trafficLightController.state;
    }
    
    // Fallback to legacy control signals for backward compatibility
    if (this._legacyControlSignals) {
      return this._legacyControlSignals.state;
    }
    
    // Default to all red if no controller is available
    return [[0,0,0], [0,0,0], [0,0,0], [0,0,0]];
  }
  
  /**
   * Set the traffic control strategy
   * @param strategyType The type of strategy to use
   * @returns True if the strategy was successfully applied, false otherwise
   */
  setTrafficControlStrategy(strategyType: string): boolean {
    if (this.trafficLightController) {
      return this.trafficLightController.setStrategy(strategyType);
    }
    return false;
  }
}

export = Intersection;
