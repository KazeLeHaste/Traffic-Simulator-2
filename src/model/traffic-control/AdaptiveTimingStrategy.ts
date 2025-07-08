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
  readonly description: string = 'Adapts traffic signal timings based on real-time traffic conditions';
  
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
  private flowRates: number[] = [0, 0, 0, 0];    // N, E, S, W
  private congestionScores: number[] = [0, 0, 0, 0]; // N, E, S, W
  private throughputRates: number[] = [0, 0, 0, 0]; // Vehicles passing through per minute
  private saturationRates: number[] = [0, 0, 0, 0]; // How saturated the approach is (0-1)
  
  // Traffic history for trend analysis
  private queueHistory: number[][] = [];
  private waitTimeHistory: number[][] = [];
  private flowRateHistory: number[][] = []; // Track flow rate history for better trend analysis
  private historyMaxLength: number = 10;
  
  // Minimum and maximum phase durations
  private minPhaseDuration: number = 10; // seconds
  private maxPhaseDuration: number = 60; // seconds
  private basePhaseDuration: number = 30; // seconds
  
  // Algorithm parameters
  private trafficSensitivity: number = 0.5;  // How reactive to traffic (0-1)
  private queueWeight: number = 1.0;         // Weight for queue length in scoring
  private waitTimeWeight: number = 1.0;      // Weight for wait time in scoring
  private flowRateWeight: number = 0.5;      // Weight for flow rate in scoring
  private trendWeight: number = 0.3;         // Weight for trend analysis (0-1)
  private prioritizeLeftTurns: boolean = true; // Give extra weight to left turn phases when congested
  private enableLogging: boolean = false;    // Enable detailed logging
  private emergencyMode: boolean = false;    // Enable emergency mode for extreme congestion
  private fairnessWeight: number = 0.5;      // Weight for fairness across approaches (0-1)
  
  // Timing statistics for analysis
  private phaseDurationHistory: number[] = [];
  private trafficScoreHistory: number[] = [];
  private phaseChanges: number = 0;
  private emergencyActivations: number = 0;  // Track emergency mode activations
  private fairnessMetric: number = 1.0;      // Track fairness across approaches (0-1)
  
  constructor() {
    super();
    this.totalPhases = this.states.length;
    
    this.configOptions = {
      minPhaseDuration: this.minPhaseDuration,
      maxPhaseDuration: this.maxPhaseDuration,
      baseDuration: settings.lightsFlipInterval / 30, // Convert to seconds
      trafficSensitivity: this.trafficSensitivity,
      queueWeight: this.queueWeight,
      waitTimeWeight: this.waitTimeWeight,
      flowRateWeight: this.flowRateWeight,
      trendWeight: this.trendWeight,
      prioritizeLeftTurns: this.prioritizeLeftTurns,
      enableLogging: this.enableLogging,
      emergencyMode: this.emergencyMode,
      fairnessWeight: this.fairnessWeight
    };
    
    this.basePhaseDuration = this.configOptions.baseDuration;
    
    // Initialize history arrays
    this.resetHistory();
  }
  
  /**
   * Reset traffic history arrays
   */
  private resetHistory(): void {
    this.queueHistory = [];
    this.waitTimeHistory = [];
    this.flowRateHistory = [];
    this.phaseDurationHistory = [];
    this.trafficScoreHistory = [];
    this.phaseChanges = 0;
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
    
    // Initialize metric tracking
    this.queueLengths = [0, 0, 0, 0];
    this.waitTimes = [0, 0, 0, 0];
    this.flowRates = [0, 0, 0, 0];
    this.congestionScores = [0, 0, 0, 0];
    
    // Reset history arrays
    this.resetHistory();
    
    // Apply configuration
    this.minPhaseDuration = this.configOptions.minPhaseDuration || 10;
    this.maxPhaseDuration = this.configOptions.maxPhaseDuration || 60;
    this.basePhaseDuration = this.configOptions.baseDuration || 30;
    this.trafficSensitivity = this.configOptions.trafficSensitivity || 0.5;
    this.queueWeight = this.configOptions.queueWeight || 1.0;
    this.waitTimeWeight = this.configOptions.waitTimeWeight || 1.0;
    this.flowRateWeight = this.configOptions.flowRateWeight || 0.5;
    this.trendWeight = this.configOptions.trendWeight || 0.3;
    this.prioritizeLeftTurns = this.configOptions.prioritizeLeftTurns !== undefined ? 
      this.configOptions.prioritizeLeftTurns : true;
    this.enableLogging = this.configOptions.enableLogging || false;
    this.emergencyMode = this.configOptions.emergencyMode || false;
    this.fairnessWeight = this.configOptions.fairnessWeight || 0.5;
    
    if (this.enableLogging) {
      console.log(`[AdaptiveStrategy] Initialized for intersection ${intersection.id}`);
      console.log(`[AdaptiveStrategy] Config: minDur=${this.minPhaseDuration}s, maxDur=${this.maxPhaseDuration}s, sensitivity=${this.trafficSensitivity}`);
    }
  }
  
  /**
   * Update the strategy based on elapsed time and traffic conditions
   */
  update(delta: number, trafficStates?: TrafficState[]): number[][] {
    // Add to time in current phase
    this.timeInPhase += delta;
    
    // Process traffic states if available
    if (trafficStates && trafficStates.length > 0) {
      // This will update internal traffic metrics
      const shouldSwitch = this.shouldSwitchPhase(trafficStates);
      
      // If it's time to switch, advance to next phase
      if (shouldSwitch) {
        this.advanceToNextPhase();
      }
    } else {
      // Default behavior without traffic data
      if (this.timeInPhase >= this.nextPhaseChangeTime) {
        this.advanceToNextPhase();
      }
    }
    
    // Return current signal states
    return this.getSignalStates();
  }
  
  /**
   * Update configuration options
   */
  updateConfig(options: Record<string, any>): void {
    super.updateConfig(options);
    
    // Update internal parameters based on config
    if (options.minPhaseDuration !== undefined) this.minPhaseDuration = options.minPhaseDuration;
    if (options.maxPhaseDuration !== undefined) this.maxPhaseDuration = options.maxPhaseDuration;
    if (options.baseDuration !== undefined) this.basePhaseDuration = options.baseDuration;
    if (options.trafficSensitivity !== undefined) this.trafficSensitivity = options.trafficSensitivity;
    if (options.queueWeight !== undefined) this.queueWeight = options.queueWeight;
    if (options.waitTimeWeight !== undefined) this.waitTimeWeight = options.waitTimeWeight;
    if (options.flowRateWeight !== undefined) this.flowRateWeight = options.flowRateWeight;
    if (options.trendWeight !== undefined) this.trendWeight = options.trendWeight;
    if (options.prioritizeLeftTurns !== undefined) this.prioritizeLeftTurns = options.prioritizeLeftTurns;
    if (options.enableLogging !== undefined) this.enableLogging = options.enableLogging;
    if (options.emergencyMode !== undefined) this.emergencyMode = options.emergencyMode;
    if (options.fairnessWeight !== undefined) this.fairnessWeight = options.fairnessWeight;
    
    if (this.enableLogging) {
      console.log(`[AdaptiveStrategy] Configuration updated`);
    }
  }
  
  /**
   * Reset the strategy to initial state
   */
  reset(): void {
    super.reset();
    
    // Reset traffic metrics
    this.queueLengths = [0, 0, 0, 0];
    this.waitTimes = [0, 0, 0, 0];
    this.flowRates = [0, 0, 0, 0];
    this.congestionScores = [0, 0, 0, 0];
    
    // Reset history
    this.resetHistory();
    
    if (this.enableLogging) {
      console.log(`[AdaptiveStrategy] Reset to initial state`);
    }
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
      
      // Update traffic metrics with latest data
      this.updateTrafficMetrics(trafficStates);
      
      // Get traffic demand for current phase and all other phases
      const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
      const currentTraffic = this.getTrafficDemandForDirections(currentDirections);
      
      // Find the phase with the highest demand
      let maxTraffic = 0;
      let maxTrafficPhase = this.currentPhase;
      
      for (let i = 0; i < this.totalPhases; i++) {
        if (i !== this.currentPhase) {
          const phaseDirections = this.getActiveDirectionsForPhase(i);
          const phaseTraffic = this.getTrafficDemandForDirections(phaseDirections);
          
          if (phaseTraffic > maxTraffic) {
            maxTraffic = phaseTraffic;
            maxTrafficPhase = i;
          }
        }
      }
      
      // Early switch conditions
      const nextPhase = (this.currentPhase + 1) % this.totalPhases;
      const nextTraffic = this.getTrafficDemandForDirections(
        this.getActiveDirectionsForPhase(nextPhase)
      );
      
      // Switch early under specific conditions
      if (this.timeInPhase >= this.nextPhaseChangeTime * 0.75) {
        // If the next phase has substantially more demand, switch early
        if (nextTraffic > currentTraffic * 2) {
          if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Early switch: next phase has ${nextTraffic.toFixed(1)} demand vs current ${currentTraffic.toFixed(1)}`);
          }
          return true;
        }
        
        // If another phase has extremely high demand, consider switching directly to it
        if (maxTraffic > currentTraffic * 3 && maxTraffic > nextTraffic * 2) {
          if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Emergency switch: phase ${maxTrafficPhase + 1} has critical demand ${maxTraffic.toFixed(1)}`);
          }
          
          // Set the next phase to the one with highest demand
          this.currentPhase = maxTrafficPhase - 1;
          if (this.currentPhase < 0) this.currentPhase = this.totalPhases - 1;
          
          return true;
        }
      }
      
      // Extend phase if it has significant traffic and hasn't reached max duration
      if (currentTraffic > 0 && this.timeInPhase < this.maxPhaseDuration) {
        // If current phase has more traffic than the next AND we're still processing vehicles
        if (currentTraffic > nextTraffic * 0.8 && timeBasedSwitch) {
          const remainingPercent = Math.min(1, (currentTraffic - nextTraffic) / currentTraffic);
          
          // Extend up to 50% of base duration based on remaining traffic
          const extensionTime = this.basePhaseDuration * 0.5 * remainingPercent;
          
          if (this.timeInPhase < this.nextPhaseChangeTime + extensionTime && 
              this.timeInPhase < this.maxPhaseDuration) {
            if (this.enableLogging && this.timeInPhase >= this.nextPhaseChangeTime) {
              console.log(`[AdaptiveStrategy] Extending phase ${this.currentPhase + 1} by ${extensionTime.toFixed(1)}s due to continuing traffic`);
            }
            return false;
          }
        }
      }
      
      // If current phase has no traffic but next phase does, switch immediately
      // after minimum time has passed
      if (currentTraffic === 0 && nextTraffic > 0 && this.timeInPhase >= this.minPhaseDuration) {
        if (this.enableLogging) {
          console.log(`[AdaptiveStrategy] Early switch: current phase empty, next phase has traffic`);
        }
        return true;
      }
    }
    
    // If we're past the scheduled time, make the switch
    if (timeBasedSwitch) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Update internal traffic metrics based on traffic state
   */
  private updateTrafficMetrics(trafficStates: TrafficState[]): void {
    // Store previous metrics for trend analysis
    const previousQueues = [...this.queueLengths];
    const previousWaits = [...this.waitTimes];
    const previousFlows = [...this.flowRates];
    
    // Update current metrics
    for (let i = 0; i < trafficStates.length; i++) {
      if (i < this.queueLengths.length) {
        this.queueLengths[i] = trafficStates[i].queueLength;
        this.waitTimes[i] = trafficStates[i].averageWaitTime;
        this.flowRates[i] = trafficStates[i].flowRate;
        
        // Calculate throughput rates - if data is available in the traffic state
        this.throughputRates[i] = trafficStates[i].flowRate || 0;
        
        // Calculate saturation rates - queue length compared to an estimated capacity
        // Higher values indicate more saturation
        const estimatedCapacity = 10; // Estimated capacity per lane
        this.saturationRates[i] = Math.min(1.0, this.queueLengths[i] / estimatedCapacity);
      }
    }
    
    // Update congestion scores based on metrics
    this.updateCongestionScores();
    
    // Add to history for trend analysis
    this.queueHistory.push([...this.queueLengths]);
    this.waitTimeHistory.push([...this.waitTimes]);
    this.flowRateHistory.push([...this.flowRates]);
    
    // Limit history length
    if (this.queueHistory.length > this.historyMaxLength) {
      this.queueHistory.shift();
      this.waitTimeHistory.shift();
      this.flowRateHistory.shift();
    }
    
    // Check for emergency conditions
    this.checkEmergencyConditions();
    
    // Calculate fairness across approaches
    this.calculateFairness();
    
    // Log metrics if logging is enabled
    if (this.enableLogging) {
      console.log(`[AdaptiveStrategy] Traffic metrics updated: Q=${this.queueLengths.join(',')}, W=${this.waitTimes.join(',')}, F=${this.flowRates.join(',')}`);
      console.log(`[AdaptiveStrategy] Saturation rates: ${this.saturationRates.map(r => r.toFixed(2)).join(', ')}`);
    }
  }
  
  /**
   * Calculate congestion scores for each direction
   * Higher score = more congested
   */
  private updateCongestionScores(): void {
    for (let i = 0; i < 4; i++) {
      // Normalize each metric to a 0-10 scale
      const queueScore = Math.min(10, this.queueLengths[i] / 2);
      const waitScore = Math.min(10, this.waitTimes[i] / 30);
      const flowScore = this.flowRates[i] > 0 ? 10 / Math.max(1, this.flowRates[i]) : 10;
      const saturationScore = this.saturationRates[i] * 10; // Convert 0-1 to 0-10
      
      // Combine scores with weights
      this.congestionScores[i] = (
        queueScore * this.queueWeight +
        waitScore * this.waitTimeWeight +
        flowScore * this.flowRateWeight +
        saturationScore * this.flowRateWeight // Use same weight as flow rate for now
      ) / (this.queueWeight + this.waitTimeWeight + this.flowRateWeight * 2);
      
      // Apply trend analysis if we have history
      if (this.queueHistory.length >= 3) {
        const queueTrend = this.calculateTrend(i, this.queueHistory);
        const waitTrend = this.calculateTrend(i, this.waitTimeHistory);
        const flowTrend = this.calculateTrend(i, this.flowRateHistory);
        
        // If trends are increasing (positive), increase congestion score
        // Weight queue trend highest, then wait time, then flow
        const trendFactor = (queueTrend * 0.5 + waitTrend * 0.3 + flowTrend * 0.2);
        if (trendFactor > 0) {
          this.congestionScores[i] += trendFactor * this.trendWeight;
        }
      }
      
      // Apply fairness adjustment if fairness weight is > 0 
      if (this.fairnessWeight > 0 && this.fairnessMetric < 1.0) {
        // If this direction has been underserved (higher wait times),
        // boost its congestion score to give it higher priority
        const avgWait = this.waitTimes[i];
        const maxWait = Math.max(...this.waitTimes);
        
        if (avgWait > 0 && avgWait >= maxWait * 0.8) {
          const fairnessBoost = (avgWait / maxWait) * this.fairnessWeight * 2;
          this.congestionScores[i] += fairnessBoost;
        }
      }
    }
  }
  
  /**
   * Calculate trend for a specific direction and metric
   * Returns a value between -1 and 1 (negative = decreasing, positive = increasing)
   */
  private calculateTrend(direction: number, history: number[][]): number {
    if (history.length < 3) return 0;
    
    // Get last 3 values
    const recent = history.slice(-3).map(h => h[direction]);
    
    // Simple trend calculation
    if (recent[2] > recent[1] && recent[1] > recent[0]) {
      // Consistently increasing
      return 1.0;
    } else if (recent[2] < recent[1] && recent[1] < recent[0]) {
      // Consistently decreasing
      return -1.0;
    } else if (recent[2] > recent[0]) {
      // Net increase
      return 0.5;
    } else if (recent[2] < recent[0]) {
      // Net decrease
      return -0.5;
    }
    
    // No clear trend
    return 0;
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
   * Returns a score based on congestion scores
   */
  private getTrafficDemandForDirections(directions: number[]): number {
    let demand = 0;
    
    for (const dir of directions) {
      // Use comprehensive congestion score
      demand += this.congestionScores[dir];
      
      // Add bonus for left turn phases if configured
      if (this.prioritizeLeftTurns) {
        const phaseIdx = this.currentPhase % this.states.length;
        const phaseState = this.states[phaseIdx][dir];
        if (phaseState.includes('L')) {
          demand *= 1.2; // 20% bonus for left turn phases when congested
        }
      }
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
    if (this.queueLengths.every(q => q === 0) && this.waitTimes.every(w => w === 0)) {
      if (this.enableLogging) {
        console.log(`[AdaptiveStrategy] No traffic data, using base duration: ${baseDuration}s`);
      }
      return baseDuration;
    }
    
    // Get directions active in current phase
    const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
    const currentTraffic = this.getTrafficDemandForDirections(currentDirections);
    
    // Check other phases' demand to determine relative importance
    let totalDemand = currentTraffic;
    let maxOtherDemand = 0;
    
    for (let i = 0; i < this.totalPhases; i++) {
      if (i !== this.currentPhase) {
        const phaseDemand = this.getTrafficDemandForDirections(
          this.getActiveDirectionsForPhase(i)
        );
        totalDemand += phaseDemand;
        maxOtherDemand = Math.max(maxOtherDemand, phaseDemand);
      }
    }
    
    // Calculate phase importance as ratio of its demand to total demand
    const phaseImportance = totalDemand > 0 ? currentTraffic / totalDemand : 0;
    
    // Calculate adjusted duration
    let adjustedDuration: number;
    
    if (maxOtherDemand > currentTraffic * 2) {
      // If another phase has much more demand, shorten this phase
      adjustedDuration = this.minPhaseDuration;
    } else {
      // Normal adjustment based on demand
      const trafficFactor = Math.min(1.0, currentTraffic / 20); // Cap at 20 units of demand
      const importanceFactor = Math.max(0.2, phaseImportance * 2); // Min 0.2, max 2.0
      const durationAdjustment = sensitivity * trafficFactor * importanceFactor * (this.maxPhaseDuration - baseDuration);
      
      adjustedDuration = Math.min(
        this.maxPhaseDuration,
        Math.max(this.minPhaseDuration, baseDuration + durationAdjustment)
      );
    }
    
    // Store for analysis
    this.phaseDurationHistory.push(adjustedDuration);
    this.trafficScoreHistory.push(currentTraffic);
    
    if (this.enableLogging) {
      console.log(
        `[AdaptiveStrategy] Phase ${this.currentPhase + 1}: traffic=${currentTraffic.toFixed(1)}, ` +
        `importance=${phaseImportance.toFixed(2)}, duration=${adjustedDuration.toFixed(1)}s`
      );
    }
    
    return adjustedDuration;
  }
  
  /**
   * Get the current signal states
   */
  protected getSignalStates(): number[][] {
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
   * Add a custom phase advancement method that tracks changes
   */
  protected advanceToNextPhase(): void {
    const oldPhase = this.currentPhase;
    
    // Call parent implementation
    super.advanceToNextPhase();
    
    // Track phase changes
    this.phaseChanges++;
    
    if (this.enableLogging) {
      console.log(`[AdaptiveStrategy] Phase changed: ${oldPhase + 1} → ${this.currentPhase + 1}`);
    }
  }
  
  /**
   * Check for emergency traffic conditions that require immediate intervention
   */
  private checkEmergencyConditions(): void {
    // Check if any direction has extreme congestion
    let emergencyDetected = false;
    let emergencyDirection = -1;
    
    for (let i = 0; i < 4; i++) {
      // Define emergency conditions:
      // 1. Very high queue length (> 15)
      // 2. Very high wait time (> 60 seconds)
      // 3. Very low flow rate combined with high queue
      const criticalQueue = this.queueLengths[i] > 15;
      const criticalWait = this.waitTimes[i] > 60;
      const criticalFlow = this.flowRates[i] < 1 && this.queueLengths[i] > 10;
      
      // Consistent growth trend is another emergency indicator
      let growingTrend = false;
      if (this.queueHistory.length >= 5) {
        const trendFactor = this.calculateTrend(i, this.queueHistory);
        growingTrend = trendFactor > 0.8; // Strong upward trend
      }
      
      if ((criticalQueue || criticalWait || criticalFlow) && growingTrend) {
        emergencyDetected = true;
        emergencyDirection = i;
        break;
      }
    }
    
    // If emergency detected and emergency mode is enabled in config
    if (emergencyDetected && this.configOptions.emergencyMode) {
      // Check if we're not already servicing this direction
      const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
      if (!currentDirections.includes(emergencyDirection)) {
        if (this.enableLogging) {
          console.log(`[AdaptiveStrategy] 🚨 EMERGENCY condition detected in direction ${emergencyDirection}`);
        }
        
        // Find the phase that serves this direction
        let targetPhase = -1;
        for (let i = 0; i < this.totalPhases; i++) {
          const phaseDirections = this.getActiveDirectionsForPhase(i);
          if (phaseDirections.includes(emergencyDirection)) {
            targetPhase = i;
            break;
          }
        }
        
        if (targetPhase >= 0 && this.timeInPhase > this.minPhaseDuration) {
          // Force switch to this phase on next update
          this.currentPhase = targetPhase - 1;
          if (this.currentPhase < 0) this.currentPhase = this.totalPhases - 1;
          this.timeInPhase = this.nextPhaseChangeTime; // Force a phase change
          this.emergencyActivations++;
          
          if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Emergency action: Switching to phase ${targetPhase} to address congestion`);
          }
        }
      }
    }
  }
  
  /**
   * Calculate fairness metric across approaches
   * A value of 1.0 means perfectly balanced service
   * Lower values indicate some directions are underserved
   */
  private calculateFairness(): void {
    // Calculate service time ratio between most and least served directions
    if (this.phaseDurationHistory.length < this.totalPhases) {
      this.fairnessMetric = 1.0; // Not enough data yet
      return;
    }
    
    // Get average wait times by direction
    const avgWaitByDirection: number[] = [...this.waitTimes];
    
    // If any wait times are zero, set a minimum value
    for (let i = 0; i < avgWaitByDirection.length; i++) {
      if (avgWaitByDirection[i] === 0) avgWaitByDirection[i] = 0.1;
    }
    
    // Calculate max/min ratio
    const maxWait = Math.max(...avgWaitByDirection);
    const minWait = Math.min(...avgWaitByDirection);
    
    // Invert and normalize to 0-1 range (1 = perfectly fair, 0 = completely unfair)
    this.fairnessMetric = minWait / maxWait;
    
    if (this.enableLogging && this.fairnessMetric < 0.5) {
      console.log(`[AdaptiveStrategy] Fairness alert: Low fairness metric ${this.fairnessMetric.toFixed(2)}`);
    }
  }
  
  /**
   * Get performance analytics for this strategy
   */
  public getPerformanceAnalytics(): {
    phaseDurationAvg: number;
    phaseDurationMin: number;
    phaseDurationMax: number;
    phaseChanges: number;
    trafficScoreAvg: number;
    congestionScores: number[];
    saturationRates: number[];
    adaptationRate: number;
    fairnessMetric: number;
    emergencyActivations: number;
    throughputRates: number[];
  } {
    // Calculate statistics
    const durations = this.phaseDurationHistory;
    const trafficScores = this.trafficScoreHistory;
    
    const phaseDurationAvg = durations.length > 0 ? 
      durations.reduce((sum, val) => sum + val, 0) / durations.length : 0;
    const phaseDurationMin = durations.length > 0 ? Math.min(...durations) : 0;
    const phaseDurationMax = durations.length > 0 ? Math.max(...durations) : 0;
    
    const trafficScoreAvg = trafficScores.length > 0 ?
      trafficScores.reduce((sum, val) => sum + val, 0) / trafficScores.length : 0;
    
    // Calculate adaptation rate (how much timing varies from base duration)
    let totalVariation = 0;
    const baseDuration = this.basePhaseDuration;
    
    for (const duration of durations) {
      totalVariation += Math.abs(duration - baseDuration) / baseDuration;
    }
    
    const adaptationRate = durations.length > 0 ? totalVariation / durations.length : 0;
    
    return {
      phaseDurationAvg,
      phaseDurationMin,
      phaseDurationMax,
      phaseChanges: this.phaseChanges,
      trafficScoreAvg,
      congestionScores: [...this.congestionScores],
      saturationRates: [...this.saturationRates],
      adaptationRate,
      fairnessMetric: this.fairnessMetric,
      emergencyActivations: this.emergencyActivations,
      throughputRates: [...this.throughputRates]
    };
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
    strategy.basePhaseDuration = data.basePhaseDuration || strategy.configOptions.baseDuration || 30;
    strategy.trafficSensitivity = data.trafficSensitivity || strategy.configOptions.trafficSensitivity || 0.5;
    strategy.queueWeight = data.queueWeight || strategy.configOptions.queueWeight || 1.0;
    strategy.waitTimeWeight = data.waitTimeWeight || strategy.configOptions.waitTimeWeight || 1.0;
    strategy.flowRateWeight = data.flowRateWeight || strategy.configOptions.flowRateWeight || 0.5;
    strategy.trendWeight = data.trendWeight || strategy.configOptions.trendWeight || 0.3;
    strategy.prioritizeLeftTurns = data.prioritizeLeftTurns !== undefined ? 
      data.prioritizeLeftTurns : strategy.configOptions.prioritizeLeftTurns !== undefined ? 
      strategy.configOptions.prioritizeLeftTurns : true;
    strategy.enableLogging = data.enableLogging || strategy.configOptions.enableLogging || false;
    strategy.emergencyMode = data.emergencyMode || strategy.configOptions.emergencyMode || false;
    strategy.fairnessWeight = data.fairnessWeight || strategy.configOptions.fairnessWeight || 0.5;
    
    // If states array was saved, restore it
    if (data.states) {
      strategy.states = data.states;
    }
    
    // Restore metrics if available
    if (data.queueLengths) strategy.queueLengths = data.queueLengths;
    if (data.waitTimes) strategy.waitTimes = data.waitTimes;
    if (data.flowRates) strategy.flowRates = data.flowRates;
    if (data.congestionScores) strategy.congestionScores = data.congestionScores;
    if (data.throughputRates) strategy.throughputRates = data.throughputRates;
    if (data.saturationRates) strategy.saturationRates = data.saturationRates;
    if (data.fairnessMetric !== undefined) strategy.fairnessMetric = data.fairnessMetric;
    if (data.emergencyActivations !== undefined) strategy.emergencyActivations = data.emergencyActivations;
    
    // Restore history arrays
    if (data.queueHistory) strategy.queueHistory = data.queueHistory;
    if (data.waitTimeHistory) strategy.waitTimeHistory = data.waitTimeHistory;
    if (data.flowRateHistory) strategy.flowRateHistory = data.flowRateHistory;
    if (data.phaseDurationHistory) strategy.phaseDurationHistory = data.phaseDurationHistory;
    if (data.trafficScoreHistory) strategy.trafficScoreHistory = data.trafficScoreHistory;
    if (data.phaseChanges !== undefined) strategy.phaseChanges = data.phaseChanges;
    
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
      basePhaseDuration: this.basePhaseDuration,
      trafficSensitivity: this.trafficSensitivity,
      queueWeight: this.queueWeight,
      waitTimeWeight: this.waitTimeWeight,
      flowRateWeight: this.flowRateWeight,
      trendWeight: this.trendWeight,
      prioritizeLeftTurns: this.prioritizeLeftTurns,
      enableLogging: this.enableLogging,
      emergencyMode: this.emergencyMode,
      fairnessWeight: this.fairnessWeight,
      
      // Current metrics
      states: this.states,
      queueLengths: this.queueLengths,
      waitTimes: this.waitTimes,
      flowRates: this.flowRates,
      congestionScores: this.congestionScores,
      throughputRates: this.throughputRates,
      saturationRates: this.saturationRates,
      fairnessMetric: this.fairnessMetric,
      emergencyActivations: this.emergencyActivations,
      
      // History data (limited for size)
      queueHistory: this.queueHistory.slice(-5),
      waitTimeHistory: this.waitTimeHistory.slice(-5),
      flowRateHistory: this.flowRateHistory.slice(-5),
      phaseDurationHistory: this.phaseDurationHistory.slice(-10),
      trafficScoreHistory: this.trafficScoreHistory.slice(-10),
      phaseChanges: this.phaseChanges,
      
      // Analysis
      analytics: this.getPerformanceAnalytics()
    };
  }
}
