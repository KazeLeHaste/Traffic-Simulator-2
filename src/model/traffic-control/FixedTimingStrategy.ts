/**
 * FixedTimingStrategy
 * 
 * A simple fixed-timing traffic control strategy that follows a predefined cycle.
 * This is equivalent to the original behavior in the simulation.
 */

import Intersection = require('../intersection');
import { TrafficState } from './ITrafficControlStrategy';
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';
import settings = require('../../settings');

/**
 * Fixed timing traffic control strategy
 * Cycles through predefined phases with fixed durations
 */
export class FixedTimingStrategy extends AbstractTrafficControlStrategy {
  readonly strategyType: string = 'fixed-timing';
  readonly displayName: string = 'Fixed Timing';
  readonly description: string = 'Cycles through traffic signal phases with fixed durations';
  
  // Traffic signal patterns for intersections
  // 'L' = Left turn, 'F' = Forward, 'R' = Right turn
  // Each array represents a phase of the traffic light cycle
  // Each element in the array represents a direction (N, E, S, W)
  protected states = [
    ['L', '', 'L', ''],       // Phase 1: North & South left turns
    ['FR', '', 'FR', ''],     // Phase 2: North & South forward and right
    ['', 'L', '', 'L'],       // Phase 3: East & West left turns
    ['', 'FR', '', 'FR']      // Phase 4: East & West forward and right
  ];
  
  // Random variation in timing to create natural offsets between intersections
  private flipMultiplier: number;
  
  constructor() {
    super();
    this.flipMultiplier = Math.random();
    this.totalPhases = this.states.length;
    
    this.configOptions = {
      baseDuration: settings.lightsFlipInterval / 30, // Convert to seconds
      variationPercentage: 5 // 5% variation by default
    };
  }
  
  /**
   * Initialize the strategy with an intersection
   */
  initialize(intersection: Intersection): void {
    super.initialize(intersection);
    
    // If it's a 2-way or T-intersection, use a simplified state cycle
    if (intersection.roads && intersection.roads.length <= 2) {
      this.states = [
        ['LFR', 'LFR', 'LFR', 'LFR'] // Single phase allowing all movements
      ];
      this.totalPhases = 1;
    }
  }
  
  /**
   * Get the duration for the current phase
   */
  protected getPhaseDuration(): number {
    // Apply random variation to create offsets between intersections
    const baseDuration = this.configOptions.baseDuration || 5; // seconds
    const variation = this.configOptions.variationPercentage || 5; // percentage
    
    // Calculate duration with variation
    return baseDuration * (1 + (this.flipMultiplier * variation / 100));
  }
  
  /**
   * Get the current signal states
   */
  protected getCurrentSignalStates(): number[][] {
    const stringState = this.states[this.currentPhase % this.states.length];
    
    // For 2-way or T-intersections, always allow all movements
    if (this.intersection && this.intersection.roads && this.intersection.roads.length <= 2) {
      return [
        this._decode('LFR'),
        this._decode('LFR'),
        this._decode('LFR'),
        this._decode('LFR')
      ];
    }
    
    // Convert string patterns to numeric state arrays
    return stringState.map(x => this._decode(x));
  }
  
  /**
   * Convert string representation to numeric state array
   * e.g., "LFR" -> [1,1,1] (left, forward, right allowed)
   */
  private _decode(str: string): number[] {
    const state = [0, 0, 0];
    if (str.includes('L')) state[0] = 1;
    if (str.includes('F')) state[1] = 1;
    if (str.includes('R')) state[2] = 1;
    return state;
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(data: any, intersection: Intersection): FixedTimingStrategy {
    const strategy = new FixedTimingStrategy();
    
    // Restore state from saved data
    strategy.currentPhase = data.currentPhase || 0;
    strategy.timeInPhase = data.timeInPhase || 0;
    strategy.totalPhases = data.totalPhases || 4;
    strategy.phaseDuration = data.phaseDuration || 5;
    strategy.configOptions = data.configOptions || {};
    strategy.flipMultiplier = data.flipMultiplier || Math.random();
    
    // If states array was saved, restore it
    if (data.states) {
      strategy.states = data.states;
    }
    
    strategy.initialize(intersection);
    return strategy;
  }
  
  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      ...super.toJSON(),
      flipMultiplier: this.flipMultiplier,
      states: this.states
    };
  }
}
