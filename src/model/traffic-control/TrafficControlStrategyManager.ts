/**
 * TrafficControlStrategyManager
 * 
 * Manages traffic control strategies, allowing for registration, selection,
 * and applying strategies to intersections.
 */

import Intersection = require('../intersection');
import { ITrafficControlStrategy } from './ITrafficControlStrategy';
import { FixedTimingStrategy } from './FixedTimingStrategy';
import { AdaptiveTimingStrategy } from './AdaptiveTimingStrategy';
import { AllRedFlashingStrategy } from './AllRedFlashingStrategy';
import { TrafficEnforcerStrategy } from './TrafficEnforcerStrategy';

/**
 * Manages traffic control strategies in the simulation
 */
export class TrafficControlStrategyManager {
  /** Available strategies indexed by type */
  private strategies: Map<string, new () => ITrafficControlStrategy> = new Map();
  
  /** Currently selected strategy type */
  private selectedStrategyType: string = 'fixed-timing';

  /**
   * Initialize the strategy manager with default strategies
   */
  constructor() {
    // Register all available strategies
    this.registerStrategy('fixed-timing', FixedTimingStrategy);
    this.registerStrategy('adaptive-timing', AdaptiveTimingStrategy);
    this.registerStrategy('all-red-flashing', AllRedFlashingStrategy);
    this.registerStrategy('traffic-enforcer', TrafficEnforcerStrategy);
  }

  /**
   * Register a new traffic control strategy
   * @param type Unique identifier for the strategy
   * @param strategyClass Constructor for the strategy class
   */
  registerStrategy(type: string, strategyClass: new () => ITrafficControlStrategy): void {
    this.strategies.set(type, strategyClass);
  }

  /**
   * Get a list of available strategy types
   */
  getAvailableStrategyTypes(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Set the currently selected strategy
   * @param strategyType The type of strategy to select
   * @returns true if successful, false if the strategy type doesn't exist
   */
  selectStrategy(strategyType: string): boolean {
    if (this.strategies.has(strategyType)) {
      this.selectedStrategyType = strategyType;
      return true;
    }
    return false;
  }

  /**
   * Get the currently selected strategy type
   */
  getSelectedStrategyType(): string {
    return this.selectedStrategyType;
  }

  /**
   * Create a new instance of the currently selected strategy
   */
  createStrategy(): ITrafficControlStrategy {
    const StrategyClass = this.strategies.get(this.selectedStrategyType);
    if (!StrategyClass) {
      throw new Error(`Strategy type '${this.selectedStrategyType}' not registered`);
    }
    return new StrategyClass();
  }

  /**
   * Apply the currently selected strategy to an intersection
   * @param intersection The intersection to apply the strategy to
   */
  applyToIntersection(intersection: Intersection): ITrafficControlStrategy {
    const strategy = this.createStrategy();
    strategy.initialize(intersection);
    return strategy;
  }

  /**
   * Create a strategy from saved data
   * @param data Serialized strategy data from toJSON
   * @param intersection The intersection to control
   */
  createFromJSON(data: any, intersection: Intersection): ITrafficControlStrategy {
    if (!data || !data.strategyType) {
      // Default to fixed timing if no valid data
      return this.applyToIntersection(intersection);
    }
    
    const StrategyClass = this.strategies.get(data.strategyType);
    if (!StrategyClass) {
      console.warn(`Strategy type '${data.strategyType}' not found, using default`);
      return this.applyToIntersection(intersection);
    }
    
    // Create an instance and initialize from data
    const strategy = new StrategyClass();
    return strategy.fromJSON ? strategy.fromJSON(data, intersection) : strategy;
  }
}

// Create a singleton instance
export const trafficControlStrategyManager = new TrafficControlStrategyManager();
