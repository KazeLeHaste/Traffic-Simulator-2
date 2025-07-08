/**
 * Test Runner
 * 
 * This file exports a test runner that can be used to run tests from the browser console.
 */

import { runFixedTimingStrategyTests } from './FixedTimingStrategyTest';
import AdaptiveTimingStrategyTest from './AdaptiveTimingStrategyTest';

/**
 * Test runner for traffic control strategies
 */
export class TrafficControlTestRunner {
  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('=== Running Traffic Control Tests ===');
    this.runFixedTimingTests();
    this.runAdaptiveTimingTests();
    console.log('=== All Tests Completed ===');
  }
  
  /**
   * Run fixed timing strategy tests
   */
  runFixedTimingTests(): void {
    console.log('\n=== Fixed Timing Strategy Tests ===');
    runFixedTimingStrategyTests();
  }
  
  /**
   * Run adaptive timing strategy tests
   */
  runAdaptiveTimingTests(): void {
    console.log('\n=== Adaptive Timing Strategy Tests ===');
    const tester = new AdaptiveTimingStrategyTest();
    tester.runTests();
  }
}

// Export a singleton instance
export const testRunner = new TrafficControlTestRunner();
