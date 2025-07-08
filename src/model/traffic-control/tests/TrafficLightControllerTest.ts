/**
 * TrafficLightControllerTest
 * 
 * Test suite for the TrafficLightController class and its integration with strategies.
 * Tests that switching strategies changes control behavior and that the system
 * remains stable and efficient.
 */

import Intersection = require('../../intersection');
import Rect = require('../../../geom/rect');
import TrafficLightController = require('../TrafficLightController');
import { TrafficState } from '../ITrafficControlStrategy';
import { trafficControlStrategyManager } from '../TrafficControlStrategyManager';
import { FixedTimingStrategy } from '../FixedTimingStrategy';
import { AdaptiveTimingStrategy } from '../AdaptiveTimingStrategy';
import { TrafficEnforcerStrategy } from '../TrafficEnforcerStrategy';

export class TrafficLightControllerTest {
  private intersection: Intersection;
  private controller: TrafficLightController;
  
  constructor() {
    // Create a mock intersection
    this.intersection = new Intersection(new Rect(0, 0, 100, 100));
    this.intersection.id = 'test-intersection';
    
    // Create the controller
    this.controller = new TrafficLightController(this.intersection);
  }
  
  /**
   * Run all tests
   */
  runTests(): boolean {
    console.log('=== Running TrafficLightController Tests ===');
    
    let allPassed = true;
    const tests = [
      this.testInitialization,
      this.testStrategySwitch,
      this.testDefaultStrategy,
      this.testStateAccess,
      this.testStrategyIntegration,
      this.testSerialization,
      this.testDifferentBehaviors
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
    // Check that controller initializes properly with default strategy
    const initialState = this.controller.state;
    
    // State should be a 4x3 array (4 approaches, 3 movements per approach)
    const isValidState = initialState.length === 4 && 
                        initialState.every(approach => approach.length === 3);
    
    // Check that traffic states were initialized
    const hasTrafficStates = Array.isArray(this.controller['trafficStates']) &&
                            this.controller['trafficStates'].length === 4;
    
    return isValidState && hasTrafficStates;
  }
  
  /**
   * Test strategy switching
   */
  testStrategySwitch(): boolean {
    // Get current strategy type
    const initialStrategyType = this.controller.getStrategy().strategyType;
    
    // Find a different strategy to switch to
    const availableTypes = trafficControlStrategyManager.getAvailableStrategyTypes();
    const differentType = availableTypes.find(type => type !== initialStrategyType);
    
    if (!differentType) {
      console.error("Couldn't find a different strategy to switch to");
      return false;
    }
    
    // Switch to different strategy
    const switchSuccess = this.controller.setStrategy(differentType);
    if (!switchSuccess) {
      console.error(`Failed to switch to strategy ${differentType}`);
      return false;
    }
    
    // Verify that strategy changed
    const newStrategyType = this.controller.getStrategy().strategyType;
    
    return newStrategyType === differentType && newStrategyType !== initialStrategyType;
  }
  
  /**
   * Test that a default strategy is always active
   */
  testDefaultStrategy(): boolean {
    // Create a new controller
    const controller = new TrafficLightController(this.intersection);
    
    // Strategy should exist and have a valid type
    const strategy = controller.getStrategy();
    
    return !!strategy && 
           typeof strategy.strategyType === 'string' && 
           strategy.strategyType.length > 0;
  }
  
  /**
   * Test state access
   */
  testStateAccess(): boolean {
    // Get state
    const state = this.controller.state;
    
    // State should be a 4x3 array with valid values (0 or 1)
    const isValidState = state.length === 4 && 
                        state.every(approach => 
                          approach.length === 3 && 
                          approach.every(signal => signal === 0 || signal === 1));
    
    return isValidState;
  }
  
  /**
   * Test that controller correctly integrates with strategies
   */
  testStrategyIntegration(): boolean {
    // Set fixed timing strategy
    this.controller.setStrategy('fixed-timing');
    
    // Update a few times
    for (let i = 0; i < 5; i++) {
      this.controller.onTick(1.0);
    }
    
    // Get state after updates
    const state1 = this.controller.state;
    
    // Save phase info
    const phase1 = this.controller.getStrategy().getCurrentPhase();
    
    // Update a lot more to trigger phase change
    for (let i = 0; i < 30; i++) {
      this.controller.onTick(1.0);
    }
    
    // Get state after more updates
    const state2 = this.controller.state;
    
    // Phase should have changed
    const phase2 = this.controller.getStrategy().getCurrentPhase();
    
    // Either phase or state should be different
    const phaseDifferent = phase1 !== phase2;
    const stateDifferent = JSON.stringify(state1) !== JSON.stringify(state2);
    
    return phaseDifferent || stateDifferent;
  }
  
  /**
   * Test serialization and deserialization
   */
  testSerialization(): boolean {
    // Configure with non-default strategy
    this.controller.setStrategy('adaptive-timing');
    
    // Update a bit to establish state
    for (let i = 0; i < 5; i++) {
      this.controller.onTick(1.0);
    }
    
    // Serialize
    const json = this.controller.toJSON();
    
    // Deserialize
    const newController = TrafficLightController.copy(json, this.intersection);
    
    // Check that the strategy type matches
    const originalType = this.controller.getStrategy().strategyType;
    const newType = newController.getStrategy().strategyType;
    
    return originalType === newType;
  }
  
  /**
   * Test that different strategies produce different behaviors
   */
  testDifferentBehaviors(): boolean {
    const trafficStates = this.createHighTrafficStates();
    
    // Test with fixed timing strategy
    this.controller.setStrategy('fixed-timing');
    const fixedStates: number[][][] = [];
    
    for (let i = 0; i < 50; i++) {
      this.controller.onTick(1.0);
      // Only record every 10th state to reduce noise
      if (i % 10 === 0) {
        fixedStates.push(JSON.parse(JSON.stringify(this.controller.state)));
      }
    }
    
    // Test with adaptive timing strategy
    this.controller.setStrategy('adaptive-timing');
    const adaptiveStates: number[][][] = [];
    
    for (let i = 0; i < 50; i++) {
      // Update traffic states
      this.updateControllerTrafficStates(trafficStates);
      this.controller.onTick(1.0);
      
      // Only record every 10th state to reduce noise
      if (i % 10 === 0) {
        adaptiveStates.push(JSON.parse(JSON.stringify(this.controller.state)));
      }
    }
    
    // Test with enforcer strategy
    this.controller.setStrategy('traffic-enforcer');
    const enforcerStates: number[][][] = [];
    
    for (let i = 0; i < 50; i++) {
      // Update traffic states
      this.updateControllerTrafficStates(trafficStates);
      this.controller.onTick(1.0);
      
      // Only record every 10th state to reduce noise
      if (i % 10 === 0) {
        enforcerStates.push(JSON.parse(JSON.stringify(this.controller.state)));
      }
    }
    
    // Compare states between strategies
    // We expect at least some differences between the strategies
    let fixedVsAdaptiveDifferent = false;
    let fixedVsEnforcerDifferent = false;
    let adaptiveVsEnforcerDifferent = false;
    
    for (let i = 0; i < Math.min(fixedStates.length, adaptiveStates.length, enforcerStates.length); i++) {
      if (JSON.stringify(fixedStates[i]) !== JSON.stringify(adaptiveStates[i])) {
        fixedVsAdaptiveDifferent = true;
      }
      
      if (JSON.stringify(fixedStates[i]) !== JSON.stringify(enforcerStates[i])) {
        fixedVsEnforcerDifferent = true;
      }
      
      if (JSON.stringify(adaptiveStates[i]) !== JSON.stringify(enforcerStates[i])) {
        adaptiveVsEnforcerDifferent = true;
      }
    }
    
    // All strategy pairs should have at least one difference
    return fixedVsAdaptiveDifferent && fixedVsEnforcerDifferent && adaptiveVsEnforcerDifferent;
  }
  
  /**
   * Helper method to create traffic states with high traffic volume
   */
  private createHighTrafficStates(): TrafficState[] {
    // Create traffic states with high volume in North direction
    return [
      { queueLength: 10, averageWaitTime: 30, maxWaitTime: 50, flowRate: 5, signalState: [0, 0, 0] },
      { queueLength: 2, averageWaitTime: 5, maxWaitTime: 10, flowRate: 8, signalState: [0, 0, 0] },
      { queueLength: 3, averageWaitTime: 10, maxWaitTime: 15, flowRate: 7, signalState: [0, 0, 0] },
      { queueLength: 1, averageWaitTime: 3, maxWaitTime: 5, flowRate: 10, signalState: [0, 0, 0] }
    ];
  }
  
  /**
   * Helper method to update controller traffic states
   */
  private updateControllerTrafficStates(states: TrafficState[]): void {
    // Update controller's traffic states directly
    // This is a bit of a hack, but it's the easiest way to test strategies
    if (this.controller['trafficStates']) {
      for (let i = 0; i < states.length; i++) {
        if (i < this.controller['trafficStates'].length) {
          this.controller['trafficStates'][i].queueLength = states[i].queueLength;
          this.controller['trafficStates'][i].averageWaitTime = states[i].averageWaitTime;
          this.controller['trafficStates'][i].maxWaitTime = states[i].maxWaitTime;
          this.controller['trafficStates'][i].flowRate = states[i].flowRate;
        }
      }
    }
  }
}

// Export the test class
export default TrafficLightControllerTest;
