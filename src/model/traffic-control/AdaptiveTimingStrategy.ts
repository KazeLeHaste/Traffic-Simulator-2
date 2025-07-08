/**
 * AdaptiveTimingStrategy
 * 
 * A more advanced traffic control strategy that adapts to traffic conditions.
 * This strategy adjusts phase durations based on queue lengths and waiting times.
 */

import Intersection = require('../intersection');
import { TrafficState } from './ITrafficControlStrategy';
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';
import settings = require('../../settings');

/**
 * Adaptive timing traffic control strategy
 * Adjusts signal timing based on traffic conditions
 */
export class AdaptiveTimingStrategy extends AbstractTrafficControlStrategy {
  readonly strategyType: string = 'adaptive-timing';
  readonly displayName: string = 'Adaptive Timing';
  readonly description: string = 'Adapts traffic signal timings based on traffic conditions';
  
  // Traffic signal patterns (same as fixed timing)
  protected states = [
    ['L', '', 'L', ''],       // Phase 1: North & South left turns
    ['FR', '', 'FR', ''],     // Phase 2: North & South forward and right
    ['', 'L', '', 'L'],       // Phase 3: East & West left turns
    ['', 'FR', '', 'FR']      // Phase 4: East & West forward and right
  ];
  
  // Track traffic metrics for each approach
  private queueLengths: number[] = [0, 0, 0, 0]; // N, E, S, W
  private waitTimes: number[] = [0, 0, 0, 0];    // N, E, S, W
  
  // Minimum and maximum phase durations
  private minPhaseDuration: number = 10; // seconds
  private maxPhaseDuration: number = 60; // seconds
  
  constructor() {
    super();
    this.totalPhases = this.states.length;
    
    this.configOptions = {
      minPhaseDuration: this.minPhaseDuration,
      maxPhaseDuration: this.maxPhaseDuration,
      baseDuration: settings.lightsFlipInterval / 30, // Convert to seconds
      trafficSensitivity: 0.5 // How much traffic affects phase duration (0-1)
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
    
    // Initialize queue length tracking
    this.queueLengths = [0, 0, 0, 0];
    this.waitTimes = [0, 0, 0, 0];
    
    // Apply configuration
    this.minPhaseDuration = this.configOptions.minPhaseDuration || 10;
    this.maxPhaseDuration = this.configOptions.maxPhaseDuration || 60;
  }
  
  /**
   * Update configuration options
   */
  updateConfig(options: Record<string, any>): void {
    super.updateConfig(options);
    
    // Update internal parameters based on config
    this.minPhaseDuration = this.configOptions.minPhaseDuration || 10;
    this.maxPhaseDuration = this.configOptions.maxPhaseDuration || 60;
  }
  
  /**
   * Check if the signal phase should be changed based on traffic conditions
   * Overrides the base implementation to add adaptive logic
   */
  protected shouldSwitchPhase(trafficStates?: TrafficState[]): boolean {
    // Standard time-based check
    const timeBasedSwitch = this.timeInPhase >= this.nextPhaseChangeTime;
    
    // If we have traffic state data, we can do more sophisticated checks
    if (trafficStates && trafficStates.length > 0) {
      // Has minimum time elapsed?
      if (this.timeInPhase < this.minPhaseDuration) {
        return false; // Don't switch before minimum time
      }
      
      // Update traffic metrics
      this.updateTrafficMetrics(trafficStates);
      
      // If current phase has little traffic and next phase has waiting traffic,
      // we might want to switch early
      const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
      const nextDirections = this.getActiveDirectionsForPhase((this.currentPhase + 1) % this.totalPhases);
      
      const currentTraffic = this.getTrafficDemandForDirections(currentDirections);
      const nextTraffic = this.getTrafficDemandForDirections(nextDirections);
      
      // If next phase has significantly more traffic, switch earlier
      if (nextTraffic > currentTraffic * 2 && this.timeInPhase >= this.nextPhaseChangeTime * 0.75) {
        return true;
      }
      
      // If current phase still has significant traffic, extend it (up to max duration)
      if (currentTraffic > 0 && this.timeInPhase < this.maxPhaseDuration) {
        return false;
      }
    }
    
    // Default to time-based decision
    return timeBasedSwitch;
  }
  
  /**
   * Update internal traffic metrics based on traffic state
   */
  private updateTrafficMetrics(trafficStates: TrafficState[]): void {
    for (let i = 0; i < trafficStates.length; i++) {
      if (i < this.queueLengths.length) {
        this.queueLengths[i] = trafficStates[i].queueLength;
        this.waitTimes[i] = trafficStates[i].averageWaitTime;
      }
    }
  }
  
  /**
   * Get the active directions for a specific phase
   * Returns array of direction indices (0=N, 1=E, 2=S, 3=W)
   */
  private getActiveDirectionsForPhase(phase: number): number[] {
    const phaseState = this.states[phase % this.states.length];
    const directions: number[] = [];
    
    for (let i = 0; i < phaseState.length; i++) {
      if (phaseState[i].length > 0) {
        directions.push(i);
      }
    }
    
    return directions;
  }
  
  /**
   * Calculate traffic demand for given directions
   * Returns a score based on queue length and wait times
   */
  private getTrafficDemandForDirections(directions: number[]): number {
    let demand = 0;
    
    for (const dir of directions) {
      // Weight queue length and wait times
      demand += this.queueLengths[dir] * 1.0; // Each waiting vehicle
      demand += this.waitTimes[dir] * 0.5;    // Each second of wait time
    }
    
    return demand;
  }
  
  /**
   * Get the duration for the current phase based on traffic conditions
   */
  protected getPhaseDuration(): number {
    const baseDuration = this.configOptions.baseDuration || 30; // seconds
    const sensitivity = this.configOptions.trafficSensitivity || 0.5;
    
    // If we don't have traffic data, use base duration
    if (this.queueLengths.every(q => q === 0)) {
      return baseDuration;
    }
    
    // Get directions active in current phase
    const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
    const currentTraffic = this.getTrafficDemandForDirections(currentDirections);
    
    // Calculate adjusted duration - more traffic = longer phase, up to maximum
    const trafficFactor = Math.min(1.0, currentTraffic / 20); // Cap at 20 units of demand
    const durationAdjustment = sensitivity * (trafficFactor * (this.maxPhaseDuration - baseDuration));
    
    // Return duration within bounds
    return Math.min(
      this.maxPhaseDuration,
      Math.max(this.minPhaseDuration, baseDuration + durationAdjustment)
    );
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
  static fromJSON(data: any, intersection: Intersection): AdaptiveTimingStrategy {
    const strategy = new AdaptiveTimingStrategy();
    
    // Restore state from saved data
    strategy.currentPhase = data.currentPhase || 0;
    strategy.timeInPhase = data.timeInPhase || 0;
    strategy.totalPhases = data.totalPhases || 4;
    strategy.phaseDuration = data.phaseDuration || 30;
    strategy.configOptions = data.configOptions || {};
    
    // Restore adaptive-specific properties
    strategy.minPhaseDuration = data.minPhaseDuration || strategy.configOptions.minPhaseDuration || 10;
    strategy.maxPhaseDuration = data.maxPhaseDuration || strategy.configOptions.maxPhaseDuration || 60;
    
    // If states array was saved, restore it
    if (data.states) {
      strategy.states = data.states;
    }
    
    if (data.queueLengths) {
      strategy.queueLengths = data.queueLengths;
    }
    
    if (data.waitTimes) {
      strategy.waitTimes = data.waitTimes;
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
      minPhaseDuration: this.minPhaseDuration,
      maxPhaseDuration: this.maxPhaseDuration,
      states: this.states,
      queueLengths: this.queueLengths,
      waitTimes: this.waitTimes
    };
  }
}
