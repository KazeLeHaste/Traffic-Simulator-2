/**
 * AllRedFlashingStrategy
 * 
 * A special traffic control strategy that simulates an emergency mode where all
 * signals flash red, requiring vehicles to treat the intersection as an all-way stop.
 */

import Intersection = require('../intersection');
import { TrafficState, ITrafficControlStrategy } from './ITrafficControlStrategy';
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';

/**
 * All-Red Flashing Strategy
 * Simulates emergency conditions or power outage at intersection
 */
export class AllRedFlashingStrategy extends AbstractTrafficControlStrategy {
  readonly strategyType: string = 'all-red-flashing';
  readonly displayName: string = 'All-Red Flashing';
  readonly description: string = 'All approaches flash red - simulates emergency conditions';
  
  // Track whether signals are currently visible or not (for flashing effect)
  private signalsVisible: boolean = true;
  
  // Flashing interval in seconds
  private flashInterval: number = 1.0; // 1 second on, 1 second off
  private timeInFlashState: number = 0;
  
  constructor() {
    super();
    this.totalPhases = 1; // Only one phase (all red)
    
    this.configOptions = {
      flashInterval: this.flashInterval
    };
  }
  
  /**
   * Update the traffic signals with flashing behavior
   */
  update(delta: number, trafficStates?: TrafficState[]): number[][] {
    // Update flash timing
    this.timeInFlashState += delta;
    if (this.timeInFlashState >= this.flashInterval) {
      this.timeInFlashState = 0;
      this.signalsVisible = !this.signalsVisible;
    }
    
    // Return the signal state
    return this.getSignalStates();
  }
  
  /**
   * Update configuration options
   */
  updateConfig(options: Record<string, any>): void {
    super.updateConfig(options);
    
    if (options.flashInterval !== undefined) {
      this.flashInterval = options.flashInterval;
    }
  }
  
  /**
   * Get the current signal states - all red or all off depending on flash state
   */
  protected getSignalStates(): number[][] {
    // If not visible in current flash state, return all off
    if (!this.signalsVisible) {
      return [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
    }
    
    // Otherwise, all approaches are red (no movements allowed)
    return [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
  }
  
  /**
   * Create from JSON (static method)
   */
  static fromJSON(data: any, intersection: Intersection): AllRedFlashingStrategy {
    const strategy = new AllRedFlashingStrategy();
    
    // Restore state from saved data
    strategy.flashInterval = data.flashInterval || strategy.flashInterval;
    strategy.signalsVisible = data.signalsVisible !== undefined ? data.signalsVisible : true;
    strategy.timeInFlashState = data.timeInFlashState || 0;
    
    // Apply configuration options
    if (data.configOptions) {
      strategy.updateConfig(data.configOptions);
    }
    
    strategy.initialize(intersection);
    return strategy;
  }
  
  /**
   * Create from JSON (instance method)
   */
  fromJSON(data: any, intersection: Intersection): ITrafficControlStrategy {
    // Initialize with the intersection
    this.initialize(intersection);
    
    // Restore state from saved data
    if (data.flashInterval !== undefined) {
      this.flashInterval = data.flashInterval;
    }
    
    if (data.signalsVisible !== undefined) {
      this.signalsVisible = data.signalsVisible;
    }
    
    if (data.timeInFlashState !== undefined) {
      this.timeInFlashState = data.timeInFlashState;
    }
    
    // Restore common properties
    if (data.currentPhase !== undefined) {
      this.currentPhase = data.currentPhase;
    }
    
    if (data.timeInPhase !== undefined) {
      this.timeInPhase = data.timeInPhase;
    }
    
    // Apply configuration options
    if (data.configOptions) {
      this.configOptions = { ...this.configOptions, ...data.configOptions };
    }
    
    return this;
  }
  
  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      ...super.toJSON(),
      flashInterval: this.flashInterval,
      signalsVisible: this.signalsVisible,
      timeInFlashState: this.timeInFlashState
    };
  }
}
