/**
 * TrafficLightController
 * 
 * Manages traffic light control for intersections using pluggable strategies.
 * This class replaces the old ControlSignals class with a more modular approach.
 */

import Intersection = require('../intersection');
import { ITrafficControlStrategy, TrafficState } from './ITrafficControlStrategy';
import { trafficControlStrategyManager } from './TrafficControlStrategyManager';
import { kpiCollector } from '../kpi-collector';

class TrafficLightController {
  /** Reference to the controlled intersection */
  public intersection: Intersection;
  
  /** Current simulation time */
  public time: number = 0;
  
  /** The active traffic control strategy */
  private strategy: ITrafficControlStrategy;
  
  /** Traffic state metrics for each approach */
  private trafficStates: TrafficState[] = [];
  
  /**
   * Create a new traffic light controller for an intersection
   */
  constructor(intersection: Intersection) {
    this.intersection = intersection;
    this.strategy = trafficControlStrategyManager.applyToIntersection(intersection);
    this.initializeTrafficStates();
  }
  
  /**
   * Initialize traffic state tracking for each approach
   */
  private initializeTrafficStates(): void {
    // Create a traffic state for each approach (N, E, S, W)
    this.trafficStates = [0, 1, 2, 3].map(() => ({
      queueLength: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      flowRate: 0,
      signalState: [0, 0, 0] // [left, forward, right]
    }));
  }
  
  /**
   * Create a copy of a traffic light controller
   * Used when deserializing world state
   */
  static copy(controller: any, intersection: Intersection): TrafficLightController {
    if (!controller) {
      return new TrafficLightController(intersection);
    }
    
    // Create a proper instance with the correct prototype
    const result = new TrafficLightController(intersection);
    
    // Copy over basic properties
    result.time = controller.time || 0;
    
    // Load the strategy from saved data if available
    if (controller.strategy) {
      result.strategy = trafficControlStrategyManager.createFromJSON(
        controller.strategy,
        intersection
      );
    }
    
    return result;
  }
  
  /**
   * Convert to a serializable object for storage
   */
  toJSON(): any {
    return {
      time: this.time,
      strategy: this.strategy.toJSON()
    };
  }
  
  /**
   * Change the active traffic control strategy
   */
  setStrategy(strategyType: string): boolean {
    if (trafficControlStrategyManager.selectStrategy(strategyType)) {
      this.strategy = trafficControlStrategyManager.applyToIntersection(this.intersection);
      return true;
    }
    return false;
  }
  
  /**
   * Get the current active strategy
   */
  getStrategy(): ITrafficControlStrategy {
    return this.strategy;
  }
  
  /**
   * Get the current traffic light state for all approaches
   * Returns a 2D array: [approach][movement] where:
   * - approach is 0-3 (N, E, S, W)
   * - movement is 0-2 (left, forward, right)
   * - value is 0 (RED) or 1 (GREEN)
   */
  get state(): number[][] {
    return this.strategy.update(0, this.trafficStates);
  }
  
  /**
   * Update traffic states based on KPI metrics
   * This would be called before the update to provide traffic data to strategies
   */
  private updateTrafficStates(): void {
    // Get intersection ID for KPI lookups
    const intersectionId = this.intersection.id;
    
    // In a real implementation, we would get this data from KPI collector
    // For example:
    for (let i = 0; i < this.trafficStates.length; i++) {
      // Get queue metrics for this approach
      // These could be sourced from the KPI collector in a production implementation
      // For now, we'll provide defaults with minimal simulation impact
      this.trafficStates[i].queueLength = 0;
      this.trafficStates[i].averageWaitTime = 0;
      this.trafficStates[i].maxWaitTime = 0;
      this.trafficStates[i].flowRate = 0;
      
      // Copy current signal state
      if (this.state && this.state[i]) {
        this.trafficStates[i].signalState = [...this.state[i]];
      }
    }
  }
  
  /**
   * Update the traffic signals based on elapsed time
   * This is called every tick of the simulation
   */
  onTick = (delta: number): void => {
    // Update time
    this.time += delta;
    
    // Update traffic states before updating strategy
    this.updateTrafficStates();
    
    // Let the strategy update and determine the new signal state
    // The state is calculated on-demand via the state getter
  }
}

export = TrafficLightController;
