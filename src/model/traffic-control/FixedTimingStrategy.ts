/**
 * FixedTimingStrategy
 * 
 * A simple fixed-timing traffic control strategy that follows a predefined cycle.
 * This is equivalent to the original behavior in the simulation.
 * 
 * Features:
 * - Fixed duration cycles for predictable traffic signal timing
 * - Configurable phase durations and variations
 * - Automatic adaptation to intersection type (4-way, 3-way, etc.)
 * - Detailed logging for timing verification and debugging
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
  
  // Additional properties for timing verification
  private phaseStartTimes: number[] = [];
  private phaseDurations: number[] = [];
  private phaseTargetDurations: number[] = [];
  private enableLogging: boolean = false;
  
  constructor() {
    super();
    this.flipMultiplier = Math.random();
    this.totalPhases = this.states.length;
    
    this.configOptions = {
      baseDuration: settings.lightsFlipInterval / 30, // Convert to seconds
      variationPercentage: 5, // 5% variation by default
      enableLogging: false, // Enable detailed timing logs
      logToConsole: true // Output logs to console
    };
    
    // Initialize timing arrays
    this.resetTimingStats();
  }
  
  /**
   * Reset timing statistics
   */
  private resetTimingStats(): void {
    this.phaseStartTimes = new Array(this.totalPhases).fill(0);
    this.phaseDurations = new Array(this.totalPhases).fill(0);
    this.phaseTargetDurations = new Array(this.totalPhases).fill(0);
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
    
    // Reset timing stats with the correct number of phases
    this.resetTimingStats();
    
    // Apply configuration
    this.enableLogging = this.configOptions.enableLogging || false;
    
    if (this.enableLogging) {
      this.log(`Initialized FixedTimingStrategy for intersection ${intersection.id}`);
      this.log(`Number of phases: ${this.totalPhases}`);
      this.log(`Base duration: ${this.configOptions.baseDuration} seconds`);
      this.log(`Variation: ${this.configOptions.variationPercentage}%`);
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
    strategy.enableLogging = data.enableLogging || false;
    
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
      states: this.states,
      enableLogging: this.enableLogging,
      timingStats: this.getTimingStatistics()
    };
  }
  
  /**
   * Log message if logging is enabled
   */
  private log(message: string): void {
    if (this.enableLogging && this.configOptions.logToConsole) {
      const intersectionId = this.intersection?.id || 'unknown';
      console.log(`[FixedTimingStrategy:${intersectionId}] ${message}`);
    }
  }
  
  /**
   * Update the traffic signals based on elapsed time
   * Overrides the base implementation to add timing tracking
   */
  update(delta: number, trafficStates?: TrafficState[]): number[][] {
    // Record start time for new phase
    if (this.timeInPhase === 0) {
      const now = new Date().getTime() / 1000; // Current time in seconds
      this.phaseStartTimes[this.currentPhase] = now;
      this.phaseTargetDurations[this.currentPhase] = this.getPhaseDuration();
      
      if (this.enableLogging) {
        this.log(`Starting phase ${this.currentPhase + 1}/${this.totalPhases} with target duration: ${this.phaseTargetDurations[this.currentPhase].toFixed(2)}s`);
      }
    }
    
    // Let the parent class handle the standard update logic
    const result = super.update(delta, trafficStates);
    
    // If a phase change just occurred (timeInPhase was reset to 0)
    if (this.timeInPhase < delta) {
      const previousPhase = (this.currentPhase + this.totalPhases - 1) % this.totalPhases;
      const now = new Date().getTime() / 1000;
      const actualDuration = now - this.phaseStartTimes[previousPhase];
      this.phaseDurations[previousPhase] = actualDuration;
      
      const targetDuration = this.phaseTargetDurations[previousPhase];
      const deviation = Math.abs(actualDuration - targetDuration);
      const deviationPercent = (deviation / targetDuration) * 100;
      
      if (this.enableLogging) {
        this.log(`Phase ${previousPhase + 1} completed: actual=${actualDuration.toFixed(2)}s, target=${targetDuration.toFixed(2)}s, deviation=${deviationPercent.toFixed(1)}%`);
      }
    }
    
    return result;
  }
  
  /**
   * Check if it's time to switch to the next phase
   * This implementation uses the fixed timing approach
   */
  protected shouldSwitchPhase(trafficStates?: TrafficState[]): boolean {
    const shouldSwitch = this.timeInPhase >= this.nextPhaseChangeTime;
    
    // Log when we're about to switch
    if (shouldSwitch && this.enableLogging) {
      this.log(`Time to switch phase: ${this.timeInPhase.toFixed(2)}s elapsed, threshold: ${this.nextPhaseChangeTime.toFixed(2)}s`);
    }
    
    return shouldSwitch;
  }
  
  /**
   * Advance to the next phase and reset timing
   */
  protected advanceToNextPhase(): void {
    const oldPhase = this.currentPhase;
    
    // Call the parent implementation
    super.advanceToNextPhase();
    
    if (this.enableLogging) {
      this.log(`Advanced from phase ${oldPhase + 1} to phase ${this.currentPhase + 1}`);
    }
  }
  
  /**
   * Get timing statistics for verification
   * @returns Timing statistics for all phases
   */
  getTimingStatistics(): {
    phaseStartTimes: number[];
    phaseDurations: number[];
    phaseTargetDurations: number[];
    averageDeviation: number;
    maxDeviation: number;
  } {
    // Calculate average and max deviation
    let totalDeviation = 0;
    let maxDeviation = 0;
    let validPhaseCount = 0;
    
    for (let i = 0; i < this.totalPhases; i++) {
      if (this.phaseDurations[i] > 0) {
        const deviation = Math.abs(this.phaseDurations[i] - this.phaseTargetDurations[i]);
        totalDeviation += deviation;
        maxDeviation = Math.max(maxDeviation, deviation);
        validPhaseCount++;
      }
    }
    
    const averageDeviation = validPhaseCount > 0 ? totalDeviation / validPhaseCount : 0;
    
    return {
      phaseStartTimes: [...this.phaseStartTimes],
      phaseDurations: [...this.phaseDurations],
      phaseTargetDurations: [...this.phaseTargetDurations],
      averageDeviation,
      maxDeviation
    };
  }
  
  /**
   * Reset all timing statistics
   */
  resetTimingStatistics(): void {
    this.resetTimingStats();
    if (this.enableLogging) {
      this.log('Timing statistics reset');
    }
  }
  
  /**
   * Set logging enabled/disabled
   * @param enabled Whether to enable detailed logging
   */
  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
    this.configOptions.enableLogging = enabled;
    this.log(`Logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}
