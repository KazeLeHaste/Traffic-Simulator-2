/**
 * ITrafficControlStrategy
 * 
 * Interface defining the contract that all traffic control strategies must implement.
 * Each strategy represents a different approach to controlling traffic signals at an intersection.
 */

import Intersection = require('../intersection');

/**
 * Represents the traffic state at a specific side of an intersection
 */
export interface TrafficState {
  /** Number of waiting vehicles */
  queueLength: number;
  /** Average waiting time of vehicles in seconds */
  averageWaitTime: number;
  /** Maximum waiting time of any vehicle in seconds */
  maxWaitTime: number;
  /** Traffic flow rate (vehicles per minute) */
  flowRate: number;
  /** Signal state [left, forward, right] where 1 means allowed and 0 means prohibited */
  signalState: number[];
}

/**
 * Interface defining the contract that all traffic control strategies must implement.
 */
export interface ITrafficControlStrategy {
  /** Unique identifier for this strategy type */
  readonly strategyType: string;
  
  /** Human-readable name for displaying in UI */
  readonly displayName: string;
  
  /** Description of how this strategy works */
  readonly description: string;
  
  /**
   * Initialize the traffic control strategy for a specific intersection.
   * This is called when the strategy is first applied to an intersection.
   * 
   * @param intersection The intersection to control
   */
  initialize(intersection: Intersection): void;
  
  /**
   * Update the traffic signals based on current traffic conditions.
   * This is called on each simulation tick.
   * 
   * @param delta Time elapsed since last update (in seconds)
   * @param trafficStates Current traffic states for each approach (N, E, S, W)
   * @returns Updated signal states for each approach [N, E, S, W] as arrays of [L, F, R]
   */
  update(delta: number, trafficStates?: TrafficState[]): number[][];
  
  /**
   * Reset the strategy to its initial state.
   * Called when simulation is reset.
   */
  reset(): void;
  
  /**
   * Get the current phase number of the traffic signal.
   * Useful for visualization and debugging.
   */
  getCurrentPhase(): number;
  
  /**
   * Get the total number of phases in the cycle.
   */
  getTotalPhases(): number;
  
  /**
   * Get strategy-specific configuration options that can be adjusted.
   * Returns an object where keys are option names and values are the current settings.
   */
  getConfigOptions(): Record<string, any>;
  
  /**
   * Update strategy-specific configuration options.
   * @param options Object with updated option values
   */
  updateConfig(options: Record<string, any>): void;
  
  /**
   * Convert the strategy to a JSON-serializable object for saving
   */
  toJSON(): any;
  
  /**
   * Create an instance from JSON data (companion to toJSON)
   * This would typically be implemented as a static method on the concrete class.
   * @param data JSON data created by toJSON
   * @param intersection The intersection to control
   */
  fromJSON?(data: any, intersection: Intersection): ITrafficControlStrategy;
}
