/**
 * TrafficEnforcerStrategyTest
 * 
 * Test suite for the TrafficEnforcerStrategy implementation
 */

import Intersection = require('../../intersection');
import Rect = require('../../../geom/rect');
import { TrafficEnforcerStrategy } from '../TrafficEnforcerStrategy';
import { TrafficState } from '../ITrafficControlStrategy';

export class TrafficEnforcerStrategyTest {
  private strategy: TrafficEnforcerStrategy;
  private intersection: Intersection;
  
  constructor() {
    // Create a mock intersection
    this.intersection = new Intersection(new Rect(0, 0, 100, 100));
    this.intersection.id = 'test-intersection';
    
    // Create the strategy
    this.strategy = new TrafficEnforcerStrategy();
    
    // Configure for testing
    this.strategy.updateConfig({
      decisionInterval: 2, // Shorter interval for testing
      minimumGreenTime: 3  // Shorter minimum green time for testing
    });
    
    this.strategy.initialize(this.intersection);
  }
  
  /**
   * Run all tests
   */
  runTests(): boolean {
    console.log('=== Running TrafficEnforcerStrategy Tests ===');
    
    let allPassed = true;
    const tests = [
      this.testInitialization,
      this.testBasicDecisionMaking,
      this.testConflictAvoidance,
      this.testPriorityHandling,
      this.testEmergencyConditions,
      this.testFairnessHandling,
      this.testSerialization
    ];
    
    for (const test of tests) {
      try {
        console.log(`\nRunning: ${test.name}`);
        const passed = test.call(this);
        console.log(`${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
        allPassed = allPassed && passed;
      } catch (e) {
        console.error(`Test ${test.name} FAILED with error:`, e);
        allPassed = false;
      }
    }
    
    console.log(`\nFinal result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
  }
  
  /**
   * Test basic initialization
   */
  testInitialization(): boolean {
    this.setup();
    
    // Check that strategy initialized properly
    const initialState = this.strategy.getCurrentSignalStates();
    
    // All signals should start as red
    const allRed = initialState.every(direction => 
      direction.every(signal => signal === 0)
    );
    
    return this.strategy.strategyType === 'traffic-enforcer' && allRed;
  }
  
  /**
   * Test basic decision-making
   */
  testBasicDecisionMaking(): boolean {
    this.setup();
    
    // Simulate traffic in North direction
    const states = this.createTrafficStates([5, 0, 0, 0], [20, 0, 0, 0]);
    
    // Run for a few seconds to trigger decision making
    for (let i = 0; i < 10; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Check that at least one signal in the North direction is green
    const currentState = this.strategy.getCurrentSignalStates();
    const northSignal = currentState[0]; // North direction
    
    const northHasGreen = northSignal.some(signal => signal === 1);
    
    if (!northHasGreen) {
      console.log("Expected North direction to have at least one green signal");
      console.log("Current state:", currentState);
      return false;
    }
    
    return true;
  }
  
  /**
   * Test that conflicting movements aren't allowed simultaneously
   */
  testConflictAvoidance(): boolean {
    this.setup();
    
    // Heavy congestion in all directions
    const states = this.createTrafficStates([10, 10, 10, 10], [30, 30, 30, 30]);
    
    // Run for enough time to make several decisions
    for (let i = 0; i < 20; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Check current state
    const currentState = this.strategy.getCurrentSignalStates();
    
    // Define conflicting pairs to check
    // We'll check a few key conflicts: 
    // 1. North-South vs East-West through movements
    // 2. Left turns vs opposing through movements
    const conflicts = [
      { dir1: 0, mov1: 1, dir2: 1, mov2: 1 }, // N-straight vs E-straight
      { dir1: 0, mov1: 0, dir2: 2, mov2: 1 }, // N-left vs S-straight
      { dir1: 1, mov1: 0, dir2: 3, mov2: 1 }, // E-left vs W-straight
    ];
    
    // Check each conflict pair
    for (const conflict of conflicts) {
      const signal1 = currentState[conflict.dir1][conflict.mov1];
      const signal2 = currentState[conflict.dir2][conflict.mov2];
      
      if (signal1 === 1 && signal2 === 1) {
        console.log(`Conflict detected: Direction ${conflict.dir1} movement ${conflict.mov1} and Direction ${conflict.dir2} movement ${conflict.mov2} are both green`);
        console.log("Current state:", currentState);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Test priority handling
   */
  testPriorityHandling(): boolean {
    this.setup();
    
    // Configure priorities
    this.strategy.updateConfig({
      prioritizedDirections: [1], // East direction gets priority
      prioritizedMovements: [{ direction: 1, movement: 1 }] // East straight movement
    });
    
    // Equal congestion in all directions
    const states = this.createTrafficStates([5, 5, 5, 5], [15, 15, 15, 15]);
    
    // Run for enough time to make a decision
    for (let i = 0; i < 10; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Check that East direction has been prioritized
    const currentState = this.strategy.getCurrentSignalStates();
    const eastSignal = currentState[1]; // East direction
    const eastStraightIsGreen = eastSignal[1] === 1; // Check if straight movement is green
    
    if (!eastStraightIsGreen) {
      console.log("Expected East straight movement to be prioritized");
      console.log("Current state:", currentState);
      return false;
    }
    
    return true;
  }
  
  /**
   * Test emergency conditions
   */
  testEmergencyConditions(): boolean {
    this.setup();
    
    // Configure emergency threshold
    this.strategy.updateConfig({
      emergencyThreshold: 8 // Lower threshold for testing
    });
    
    // First, establish some baseline with moderate congestion
    let states = this.createTrafficStates([3, 3, 3, 3], [10, 10, 10, 10]);
    for (let i = 0; i < 5; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Record initial state
    const initialState = this.strategy.getCurrentSignalStates();
    
    // Now create emergency in North direction
    states = this.createTrafficStates([15, 3, 3, 3], [45, 10, 10, 10]);
    
    // Should trigger immediate decision
    this.strategy.update(1.0, states);
    
    // Check that North direction has green signal after emergency
    const currentState = this.strategy.getCurrentSignalStates();
    const northSignal = currentState[0]; // North direction
    const northHasGreen = northSignal.some(signal => signal === 1);
    
    if (!northHasGreen) {
      console.log("Expected North direction to have green signal after emergency");
      console.log("Current state:", currentState);
      return false;
    }
    
    return true;
  }
  
  /**
   * Test fairness handling
   */
  testFairnessHandling(): boolean {
    this.setup();
    
    // First give a lot of green time to North direction
    let states = this.createTrafficStates([10, 1, 1, 1], [30, 5, 5, 5]);
    for (let i = 0; i < 30; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Now equalize congestion but South has been neglected
    states = this.createTrafficStates([5, 5, 5, 5], [15, 15, 15, 15]);
    
    // Run for enough time to make several decisions
    for (let i = 0; i < 20; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Check that South direction gets green time due to fairness
    const currentState = this.strategy.getCurrentSignalStates();
    let southGreenObserved = false;
    
    // We'd need to run the simulation longer to guarantee South gets green,
    // but for test purposes, we'll just check if South has green now
    if (currentState[2].some(signal => signal === 1)) {
      southGreenObserved = true;
    }
    
    return southGreenObserved;
  }
  
  /**
   * Test serialization and deserialization
   */
  testSerialization(): boolean {
    this.setup();
    
    // Configure with non-default values
    this.strategy.updateConfig({
      decisionInterval: 7,
      prioritizedDirections: [2],
      priorityThreshold: 6
    });
    
    // Establish some state
    const states = this.createTrafficStates([5, 3, 8, 2], [15, 10, 25, 8]);
    for (let i = 0; i < 10; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Serialize
    const json = this.strategy.toJSON();
    
    // Deserialize
    const newStrategy = TrafficEnforcerStrategy.fromJSON(json, this.intersection);
    
    // Check that key properties match
    const matchesType = newStrategy.strategyType === 'traffic-enforcer';
    const matchesInterval = newStrategy.getConfigOptions().decisionInterval === 7;
    const matchesPriorities = Array.isArray(newStrategy.getConfigOptions().prioritizedDirections) && 
                              newStrategy.getConfigOptions().prioritizedDirections.includes(2);
    const matchesThreshold = newStrategy.getConfigOptions().priorityThreshold === 6;
    
    // Also check that signal states were preserved
    const originalState = this.strategy.getCurrentSignalStates();
    const newState = newStrategy.getCurrentSignalStates();
    
    const signalsMatch = JSON.stringify(originalState) === JSON.stringify(newState);
    
    return matchesType && matchesInterval && matchesPriorities && 
           matchesThreshold && signalsMatch;
  }
  
  /**
   * Helper to create traffic states for testing
   */
  private createTrafficStates(queueLengths: number[], waitTimes: number[]): TrafficState[] {
    const states: TrafficState[] = [];
    
    for (let i = 0; i < 4; i++) {
      states.push({
        queueLength: queueLengths[i] || 0,
        averageWaitTime: waitTimes[i] || 0,
        maxWaitTime: waitTimes[i] * 1.5 || 0,
        flowRate: queueLengths[i] > 0 ? queueLengths[i] / 2 : 0,
        signalState: [0, 0, 0] // Placeholder, updated by strategy
      });
    }
    
    return states;
  }
  
  /**
   * Reset for a new test
   */
  private setup() {
    this.strategy = new TrafficEnforcerStrategy();
    this.strategy.updateConfig({
      decisionInterval: 2, // Shorter interval for testing
      minimumGreenTime: 3  // Shorter minimum green time for testing
    });
    this.strategy.initialize(this.intersection);
  }
}

// Export the test class
export default TrafficEnforcerStrategyTest;
