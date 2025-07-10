/**
 * Test Runner
 * 
 * This file exports a test runner that can be used to run tests from the browser console.
 */

import { runFixedTimingStrategyTests } from './FixedTimingStrategyTest';
import AdaptiveTimingStrategyTest from './AdaptiveTimingStrategyTest';
import TrafficEnforcerStrategyTest from './TrafficEnforcerStrategyTest';
import TrafficLightControllerTest from './TrafficLightControllerTest';
import { KPICollectorTest } from './KPICollectorTest';

/**
 * Test runner for traffic control strategies
 */
export class TrafficControlTestRunner {
  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('=== Running Traffic Control Tests ===');
    this.runKPICollectorTests(); // Run KPI collector tests first
    this.runTrafficLightControllerTests();
    this.runFixedTimingTests();
    this.runAdaptiveTimingTests();
    this.runTrafficEnforcerTests();
    console.log('=== All Tests Completed ===');
  }
  
  /**
   * Run KPI collector tests
   */
  runKPICollectorTests(): void {
    console.log('\n=== KPI Collector Tests ===');
    const tester = new KPICollectorTest();
    this.runTestSuite(tester);
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
  
  /**
   * Run a test suite using reflection to find test methods
   */
  private runTestSuite(testCase: any): void {
    // Find all test methods (those starting with "test")
    const testMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(testCase))
      .filter(method => method.startsWith('test') && typeof testCase[method] === 'function');
    
    console.log(`Found ${testMethods.length} tests to run`);
    
    let passed = 0;
    let failed = 0;
    
    // Run each test method
    for (const method of testMethods) {
      try {
        console.log(`Running test: ${method}`);
        testCase.setUp();
        testCase[method]();
        testCase.tearDown();
        console.log(`✅ Test passed: ${method}`);
        passed++;
      } catch (error) {
        console.error(`❌ Test failed: ${method}`);
        console.error(error);
        failed++;
      }
    }
    
    // Report results
    console.log(`\nTest summary: ${passed} passed, ${failed} failed, ${testMethods.length} total`);
  }
}

// Export a singleton instance
export const testRunner = new TrafficControlTestRunner();
