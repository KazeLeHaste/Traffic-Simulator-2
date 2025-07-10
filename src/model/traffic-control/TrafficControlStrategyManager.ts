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
import { TrafficEnforcerStrategy } from './TrafficEnforcerStrategy';

/**
 * Strategy settings type for saving/loading
 */
export interface StrategySettings {
  [key: string]: any;
}

/**
 * Manages traffic control strategies in the simulation
 */
export class TrafficControlStrategyManager {
  /** Available strategies indexed by type */
  private strategies: Map<string, new () => ITrafficControlStrategy> = new Map();
  
  /** Currently selected strategy type */
  private selectedStrategyType: string = 'fixed-timing';
  
  /** Strategy settings cache for reproducibility */
  private strategySettings: Map<string, StrategySettings> = new Map();

  /**
   * Initialize the strategy manager with default strategies
   */
  constructor() {
    // Register all available strategies
    this.registerStrategy('fixed-timing', FixedTimingStrategy);
    this.registerStrategy('adaptive-timing', AdaptiveTimingStrategy);
    this.registerStrategy('traffic-enforcer', TrafficEnforcerStrategy);
    
    // Initialize default strategy settings
    this.initializeDefaultSettings();
  }
  
  /**
   * Initialize default settings for each strategy
   */
  private initializeDefaultSettings(): void {
    this.strategySettings.set('fixed-timing', {
      cycleTime: 30, // Default cycle time in seconds
      greenPhaseRatio: 0.45, // Default green phase ratio
      yellowPhaseRatio: 0.1, // Default yellow phase ratio
    });
    
    this.strategySettings.set('adaptive-timing', {
      minGreenTime: 10,
      maxGreenTime: 60,
      yellowTime: 3,
      vehicleWeightFactor: 1.0,
      waitTimeWeightFactor: 0.5,
    });
    
    this.strategySettings.set('traffic-enforcer', {
      decisionInterval: 5, // How often to make decisions (seconds)
      queueThreshold: 5, // Number of vehicles that constitute a queue
      minGreenTime: 10, // Minimum green time before switching
    });
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
   * Get a concrete instance of a strategy by name
   * @param strategyType The type of strategy to get
   * @returns A new instance of the requested strategy
   */
  getStrategy(strategyType: string): ITrafficControlStrategy | null {
    const StrategyClass = this.strategies.get(strategyType);
    if (!StrategyClass) {
      return null;
    }
    return new StrategyClass();
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
   * Get the settings for a specific strategy
   * @param strategyType The type of strategy
   * @returns The settings for the strategy
   */
  getStrategySettings(strategyType: string): StrategySettings | null {
    return this.strategySettings.get(strategyType) || null;
  }
  
  /**
   * Apply strategy settings
   * @param strategyType The type of strategy
   * @param settings The settings to apply
   */
  applyStrategySettings(strategyType: string, settings: StrategySettings): void {
    if (!this.strategies.has(strategyType)) {
      console.warn(`Strategy type '${strategyType}' not found`);
      return;
    }
    
    // Store the settings
    this.strategySettings.set(strategyType, { 
      ...this.getStrategySettings(strategyType), 
      ...settings 
    });
    
    // If this is the currently selected strategy, notify any listeners (future enhancement)
    if (strategyType === this.selectedStrategyType) {
      // Future: Emit event or notify subscribers
    }
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
