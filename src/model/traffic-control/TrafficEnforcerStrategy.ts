/**
 * TrafficEnforcerStrategy
 * 
 * Simulates a manual or AI-based traffic enforcer making decisions based on live conditions.
 * This strategy uses heuristics to prioritize lanes with high congestion or emergency situations.
 */

import Intersection = require('../intersection');
import { TrafficState, ITrafficControlStrategy } from './ITrafficControlStrategy';
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';
import settings = require('../../settings');

/**
 * Traffic enforcer control strategy
 * Simulates a human or AI traffic enforcer making real-time decisions
 */
export class TrafficEnforcerStrategy extends AbstractTrafficControlStrategy {
  readonly strategyType: string = 'traffic-enforcer';
  readonly displayName: string = 'Traffic Enforcer';
  readonly description: string = 'Simulates a traffic enforcer (human or AI) making real-time decisions based on traffic conditions';
  
  // Track traffic metrics for each approach
  private queueLengths: number[] = [0, 0, 0, 0]; // N, E, S, W
  private waitTimes: number[] = [0, 0, 0, 0];    // N, E, S, W
  private flowRates: number[] = [0, 0, 0, 0];    // N, E, S, W
  private congestionScores: number[] = [0, 0, 0, 0]; // N, E, S, W
  
  // Current active signals (1 = green, 0 = red) for each approach and movement
  private currentSignals: number[][] = [
    [0, 0, 0], // North [left, forward, right]
    [0, 0, 0], // East
    [0, 0, 0], // South
    [0, 0, 0]  // West
  ];
  
  // Decision-making parameters
  private decisionInterval: number = 5; // seconds between major decisions
  private timeSinceLastDecision: number = 0;
  private minimumGreenTime: number = 10; // minimum green time for any movement
  private greenTimers: { [key: string]: number } = {}; // track time for each green signal
  private activeMovements: { direction: number, movement: number }[] = []; // currently active movements
  
  // Safety constraint: conflicting movements can't be green simultaneously
  private conflictMatrix: {[key: string]: string[]} = {
    'N-L': ['E-L', 'E-F', 'S-F', 'S-R', 'W-L', 'W-F'],
    'N-F': ['E-L', 'E-F', 'E-R', 'S-L', 'W-L', 'W-F', 'W-R'],
    'N-R': ['E-F', 'E-R', 'S-L', 'W-L'],
    'E-L': ['N-L', 'N-F', 'S-L', 'S-F', 'W-F', 'W-R'],
    'E-F': ['N-L', 'N-F', 'N-R', 'S-L', 'S-F', 'S-R', 'W-L'],
    'E-R': ['N-F', 'N-R', 'S-L', 'W-L'],
    'S-L': ['N-F', 'N-R', 'E-L', 'E-F', 'W-L', 'W-F'],
    'S-F': ['N-L', 'E-L', 'E-F', 'E-R', 'W-L', 'W-F', 'W-R'],
    'S-R': ['N-L', 'E-F', 'E-R', 'W-L'],
    'W-L': ['N-L', 'N-F', 'N-R', 'E-L', 'E-R', 'S-L', 'S-R'],
    'W-F': ['N-L', 'N-F', 'E-L', 'E-F', 'S-L', 'S-F'],
    'W-R': ['N-F', 'N-R', 'E-L', 'S-F']
  };
  
  // Enforcer rules and priorities
  private priorityThreshold: number = 7; // congestion score above which a movement gets priority
  private emergencyThreshold: number = 9; // threshold for emergency intervention
  private fairnessWindow: number = 60; // time window (seconds) to ensure fairness
  private directionHistory: { [key: string]: number } = {}; // track time given to each direction
  
  // Extra priorities that can be set via configuration
  private prioritizedDirections: number[] = []; // directions that get priority (0=N, 1=E, 2=S, 3=W)
  private prioritizedMovements: { direction: number, movement: number }[] = []; // specific movements with priority
  
  constructor() {
    super();
    
    this.configOptions = {
      decisionInterval: this.decisionInterval,
      minimumGreenTime: this.minimumGreenTime,
      priorityThreshold: this.priorityThreshold,
      emergencyThreshold: this.emergencyThreshold,
      fairnessWindow: this.fairnessWindow,
      prioritizedDirections: [],
      prioritizedMovements: []
    };
    
    // Initialize green timers and direction history
    for (let d = 0; d < 4; d++) {
      for (let m = 0; m < 3; m++) {
        this.greenTimers[`${d}-${m}`] = 0;
      }
      this.directionHistory[d.toString()] = 0;
    }
  }
  
  /**
   * Initialize the strategy with an intersection
   */
  initialize(intersection: Intersection): void {
    super.initialize(intersection);
    
    // Reset state
    this.resetSignals();
    this.activeMovements = [];
    this.timeSinceLastDecision = 0;
    
    // Apply configuration
    this.decisionInterval = this.configOptions.decisionInterval || 5;
    this.minimumGreenTime = this.configOptions.minimumGreenTime || 10;
    this.priorityThreshold = this.configOptions.priorityThreshold || 7;
    this.emergencyThreshold = this.configOptions.emergencyThreshold || 9;
    this.fairnessWindow = this.configOptions.fairnessWindow || 60;
    
    // Set priorities from config
    this.prioritizedDirections = this.configOptions.prioritizedDirections || [];
    this.prioritizedMovements = this.configOptions.prioritizedMovements || [];
    
    // For non-standard intersections (e.g., T-intersections), adjust the conflict matrix
    if (intersection.roads && intersection.roads.length < 4) {
      this.adjustConflictMatrixForNonStandardIntersection();
    }
  }
  
  /**
   * Update strategy based on elapsed time and traffic states
   */
  update(delta: number, trafficStates?: TrafficState[]): number[][] {
    // Update internal time tracking
    this.timeSinceLastDecision += delta;
    
    // Update green timers
    this.updateGreenTimers(delta);
    
    // Update direction history for fairness tracking
    for (const movement of this.activeMovements) {
      this.directionHistory[movement.direction.toString()] += delta;
    }
    
    // Process traffic states
    if (trafficStates && trafficStates.length > 0) {
      this.updateTrafficMetrics(trafficStates);
      
      // Check for emergency conditions that require immediate response
      if (this.checkForEmergencyConditions()) {
        console.log("[Enforcer] Emergency conditions detected, making immediate decision");
        this.makeTrafficDecision();
        this.timeSinceLastDecision = 0;
      }
      // Make normal decisions at regular intervals
      else if (this.timeSinceLastDecision >= this.decisionInterval) {
        this.makeTrafficDecision();
        this.timeSinceLastDecision = 0;
      }
    }
    
    return this.getCurrentSignalStates();
  }
  
  /**
   * Get current signal states
   */
  getCurrentSignalStates(): number[][] {
    return this.currentSignals.map(signals => [...signals]);
  }
  
  /**
   * Implementation of abstract method
   */
  protected getSignalStates(): number[][] {
    return this.getCurrentSignalStates();
  }
  
  /**
   * Reset the strategy to initial state
   */
  reset(): void {
    super.reset();
    this.resetSignals();
    this.timeSinceLastDecision = 0;
    this.activeMovements = [];
    
    // Reset timers and history
    for (let d = 0; d < 4; d++) {
      for (let m = 0; m < 3; m++) {
        this.greenTimers[`${d}-${m}`] = 0;
      }
      this.directionHistory[d.toString()] = 0;
    }
  }
  
  /**
   * Reset all signals to red
   */
  private resetSignals(): void {
    this.currentSignals = [
      [0, 0, 0], // North
      [0, 0, 0], // East
      [0, 0, 0], // South
      [0, 0, 0]  // West
    ];
  }
  
  /**
   * Update traffic metrics based on current states
   */
  private updateTrafficMetrics(trafficStates: TrafficState[]): void {
    // Update current metrics
    for (let i = 0; i < trafficStates.length; i++) {
      if (i < this.queueLengths.length) {
        this.queueLengths[i] = trafficStates[i].queueLength;
        this.waitTimes[i] = trafficStates[i].averageWaitTime;
        this.flowRates[i] = trafficStates[i].flowRate;
      }
    }
    
    // Calculate congestion scores
    this.calculateCongestionScores();
  }
  
  /**
   * Calculate congestion scores for each approach and movement
   */
  private calculateCongestionScores(): void {
    const directionNames = ['North', 'East', 'South', 'West'];
    
    for (let d = 0; d < 4; d++) {
      // Calculate based on queue length and wait time
      const queueScore = Math.min(10, this.queueLengths[d] / 2);
      const waitScore = Math.min(10, this.waitTimes[d] / 30);
      const flowScore = this.flowRates[d] > 0 ? 10 / Math.max(1, this.flowRates[d]) : 10;
      
      // Combined score (0-10)
      this.congestionScores[d] = (queueScore * 0.5 + waitScore * 0.3 + flowScore * 0.2);
      
      // Add priority bonus if this direction is prioritized
      if (this.prioritizedDirections.includes(d)) {
        this.congestionScores[d] += 2;
      }
      
      // Debug log
      if (this.congestionScores[d] > this.priorityThreshold) {
        console.log(`[Enforcer] ${directionNames[d]} approach has high congestion: ${this.congestionScores[d].toFixed(1)}`);
      }
    }
  }
  
  /**
   * Check if any green timer has exceeded minimum time
   */
  private canSwitchSignals(): boolean {
    for (const movement of this.activeMovements) {
      const key = `${movement.direction}-${movement.movement}`;
      if (this.greenTimers[key] < this.minimumGreenTime) {
        return false; // Can't switch yet, minimum green time not met
      }
    }
    return true;
  }
  
  /**
   * Update timers for green signals
   */
  private updateGreenTimers(delta: number): void {
    // Increment timer for each active movement
    for (const movement of this.activeMovements) {
      const key = `${movement.direction}-${movement.movement}`;
      this.greenTimers[key] += delta;
    }
  }
  
  /**
   * Reset timer for a movement that just turned green
   */
  private resetGreenTimer(direction: number, movement: number): void {
    const key = `${direction}-${movement}`;
    this.greenTimers[key] = 0;
  }
  
  /**
   * Check if a movement has a priority configuration
   */
  private hasConfiguredPriority(direction: number, movement: number): boolean {
    return this.prioritizedMovements.some(m => 
      m.direction === direction && m.movement === movement
    );
  }
  
  /**
   * Check if activating a movement would create conflicts with current active movements
   */
  private wouldCreateConflict(direction: number, movement: number): boolean {
    // Get movement key (e.g., "N-L" for North Left)
    const directionCodes = ['N', 'E', 'S', 'W'];
    const movementCodes = ['L', 'F', 'R'];
    const movementKey = `${directionCodes[direction]}-${movementCodes[movement]}`;
    
    // Check against each active movement
    for (const active of this.activeMovements) {
      const activeKey = `${directionCodes[active.direction]}-${movementCodes[active.movement]}`;
      
      // If the active movement conflicts with proposed movement, it would create a conflict
      if (this.conflictMatrix[activeKey]?.includes(movementKey) || 
          this.conflictMatrix[movementKey]?.includes(activeKey)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Calculate fairness score based on historical allocation
   * Returns 0-1 value where 0 is completely unfair and 1 is perfectly fair
   */
  private calculateFairnessScore(): number {
    const times = Object.values(this.directionHistory);
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    if (maxTime === 0) return 1; // No history yet
    
    return minTime / maxTime; // Closer to 1 is more fair
  }
  
  /**
   * Check for emergency conditions that require immediate attention
   */
  private checkForEmergencyConditions(): boolean {
    // Check for extremely high congestion in any direction
    for (let d = 0; d < 4; d++) {
      if (this.congestionScores[d] >= this.emergencyThreshold) {
        console.log(`[Enforcer] Emergency: Direction ${d} has critical congestion (${this.congestionScores[d].toFixed(1)})`);
        return true;
      }
    }
    
    // Check for extremely unfair allocation
    const fairnessScore = this.calculateFairnessScore();
    if (fairnessScore < 0.3 && Object.values(this.directionHistory).some(t => t > this.fairnessWindow)) {
      console.log(`[Enforcer] Emergency: Fairness is critically low (${fairnessScore.toFixed(2)})`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Make traffic control decision based on current conditions
   * This is where the "enforcer intelligence" logic lives
   */
  private makeTrafficDecision(): void {
    console.log("[Enforcer] Making traffic decision");
    
    // If we can't switch signals yet due to minimum green time, do nothing
    if (this.activeMovements.length > 0 && !this.canSwitchSignals()) {
      console.log("[Enforcer] Can't switch yet - minimum green time not met");
      return;
    }
    
    // Step 1: Score each possible movement
    const scores: { direction: number; movement: number; score: number }[] = [];
    const directionNames = ['North', 'East', 'South', 'West'];
    const movementNames = ['Left', 'Forward', 'Right'];
    
    for (let d = 0; d < 4; d++) {
      // Skip directions that don't exist in this intersection
      if (this.intersection && this.intersection.roads && 
          d >= this.intersection.roads.length) {
        continue;
      }
      
      for (let m = 0; m < 3; m++) {
        // Base score is the congestion score for this direction
        let score = this.congestionScores[d];
        
        // Adjust based on wait time for fairness
        const fairnessAdjustment = (1 - (this.directionHistory[d.toString()] / 
                                     Math.max(...Object.values(this.directionHistory)))) * 3;
        score += fairnessAdjustment;
        
        // Preference for letting traffic flow forward over turns
        if (m === 1) score += 1; // Small bonus for forward movement
        
        // Add bonus for configured priorities
        if (this.hasConfiguredPriority(d, m)) {
          score += 3;
        }
        
        scores.push({ direction: d, movement: m, score });
      }
    }
    
    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);
    
    // Step 2: Select movements to enable based on scores and conflicts
    const newActiveMovements: { direction: number, movement: number }[] = [];
    const activatedMovements: { direction: number, movement: number, score: number }[] = [];
    
    for (const candidate of scores) {
      // Skip low-priority movements
      if (candidate.score < this.priorityThreshold / 2) continue;
      
      // Check if this would conflict with any already selected movement
      let hasConflict = false;
      for (const active of newActiveMovements) {
        if (this.wouldCreateConflict(candidate.direction, candidate.movement)) {
          hasConflict = true;
          break;
        }
      }
      
      if (!hasConflict) {
        newActiveMovements.push({
          direction: candidate.direction,
          movement: candidate.movement
        });
        activatedMovements.push(candidate);
        
        console.log(`[Enforcer] Activating ${directionNames[candidate.direction]} ${movementNames[candidate.movement]} (score: ${candidate.score.toFixed(1)})`);
      }
    }
    
    // If nothing was selected, enable the highest scoring movement regardless
    if (newActiveMovements.length === 0 && scores.length > 0) {
      const best = scores[0];
      newActiveMovements.push({
        direction: best.direction,
        movement: best.movement
      });
      activatedMovements.push(best);
      
      console.log(`[Enforcer] Forced activation of ${directionNames[best.direction]} ${movementNames[best.movement]} (score: ${best.score.toFixed(1)})`);
    }
    
    // Step 3: Apply the new signal configuration
    this.resetSignals(); // All red first
    
    for (const movement of newActiveMovements) {
      // Set signal to green
      this.currentSignals[movement.direction][movement.movement] = 1;
      // Reset the green timer for this movement
      this.resetGreenTimer(movement.direction, movement.movement);
    }
    
    // Update active movements list
    this.activeMovements = [...newActiveMovements];
    
    // Log the decision
    console.log(`[Enforcer] New signal state: ${this.activeMovements.length} green signals`);
  }
  
  /**
   * Adjust conflict matrix for non-standard intersections (e.g., T-junctions)
   */
  private adjustConflictMatrixForNonStandardIntersection(): void {
    // For simplicity, we'll implement a T-intersection case (3 roads)
    // Assuming road 3 (West) is missing
    if (this.intersection && this.intersection.roads && this.intersection.roads.length === 3) {
      // Remove all conflicts related to the missing road
      Object.keys(this.conflictMatrix).forEach(key => {
        if (key.startsWith('W-')) {
          delete this.conflictMatrix[key];
        } else {
          // Remove the missing road from conflict lists
          this.conflictMatrix[key] = this.conflictMatrix[key].filter(conflict => !conflict.startsWith('W-'));
        }
      });
      
      console.log("[Enforcer] Adjusted conflict matrix for T-intersection");
    }
  }
  
  /**
   * Override updateConfig to handle complex configuration options
   */
  updateConfig(options: Record<string, any>): void {
    super.updateConfig(options);
    
    // Update specific options
    if (options.decisionInterval !== undefined) this.decisionInterval = options.decisionInterval;
    if (options.minimumGreenTime !== undefined) this.minimumGreenTime = options.minimumGreenTime;
    if (options.priorityThreshold !== undefined) this.priorityThreshold = options.priorityThreshold;
    if (options.emergencyThreshold !== undefined) this.emergencyThreshold = options.emergencyThreshold;
    if (options.fairnessWindow !== undefined) this.fairnessWindow = options.fairnessWindow;
    
    // Handle direction priorities (array of numbers)
    if (options.prioritizedDirections !== undefined) {
      this.prioritizedDirections = Array.isArray(options.prioritizedDirections) ? 
        options.prioritizedDirections : [];
    }
    
    // Handle movement priorities (array of objects)
    if (options.prioritizedMovements !== undefined) {
      this.prioritizedMovements = Array.isArray(options.prioritizedMovements) ? 
        options.prioritizedMovements : [];
    }
  }
  
  /**
   * Create this strategy from JSON data
   */
  static fromJSON(data: any, intersection: Intersection): TrafficEnforcerStrategy {
    const strategy = new TrafficEnforcerStrategy();
    
    // Restore state from saved data
    strategy.configOptions = data.configOptions || {};
    
    // Restore enforcer-specific properties
    strategy.decisionInterval = data.decisionInterval || strategy.configOptions.decisionInterval || 5;
    strategy.minimumGreenTime = data.minimumGreenTime || strategy.configOptions.minimumGreenTime || 10;
    strategy.priorityThreshold = data.priorityThreshold || strategy.configOptions.priorityThreshold || 7;
    strategy.emergencyThreshold = data.emergencyThreshold || strategy.configOptions.emergencyThreshold || 9;
    strategy.fairnessWindow = data.fairnessWindow || strategy.configOptions.fairnessWindow || 60;
    
    strategy.prioritizedDirections = data.prioritizedDirections || strategy.configOptions.prioritizedDirections || [];
    strategy.prioritizedMovements = data.prioritizedMovements || strategy.configOptions.prioritizedMovements || [];
    
    // Restore signal state if available
    if (data.currentSignals) {
      strategy.currentSignals = data.currentSignals;
    }
    
    // Restore active movements
    if (data.activeMovements) {
      strategy.activeMovements = data.activeMovements;
    }
    
    // Restore timers and history
    if (data.greenTimers) strategy.greenTimers = data.greenTimers;
    if (data.directionHistory) strategy.directionHistory = data.directionHistory;
    if (data.timeSinceLastDecision !== undefined) strategy.timeSinceLastDecision = data.timeSinceLastDecision;
    
    strategy.initialize(intersection);
    return strategy;
  }
  
  /**
   * Create from JSON (instance method)
   */
  fromJSON(data: any, intersection: Intersection): ITrafficControlStrategy {
    // Initialize with the intersection
    this.initialize(intersection);
    
    // Restore state from data
    if (data.currentPhase !== undefined) {
      this.currentPhase = data.currentPhase;
    }
    
    if (data.timeInPhase !== undefined) {
      this.timeInPhase = data.timeInPhase;
    }
    
    if (data.phaseDuration !== undefined) {
      this.phaseDuration = data.phaseDuration;
    }
    
    // Restore traffic enforcer specific properties
    if (data.decisionInterval !== undefined) {
      this.decisionInterval = data.decisionInterval;
    }
    
    if (data.timeSinceLastDecision !== undefined) {
      this.timeSinceLastDecision = data.timeSinceLastDecision;
    }
    
    if (data.minimumGreenTime !== undefined) {
      this.minimumGreenTime = data.minimumGreenTime;
    }
    
    if (data.currentSignals) {
      this.currentSignals = data.currentSignals;
    }
    
    if (data.queueLengths) {
      this.queueLengths = data.queueLengths;
    }
    
    if (data.waitTimes) {
      this.waitTimes = data.waitTimes;
    }
    
    if (data.flowRates) {
      this.flowRates = data.flowRates;
    }
    
    if (data.congestionScores) {
      this.congestionScores = data.congestionScores;
    }
    
    if (data.greenTimers) {
      this.greenTimers = data.greenTimers;
    }
    
    if (data.activeMovements) {
      this.activeMovements = data.activeMovements;
    }
    
    // Restore configuration
    if (data.configOptions) {
      this.configOptions = { ...this.configOptions, ...data.configOptions };
    }
    
    return this;
  }
  
  /**
   * Convert to JSON for serialization
   */
  toJSON(): any {
    return {
      ...super.toJSON(),
      strategyType: this.strategyType,
      decisionInterval: this.decisionInterval,
      minimumGreenTime: this.minimumGreenTime,
      priorityThreshold: this.priorityThreshold,
      emergencyThreshold: this.emergencyThreshold,
      fairnessWindow: this.fairnessWindow,
      
      prioritizedDirections: this.prioritizedDirections,
      prioritizedMovements: this.prioritizedMovements,
      
      currentSignals: this.currentSignals,
      activeMovements: this.activeMovements,
      greenTimers: this.greenTimers,
      directionHistory: this.directionHistory,
      timeSinceLastDecision: this.timeSinceLastDecision,
      
      // Current traffic metrics
      queueLengths: this.queueLengths,
      waitTimes: this.waitTimes,
      flowRates: this.flowRates,
      congestionScores: this.congestionScores
    };
  }
}
