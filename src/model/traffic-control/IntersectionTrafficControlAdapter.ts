/**
 * IntersectionTrafficControlAdapter
 * 
 * Adapter class to support a smooth transition between the old ControlSignals system
 * and the new TrafficLightController system. Provides backward compatibility
 * with existing code while using the new modular strategy-based implementation.
 */

import ControlSignals = require('../control-signals');
import Intersection = require('../intersection');
import TrafficLightController = require('./TrafficLightController');

/**
 * This adapter provides backward compatibility between the old ControlSignals
 * and the new TrafficLightController classes
 */
class IntersectionTrafficControlAdapter {
  // Make intersection public to match ControlSignals interface
  public intersection: Intersection;
  private controller: TrafficLightController;
  
  // Properties to maintain backward compatibility with ControlSignals
  public time: number;
  public stateNum: number;
  public lastFlipTime: number;
  public flipMultiplier: number;
  public phaseOffset: number;
  public states: string[][];
  
  constructor(intersection: Intersection) {
    this.intersection = intersection;
    this.controller = new TrafficLightController(intersection);
    
    // Initialize properties for backward compatibility
    this.time = 0;
    this.stateNum = 0;
    this.lastFlipTime = 0;
    this.flipMultiplier = Math.random();
    this.phaseOffset = 100 * Math.random();
    this.states = [
      ['L', '', 'L', ''],
      ['FR', '', 'FR', ''],
      ['', 'L', '', 'L'],
      ['', 'FR', '', 'FR']
    ];
  }
  
  /**
   * Create adapter from existing controller or signals
   */
  static create(controlObject: ControlSignals | TrafficLightController | any, intersection: Intersection): IntersectionTrafficControlAdapter {
    const adapter = new IntersectionTrafficControlAdapter(intersection);
    
    // If it's already a controller, use it directly
    if (controlObject instanceof TrafficLightController) {
      adapter.controller = controlObject;
    }
    // If it's the old control signals, initialize with backward compatibility
    else if (controlObject instanceof ControlSignals) {
      adapter.time = controlObject.time;
      adapter.stateNum = controlObject.stateNum;
      adapter.lastFlipTime = controlObject.lastFlipTime;
      adapter.flipMultiplier = controlObject.flipMultiplier;
      adapter.phaseOffset = controlObject.phaseOffset;
      adapter.states = controlObject.states;
    }
    
    return adapter;
  }
  
  /**
   * Static copy method to match the ControlSignals interface
   * This is required for compatibility with Intersection.copy
   */
  static copy(controlSignals: any, intersection: Intersection): IntersectionTrafficControlAdapter {
    return this.create(controlSignals, intersection);
  }
  
  /**
   * Convert to serializable object for storage
   */
  toJSON(): any {
    return this.controller.toJSON();
  }
  
  /**
   * Get the current traffic light state (for backward compatibility)
   */
  get state(): number[][] {
    return this.controller.state;
  }
  
  /**
   * Get the interval between light changes (for backward compatibility)
   */
  get flipInterval(): number {
    // Return a default value for compatibility with old code
    return 5; // seconds
  }
  
  /**
   * Advance to the next traffic light phase (for backward compatibility)
   */
  flip(): void {
    // No-op - the controller handles this internally
  }
  
  /**
   * Update the traffic signals (passes through to controller)
   */
  onTick(delta: number): void {
    this.controller.onTick(delta);
    // Update compatibility properties
    this.time = this.controller.time;
  }
  
  /**
   * Get the underlying controller
   */
  getController(): TrafficLightController {
    return this.controller;
  }
  
  /**
   * Convert string representation to numeric state array
   * Provided for backward compatibility
   */
  _decode(str: string): number[] {
    const state = [0, 0, 0];
    if (str.includes('L')) state[0] = 1;
    if (str.includes('F')) state[1] = 1;
    if (str.includes('R')) state[2] = 1;
    return state;
  }
}

// Export the class as both default and named export for flexibility
export { IntersectionTrafficControlAdapter };
export default IntersectionTrafficControlAdapter;
