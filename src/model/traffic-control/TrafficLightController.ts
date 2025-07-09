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
    // Return the current state without updating the strategy again
    // The strategy is already updated in onTick
    return this.strategy.getCurrentSignalStates ? 
      this.strategy.getCurrentSignalStates() : 
      this.strategy.update(0, this.trafficStates);
  }
  
  /**
   * Update traffic states based on KPI metrics
   * This fetches real-time data from the KPI collector to inform adaptive strategies
   */
  private updateTrafficStates(): void {
    // Get intersection ID for KPI lookups
    const intersectionId = this.intersection.id;
    
    // Get data from KPI collector
    const metrics = kpiCollector.getMetrics();
    const intersectionMetric = metrics.intersectionMetrics[intersectionId];
    
    // Get lane metrics for all connected roads
    const connectedLanes: { [direction: number]: any[] } = {
      0: [], // North
      1: [], // East
      2: [], // South
      3: []  // West
    };
    
    // Get road directions from intersection
    // Map lanes to their cardinal directions
    if (this.intersection.roads) {
      this.intersection.roads.forEach((road, index) => {
        // Use index % 4 to map to N, E, S, W (0, 1, 2, 3)
        const direction = index % 4;
        
        if (road.lanes) {
          road.lanes.forEach(lane => {
            if (lane.id && metrics.laneMetrics[lane.id]) {
              connectedLanes[direction].push(metrics.laneMetrics[lane.id]);
            }
          });
        }
      });
    }
    
    // Update traffic states with real data
    for (let i = 0; i < this.trafficStates.length; i++) {
      // Get combined metrics for this approach
      const lanesToCheck = connectedLanes[i] || [];
      
      // Aggregate metrics from all lanes for this approach
      let queueLength = 0;
      let totalWaitTime = 0;
      let maxWaitTime = 0;
      let flowRate = 0;
      let count = 0;
      
      lanesToCheck.forEach(laneMetric => {
        queueLength += laneMetric.queueLength || 0;
        totalWaitTime += laneMetric.averageWaitTime || 0;
        maxWaitTime = Math.max(maxWaitTime, laneMetric.averageWaitTime || 0);
        flowRate += laneMetric.throughput || 0;
        count++;
      });
      
      // Update traffic state with real data
      this.trafficStates[i].queueLength = queueLength;
      this.trafficStates[i].averageWaitTime = count > 0 ? totalWaitTime / count : 0;
      this.trafficStates[i].maxWaitTime = maxWaitTime;
      this.trafficStates[i].flowRate = flowRate;
      
      // Copy current signal state
      if (this.state && this.state[i]) {
        this.trafficStates[i].signalState = [...this.state[i]];
      }
      
      // If intersection metrics exist, use them to enhance our data
      if (intersectionMetric) {
        this.trafficStates[i].queueLength = Math.max(
          this.trafficStates[i].queueLength, 
          intersectionMetric.averageQueueLength / 4
        );
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
    
    // Update traffic states with real data from KPI collector
    this.updateTrafficStates();
    
    // Explicitly update the strategy with the latest traffic states
    // This ensures the strategy has the latest data even if state isn't accessed
    this.strategy.update(delta, this.trafficStates);
  }
  
  /**
   * Reset the controller to its initial state
   */
  public reset(): void {
    this.time = 0;
    if (this.strategy && typeof this.strategy.reset === 'function') {
      this.strategy.reset();
    }
    
    // Reset traffic states
    this.initializeTrafficStates();
  }
}

export = TrafficLightController;
