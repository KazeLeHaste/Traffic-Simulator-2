/**
 * AdaptiveTimingStrategyTest
 * 
 * Test suite for the AdaptiveTimingStrategy implementation
 */

import Intersection = require('../../intersection');
import Rect = require('../../../geom/rect');
import { AdaptiveTimingStrategy } from '../AdaptiveTimingStrategy';
import { TrafficState } from '../ITrafficControlStrategy';

export class AdaptiveTimingStrategyTest {
  private strategy: AdaptiveTimingStrategy;
  private intersection: Intersection;
  
  constructor() {
    // Create a mock intersection
    this.intersection = new Intersection(new Rect(0, 0, 100, 100));
    this.intersection.id = 'test-intersection';
    
    // Create the strategy
    this.strategy = new AdaptiveTimingStrategy();
    
    // Enable logging for tests
    this.strategy.updateConfig({ enableLogging: true });
  }
  
  /**
   * Run all tests
   */
  runTests(): boolean {
    console.log('=== Running AdaptiveTimingStrategy Tests ===');
    
    let allPassed = true;
    const tests = [
      this.testInitialization,
      this.testNoTrafficDefaultBehavior,
      this.testLightTrafficBehavior,
      this.testHeavyTrafficBehavior,
      this.testImbalancedTrafficBehavior,
      this.testRushHourTrafficBehavior,
      this.testConfigOptions,
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
    return this.strategy.strategyType === 'adaptive-timing' && 
           this.strategy.getCurrentPhase() === 0;
  }
  
  /**
   * Test behavior with no traffic
   */
  testNoTrafficDefaultBehavior(): boolean {
    this.setup();
    
    // Simulate 30 seconds with no traffic
    const states = this.createTrafficStates([0, 0, 0, 0], [0, 0, 0, 0]);
    
    // Should behave like fixed timing
    let phaseChanged = false;
    let totalTime = 0;
    const timeStep = 1.0; // 1 second steps
    
    // Run for up to 120 seconds
    for (let i = 0; i < 120 && !phaseChanged; i++) {
      this.strategy.update(timeStep, states);
      totalTime += timeStep;
      
      // Check if phase changed
      if (this.strategy.getCurrentPhase() !== 0) {
        phaseChanged = true;
      }
    }
    
    console.log(`Phase changed after ${totalTime}s with no traffic`);
    
    // Should change at around the base duration (default is 30s)
    const baseTime = this.strategy.getConfigOptions().baseDuration;
    
    // Allow 20% tolerance
    return phaseChanged && Math.abs(totalTime - baseTime) < (baseTime * 0.2);
  }
  
  /**
   * Test behavior with light traffic
   */
  testLightTrafficBehavior(): boolean {
    this.setup();
    
    // Light traffic on all approaches
    const queueLengths = [1, 1, 1, 1];
    const waitTimes = [5, 5, 5, 5];
    const states = this.createTrafficStates(queueLengths, waitTimes);
    
    // Should adjust slightly from base timing
    let phaseChanged = false;
    let totalTime = 0;
    const timeStep = 1.0;
    
    // Run for up to 120 seconds
    for (let i = 0; i < 120 && !phaseChanged; i++) {
      this.strategy.update(timeStep, states);
      totalTime += timeStep;
      
      if (this.strategy.getCurrentPhase() !== 0) {
        phaseChanged = true;
      }
    }
    
    console.log(`Phase changed after ${totalTime}s with light traffic`);
    
    // Should be slightly longer than base
    const baseTime = this.strategy.getConfigOptions().baseDuration;
    return phaseChanged && totalTime > baseTime && totalTime < baseTime * 1.5;
  }
  
  /**
   * Test behavior with heavy traffic
   */
  testHeavyTrafficBehavior(): boolean {
    this.setup();
    
    // Heavy traffic on all approaches
    const queueLengths = [5, 5, 5, 5];
    const waitTimes = [20, 20, 20, 20];
    const states = this.createTrafficStates(queueLengths, waitTimes);
    
    // Should extend phase to closer to max duration
    let phaseChanged = false;
    let totalTime = 0;
    const timeStep = 1.0;
    
    // Run for up to 120 seconds
    for (let i = 0; i < 120 && !phaseChanged; i++) {
      this.strategy.update(timeStep, states);
      totalTime += timeStep;
      
      if (this.strategy.getCurrentPhase() !== 0) {
        phaseChanged = true;
      }
    }
    
    console.log(`Phase changed after ${totalTime}s with heavy traffic`);
    
    // Should be longer, close to max
    const baseTime = this.strategy.getConfigOptions().baseDuration;
    const maxTime = this.strategy.getConfigOptions().maxPhaseDuration;
    
    // Should be at least 50% of the way from base to max
    const expectedMinTime = baseTime + (maxTime - baseTime) * 0.5;
    return phaseChanged && totalTime >= expectedMinTime;
  }
  
  /**
   * Test behavior with imbalanced traffic
   */
  testImbalancedTrafficBehavior(): boolean {
    this.setup();
    
    // Start with balanced light traffic
    let queueLengths = [1, 1, 1, 1];
    let waitTimes = [5, 5, 5, 5];
    let states = this.createTrafficStates(queueLengths, waitTimes);
    
    // Run for a while to establish baseline
    for (let i = 0; i < 10; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Now create imbalance - heavy traffic on next phase (E-W)
    queueLengths = [1, 5, 1, 5]; // Higher on East-West (indices 1 & 3)
    waitTimes = [5, 25, 5, 25];  // Higher on East-West
    states = this.createTrafficStates(queueLengths, waitTimes);
    
    // Should switch earlier than normal
    let phaseChanged = false;
    let totalTime = 0;
    const timeStep = 1.0;
    
    // Run for up to 120 seconds
    for (let i = 0; i < 120 && !phaseChanged; i++) {
      this.strategy.update(timeStep, states);
      totalTime += timeStep;
      
      if (this.strategy.getCurrentPhase() !== 0) {
        phaseChanged = true;
      }
    }
    
    console.log(`Phase changed after ${totalTime}s with imbalanced traffic`);
    
    // Should switch earlier than base time due to high demand in next phase
    const baseTime = this.strategy.getConfigOptions().baseDuration;
    return phaseChanged && totalTime < baseTime * 0.9;
  }
  
  /**
   * Test behavior with rush hour traffic pattern
   */
  testRushHourTrafficBehavior(): boolean {
    this.setup();
    
    // First test: consistent high demand on North-South (current phase)
    let queueLengths = [5, 1, 5, 1]; // High on N-S (indices 0 & 2)
    let waitTimes = [20, 5, 20, 5];  // High on N-S
    let states = this.createTrafficStates(queueLengths, waitTimes);
    
    // Should extend the phase
    let phaseChanged = false;
    let totalTime = 0;
    const timeStep = 1.0;
    
    // Run for up to 120 seconds
    for (let i = 0; i < 120 && !phaseChanged; i++) {
      this.strategy.update(timeStep, states);
      totalTime += timeStep;
      
      if (this.strategy.getCurrentPhase() !== 0) {
        phaseChanged = true;
      }
    }
    
    console.log(`Phase 1 changed after ${totalTime}s with rush hour traffic (N-S)`);
    
    // Now advance to E-W phase (phase 3)
    this.strategy.update(timeStep, states); // Phase 1
    this.strategy.update(timeStep, states); // Phase 2
    
    // Reset metrics
    phaseChanged = false;
    totalTime = 0;
    
    // Run with low traffic on E-W (current phase)
    queueLengths = [5, 1, 5, 1]; // Still high on N-S, low on E-W
    waitTimes = [20, 5, 20, 5];
    states = this.createTrafficStates(queueLengths, waitTimes);
    
    // Should shorten the phase for E-W since demand is low
    for (let i = 0; i < 120 && !phaseChanged; i++) {
      this.strategy.update(timeStep, states);
      totalTime += timeStep;
      
      if (this.strategy.getCurrentPhase() !== 2) { // Check phase 3 changed
        phaseChanged = true;
      }
    }
    
    console.log(`Phase 3 changed after ${totalTime}s with rush hour traffic (low E-W)`);
    
    // Should change quickly since there's low traffic on current phase but high on next
    const minTime = this.strategy.getConfigOptions().minPhaseDuration;
    const baseTime = this.strategy.getConfigOptions().baseDuration;
    
    // Should be closer to minimum than base
    return phaseChanged && totalTime < (minTime + baseTime) / 2;
  }
  
  /**
   * Test configuration options
   */
  testConfigOptions(): boolean {
    this.setup();
    
    // Update configuration
    const testConfig = {
      minPhaseDuration: 8,
      maxPhaseDuration: 45,
      baseDuration: 25,
      trafficSensitivity: 0.8,
      queueWeight: 1.5,
      waitTimeWeight: 0.7
    };
    
    this.strategy.updateConfig(testConfig);
    
    // Check that config was applied
    const config = this.strategy.getConfigOptions();
    return config.minPhaseDuration === 8 && 
           config.maxPhaseDuration === 45 &&
           config.baseDuration === 25 &&
           config.trafficSensitivity === 0.8 &&
           config.queueWeight === 1.5 &&
           config.waitTimeWeight === 0.7;
  }
  
  /**
   * Test serialization and deserialization
   */
  testSerialization(): boolean {
    this.setup();
    
    // Update configuration with non-default values
    this.strategy.updateConfig({
      minPhaseDuration: 8,
      maxPhaseDuration: 45,
      trafficSensitivity: 0.8,
      enableLogging: true
    });
    
    // Run for a bit to accumulate some history
    const states = this.createTrafficStates([3, 1, 3, 1], [15, 5, 15, 5]);
    for (let i = 0; i < 15; i++) {
      this.strategy.update(1.0, states);
    }
    
    // Serialize
    const json = this.strategy.toJSON();
    
    // Deserialize
    const newStrategy = AdaptiveTimingStrategy.fromJSON(json, this.intersection);
    
    // Check that key properties match
    return newStrategy.strategyType === this.strategy.strategyType && 
           newStrategy.getConfigOptions().minPhaseDuration === 8 &&
           newStrategy.getConfigOptions().maxPhaseDuration === 45 &&
           newStrategy.getConfigOptions().trafficSensitivity === 0.8 &&
           newStrategy.getConfigOptions().enableLogging === true;
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
    this.strategy = new AdaptiveTimingStrategy();
    this.strategy.initialize(this.intersection);
    this.strategy.updateConfig({ enableLogging: true });
  }
}

// Export the test class
export default AdaptiveTimingStrategyTest;
