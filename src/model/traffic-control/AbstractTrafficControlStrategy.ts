/**
 * AbstractTrafficControlStrategy
 * 
 * Base class for implementing traffic control strategies.
 * Provides common functionality and default implementations.
 */

import Intersection = require('../intersection');
import { ITrafficControlStrategy, TrafficState } from './ITrafficControlStrategy';

/**
 * Abstract base class for traffic control strategies
 */
export abstract class AbstractTrafficControlStrategy implements ITrafficControlStrategy {
  /** Unique identifier for this strategy type */
  abstract readonly strategyType: string;
  
  /** Human-readable name for displaying in UI */
  abstract readonly displayName: string;
  
  /** Description of how this strategy works */
  abstract readonly description: string;
  
  /** Reference to the intersection being controlled */
  protected intersection: Intersection | null = null;
  
  /** Current phase number */
  protected currentPhase: number = 0;
  
  /** Total phases in cycle */
  protected totalPhases: number = 4;
  
  /** Time elapsed in current phase */
  protected timeInPhase: number = 0;
  
  /** Time when current phase should end */
  protected nextPhaseChangeTime: number = 0;
  
  /** Base duration for each phase (can be overridden by concrete implementations) */
  protected phaseDuration: number = 30; // seconds
  
  /** Configuration options specific to this strategy */
  protected configOptions: Record<string, any> = {};
  
  /**
   * Initialize the traffic control strategy for a specific intersection
   */
  initialize(intersection: Intersection): void {
    this.intersection = intersection;
    this.reset();
  }
  
  /**
   * Update the traffic signals based on current traffic conditions
   */
  update(delta: number, trafficStates?: TrafficState[]): number[][] {
    // Increment time in current phase
    this.timeInPhase += delta;
    
    // Check if it's time to change phases
    if (this.shouldSwitchPhase(trafficStates)) {
      this.advanceToNextPhase();
    }
    
    // Return current signal states
    return this.getCurrentSignalStates();
  }
  
  /**
   * Reset the strategy to its initial state
   */
  reset(): void {
    this.currentPhase = 0;
    this.timeInPhase = 0;
    this.nextPhaseChangeTime = this.getPhaseDuration();
  }
  
  /**
   * Get the current phase number
   */
  getCurrentPhase(): number {
    return this.currentPhase;
  }
  
  /**
   * Get the total number of phases
   */
  getTotalPhases(): number {
    return this.totalPhases;
  }
  
  /**
   * Get configuration options
   */
  getConfigOptions(): Record<string, any> {
    return { ...this.configOptions };
  }
  
  /**
   * Get the current signal states without updating
   * This method exposes the protected method to satisfy the interface
   */
  getCurrentSignalStates(): number[][] {
    return this.getSignalStates();
  }
  
  /**
   * Update configuration options
   */
  updateConfig(options: Record<string, any>): void {
    this.configOptions = { ...this.configOptions, ...options };
  }
  
  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      strategyType: this.strategyType,
      currentPhase: this.currentPhase,
      timeInPhase: this.timeInPhase,
      totalPhases: this.totalPhases,
      phaseDuration: this.phaseDuration,
      configOptions: this.configOptions
    };
  }
  
  /**
   * Create from JSON
   */
  fromJSON(data: any, intersection: Intersection): ITrafficControlStrategy {
    throw new Error('Method must be implemented by concrete strategy class');
  }
  
  /**
   * Check if the signal phase should be changed
   * Can be overridden by concrete implementations for more sophisticated logic
   */
  protected shouldSwitchPhase(trafficStates?: TrafficState[]): boolean {
    return this.timeInPhase >= this.nextPhaseChangeTime;
  }
  
  /**
   * Advance to the next phase
   */
  protected advanceToNextPhase(): void {
    this.currentPhase = (this.currentPhase + 1) % this.totalPhases;
    this.timeInPhase = 0;
    this.nextPhaseChangeTime = this.getPhaseDuration();
  }
  
  /**
   * Get the duration for the current phase
   * Can be overridden by concrete implementations for variable phase durations
   */
  protected getPhaseDuration(): number {
    return this.phaseDuration;
  }
  
  /**
   * Get the current signal states for all approaches
   * Must be implemented by concrete subclasses
   */
  protected abstract getSignalStates(): number[][];
}
