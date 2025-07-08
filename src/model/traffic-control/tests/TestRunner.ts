/**
 * Test Runner
 * 
 * This file exports a test runner that can be used to run tests from the browser console.
 */

import { runFixedTimingStrategyTests } from './FixedTimingStrategyTest';
import AdaptiveTimingStrategyTest from './AdaptiveTimingStrategyTest';
import TrafficEnforcerStrategyTest from './TrafficEnforcerStrategyTest';
import TrafficLightControllerTest from './TrafficLightControllerTest';

/**
 * Test runner for traffic control strategies
 */
export class TrafficControlTestRunner {
  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('=== Running Traffic Control Tests ===');
    this.runTrafficLightControllerTests(); // Run controller tests first
    this.runFixedTimingTests();
    this.runAdaptiveTimingTests();
    this.runTrafficEnforcerTests();
    console.log('=== All Tests Completed ===');
  }
  
  /**
   * Run traffic light controller tests
   */
  runTrafficLightControllerTests(): void {
    console.log('\n=== Traffic Light Controller Tests ===');
    const tester = new TrafficLightControllerTest();
    tester.runTests();
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
  
  /**
   * Run traffic enforcer strategy tests
   */
  runTrafficEnforcerTests(): void {
    console.log('\n=== Traffic Enforcer Strategy Tests ===');
    const tester = new TrafficEnforcerStrategyTest();
    tester.runTests();
  }
}

// Export a singleton instance
export const testRunner = new TrafficControlTestRunner();
