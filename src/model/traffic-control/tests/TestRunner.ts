/**
 * Test Runner
 * 
 * This file exports a test runner that can be used to run tests from the browser console.
 */

import { runFixedTimingStrategyTests } from './FixedTimingStrategyTest';

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
    console.log('=== All Tests Completed ===');
  }
  
  /**
   * Run fixed timing strategy tests
   */
  runFixedTimingTests(): void {
    runFixedTimingStrategyTests();
  }
}

// Export a singleton instance
export const testRunner = new TrafficControlTestRunner();
