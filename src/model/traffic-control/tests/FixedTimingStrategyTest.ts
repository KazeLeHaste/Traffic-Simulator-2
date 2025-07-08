/**
 * FixedTimingStrategy Tests
 * 
 * This file contains tests for the FixedTimingStrategy to verify its behavior
 * and timing accuracy.
 */

import Intersection = require('../../intersection');
import Rect = require('../../../geom/rect');
import { FixedTimingStrategy } from '../FixedTimingStrategy';
import { TrafficState } from '../ITrafficControlStrategy';

/**
 * Simple test utility to verify FixedTimingStrategy behavior
 */
export class FixedTimingStrategyTest {
  private strategy: FixedTimingStrategy;
  private intersection: Intersection;
  private testResults: {
    name: string;
    passed: boolean;
    message: string;
  }[] = [];

  constructor() {
    // Create a test intersection
    this.intersection = new Intersection(new Rect(0, 0, 100, 100));
    
    // Create the strategy
    this.strategy = new FixedTimingStrategy();
    this.strategy.initialize(this.intersection);
    
    // Enable logging for the strategy
    this.strategy.setLogging(true);
  }

  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('=== Running FixedTimingStrategy Tests ===');
    
    this.testInitialization();
    this.testPhaseTransitions();
    this.testTimingAccuracy();
    this.testConfigChanges();
    this.testSerializationDeserialization();
    
    // Report results
    this.reportResults();
  }

  /**
   * Test basic initialization
   */
  testInitialization(): void {
    try {
      // Check strategy has correct number of phases
      const totalPhases = this.strategy.getTotalPhases();
      this.assert(
        totalPhases > 0,
        'Initialization',
        `Strategy should have phases defined (found ${totalPhases})`
      );
      
      // Check current phase is 0
      const currentPhase = this.strategy.getCurrentPhase();
      this.assert(
        currentPhase === 0,
        'Initialization',
        `Initial phase should be 0 (found ${currentPhase})`
      );
      
      // Check config options
      const config = this.strategy.getConfigOptions();
      this.assert(
        config.baseDuration > 0,
        'Initialization',
        `Base duration should be positive (found ${config.baseDuration})`
      );
    } catch (error) {
      this.fail('Initialization', `Unexpected error: ${error}`);
    }
  }

  /**
   * Test phase transitions
   */
  testPhaseTransitions(): void {
    try {
      // Reset the strategy
      this.strategy.reset();
      
      // Check initial phase
      const initialPhase = this.strategy.getCurrentPhase();
      this.assert(
        initialPhase === 0,
        'PhaseTransitions',
        `Initial phase should be 0 (found ${initialPhase})`
      );
      
      // Get config and set base duration to 1 second for quicker tests
      const config = this.strategy.getConfigOptions();
      config.baseDuration = 1;
      config.variationPercentage = 0; // No variation for predictable tests
      this.strategy.updateConfig(config);
      
      // Get initial signal states
      const initialStates = this.strategy.update(0);
      
      // Advance time by just under 1 second
      this.strategy.update(0.9);
      const samePhaseStates = this.strategy.update(0);
      
      // Check we're still in the same phase
      this.assert(
        this.strategy.getCurrentPhase() === initialPhase,
        'PhaseTransitions',
        `Should remain in phase ${initialPhase} after 0.9s`
      );
      
      // Signal states should be the same
      this.assert(
        JSON.stringify(initialStates) === JSON.stringify(samePhaseStates),
        'PhaseTransitions',
        'Signal states should be unchanged within the same phase'
      );
      
      // Advance time beyond the phase duration
      this.strategy.update(0.2);
      
      // Check we've moved to the next phase
      const totalPhases = this.strategy.getTotalPhases();
      const expectedPhase = totalPhases > 1 ? 1 : 0;
      this.assert(
        this.strategy.getCurrentPhase() === expectedPhase,
        'PhaseTransitions',
        `Should advance to phase ${expectedPhase} after exceeding duration`
      );
      
      // Signal states should be different if we have multiple phases
      if (totalPhases > 1) {
        const newStates = this.strategy.update(0);
        this.assert(
          JSON.stringify(initialStates) !== JSON.stringify(newStates),
          'PhaseTransitions',
          'Signal states should change between phases'
        );
      }
    } catch (error) {
      this.fail('PhaseTransitions', `Unexpected error: ${error}`);
    }
  }

  /**
   * Test timing accuracy
   */
  testTimingAccuracy(): void {
    try {
      // Reset the strategy
      this.strategy.reset();
      this.strategy.resetTimingStatistics();
      
      // Get config and set base duration to 1 second for quicker tests
      const config = this.strategy.getConfigOptions();
      config.baseDuration = 1;
      config.variationPercentage = 0; // No variation for predictable tests
      this.strategy.updateConfig(config);
      
      // Run for multiple phases
      const phasesToTest = 3;
      const totalPhases = this.strategy.getTotalPhases();
      const actualPhases = Math.min(phasesToTest, totalPhases);
      
      console.log(`Testing timing accuracy over ${actualPhases} phases...`);
      
      for (let i = 0; i < actualPhases; i++) {
        // Small increments to simulate real-time updates
        for (let time = 0; time < 1.1; time += 0.1) {
          this.strategy.update(0.1);
        }
      }
      
      // Get timing statistics
      const stats = this.strategy.getTimingStatistics();
      
      // Check average deviation is within 10%
      this.assert(
        stats.averageDeviation < 0.1,
        'TimingAccuracy',
        `Average timing deviation should be less than 0.1s (found ${stats.averageDeviation.toFixed(3)}s)`
      );
      
      // Check max deviation is within 20%
      this.assert(
        stats.maxDeviation < 0.2,
        'TimingAccuracy',
        `Max timing deviation should be less than 0.2s (found ${stats.maxDeviation.toFixed(3)}s)`
      );
    } catch (error) {
      this.fail('TimingAccuracy', `Unexpected error: ${error}`);
    }
  }

  /**
   * Test configuration changes
   */
  testConfigChanges(): void {
    try {
      // Reset the strategy
      this.strategy.reset();
      
      // Get initial config
      const initialConfig = this.strategy.getConfigOptions();
      
      // Update config
      const newConfig = {
        ...initialConfig,
        baseDuration: 2,
        variationPercentage: 0
      };
      
      this.strategy.updateConfig(newConfig);
      
      // Check config was updated
      const updatedConfig = this.strategy.getConfigOptions();
      this.assert(
        updatedConfig.baseDuration === 2,
        'ConfigChanges',
        `Base duration should be updated to 2 (found ${updatedConfig.baseDuration})`
      );
      
      // Check timing is affected by config change
      // Run for one phase
      let phaseChanged = false;
      let initialPhase = this.strategy.getCurrentPhase();
      
      // Should NOT change phase after 1 second (new duration is 2 seconds)
      for (let time = 0; time < 1.1; time += 0.1) {
        this.strategy.update(0.1);
        if (this.strategy.getCurrentPhase() !== initialPhase) {
          phaseChanged = true;
        }
      }
      
      this.assert(
        !phaseChanged,
        'ConfigChanges',
        'Phase should not change before the new duration'
      );
      
      // Should change phase after another second
      phaseChanged = false;
      for (let time = 0; time < 1.1; time += 0.1) {
        this.strategy.update(0.1);
        if (this.strategy.getCurrentPhase() !== initialPhase) {
          phaseChanged = true;
        }
      }
      
      // Only assert if we have more than one phase
      if (this.strategy.getTotalPhases() > 1) {
        this.assert(
          phaseChanged,
          'ConfigChanges',
          'Phase should change after the new duration'
        );
      }
    } catch (error) {
      this.fail('ConfigChanges', `Unexpected error: ${error}`);
    }
  }

  /**
   * Test serialization and deserialization
   */
  testSerializationDeserialization(): void {
    try {
      // Reset the strategy
      this.strategy.reset();
      
      // Update config for a unique test value
      const testConfig = {
        baseDuration: 3.5,
        variationPercentage: 2.5,
        testValue: 'test123'
      };
      
      this.strategy.updateConfig(testConfig);
      
      // Set a specific phase
      while (this.strategy.getCurrentPhase() !== 1 % this.strategy.getTotalPhases()) {
        this.strategy.update(10); // Force phase change
      }
      
      // Serialize
      const serialized = this.strategy.toJSON();
      
      // Create a new strategy from the serialized data
      const newStrategy = FixedTimingStrategy.fromJSON(serialized, this.intersection);
      
      // Check deserialized properties
      this.assert(
        newStrategy.getCurrentPhase() === this.strategy.getCurrentPhase(),
        'Serialization',
        `Current phase should be preserved (expected ${this.strategy.getCurrentPhase()}, got ${newStrategy.getCurrentPhase()})`
      );
      
      // Check config was preserved
      const deserializedConfig = newStrategy.getConfigOptions();
      this.assert(
        deserializedConfig.baseDuration === testConfig.baseDuration,
        'Serialization',
        `Base duration should be preserved (expected ${testConfig.baseDuration}, got ${deserializedConfig.baseDuration})`
      );
      
      this.assert(
        deserializedConfig.testValue === testConfig.testValue,
        'Serialization',
        `Custom config values should be preserved (expected ${testConfig.testValue}, got ${deserializedConfig.testValue})`
      );
    } catch (error) {
      this.fail('Serialization', `Unexpected error: ${error}`);
    }
  }

  /**
   * Assert a condition and record the result
   */
  private assert(condition: boolean, testName: string, message: string): void {
    this.testResults.push({
      name: testName,
      passed: condition,
      message: message
    });
    
    if (!condition) {
      console.error(`❌ FAILED: ${testName} - ${message}`);
    }
  }

  /**
   * Record a failed test
   */
  private fail(testName: string, message: string): void {
    this.testResults.push({
      name: testName,
      passed: false,
      message: message
    });
    
    console.error(`❌ FAILED: ${testName} - ${message}`);
  }

  /**
   * Report test results
   */
  private reportResults(): void {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    
    console.log('=== FixedTimingStrategy Test Results ===');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    
    const uniqueTests = [...new Set(this.testResults.map(r => r.name))];
    
    uniqueTests.forEach(testName => {
      const testsForName = this.testResults.filter(r => r.name === testName);
      const passedForName = testsForName.filter(r => r.passed).length;
      
      console.log(`\n${testName}: ${passedForName}/${testsForName.length} passed`);
      
      testsForName.filter(r => !r.passed).forEach(failed => {
        console.error(`  ❌ ${failed.message}`);
      });
    });
    
    console.log('\n=== End of Test Results ===');
  }
}

/**
 * Run the tests if this file is executed directly
 */
export function runFixedTimingStrategyTests(): void {
  const tester = new FixedTimingStrategyTest();
  tester.runAllTests();
}

// If running directly from Node.js
if (typeof window === 'undefined' && require.main === module) {
  runFixedTimingStrategyTests();
}
