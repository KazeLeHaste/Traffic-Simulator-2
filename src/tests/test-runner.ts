/**
 * Road Traffic Simulator - Test Runner
 * 
 * This file coordinates the execution of all test cases for the Road Traffic Simulator.
 * It focuses on unit and integration tests for:
 * - KPI tracking and calculations
 * - Traffic control strategies
 * - Scenario management
 * - Data validation
 */

import { KPICollectorTest } from './KPICollectorTest';
import { KPICollectorTest as TrafficControlKPITest } from '../model/traffic-control/tests/KPICollectorTest';
// Import the other tests when they are available
// import { FixedTimingStrategyTest } from '../model/traffic-control/tests/FixedTimingStrategyTest';
// import { AdaptiveTimingStrategyTest } from '../model/traffic-control/tests/AdaptiveTimingStrategyTest';
// import { TrafficEnforcerStrategyTest } from '../model/traffic-control/tests/TrafficEnforcerStrategyTest';
// import { TrafficControlStrategyManagerTest } from '../model/traffic-control/tests/TrafficControlStrategyManagerTest';
// import { StorageTest } from '../lib/storage/tests/StorageTest';

/**
 * Test Suite class for managing test execution
 */
class TestSuite {
  private tests: any[] = [];
  private passCount = 0;
  private failCount = 0;
  private skipCount = 0;
  private results: any[] = [];
  
  /**
   * Add a test to the suite
   */
  addTest(testClass: any): void {
    this.tests.push(testClass);
  }
  
  /**
   * Run all tests in the suite
   */
  async runAll(): Promise<void> {
    console.log('🧪 Starting Road Traffic Simulator Test Suite');
    console.log('-------------------------------------------');
    
    for (const TestClass of this.tests) {
      const testInstance = new TestClass();
      const testName = TestClass.name;
      
      console.log(`\n▶️ Running ${testName}`);
      
      // Get all test methods
      const testMethods = Object.getOwnPropertyNames(TestClass.prototype)
        .filter(prop => typeof testInstance[prop] === 'function' && prop.startsWith('test'));
      
      let testPassCount = 0;
      let testFailCount = 0;
      
      // Run setup if available
      if (typeof testInstance.setUp === 'function') {
        try {
          await testInstance.setUp();
        } catch (error) {
          console.error(`❌ Setup failed for ${testName}:`, error);
          this.failCount++;
          continue;
        }
      }
      
      // Run each test method
      for (const method of testMethods) {
        try {
          // Reset test instance for each method
          if (typeof testInstance.setUp === 'function') {
            await testInstance.setUp();
          }
          
          // Run the test
          console.log(`  Running ${method}...`);
          await testInstance[method]();
          
          console.log(`  ✅ ${method} passed`);
          testPassCount++;
          this.passCount++;
          
          this.results.push({
            test: `${testName}.${method}`,
            status: 'pass'
          });
        } catch (error) {
          console.error(`  ❌ ${method} failed:`, error);
          testFailCount++;
          this.failCount++;
          
          this.results.push({
            test: `${testName}.${method}`,
            status: 'fail',
            error: error.message
          });
        }
      }
      
      // Run teardown if available
      if (typeof testInstance.tearDown === 'function') {
        try {
          await testInstance.tearDown();
        } catch (error) {
          console.error(`❌ Teardown failed for ${testName}:`, error);
        }
      }
      
      console.log(`\n📊 ${testName} Summary: ${testPassCount} passed, ${testFailCount} failed`);
    }
    
    // Print overall summary
    console.log('\n-------------------------------------------');
    console.log(`🏁 Test Suite Complete: ${this.passCount} passed, ${this.failCount} failed, ${this.skipCount} skipped`);
    
    if (this.failCount > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(result => result.status === 'fail')
        .forEach(result => {
          console.log(`  - ${result.test}: ${result.error}`);
        });
    }
  }
}

// Create test suite and add to global scope for browser console access
const runAllKPITests = (): boolean => {
  console.log('🧪 Running All KPI Tests from Test Runner...\n');
  
  try {
    const result = KPICollectorTest.runAllTests();
    console.log(`\n📋 KPI Test Suite Result: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    return result;
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  }
};

// Make available globally for console access
(window as any).runAllKPITests = runAllKPITests;
(window as any).KPICollectorTest = KPICollectorTest;

// Also create a simple test function for integration testing
const runSimpleKPITest = (): void => {
  console.log('🧪 Running Simple KPI Integration Test...');
  
  // This test verifies that the KPI system integrates properly with the simulation
  try {
    // Test basic KPI recording
    const testResult = KPICollectorTest.testVehicleTracking();
    console.log(`Simple Integration Test: ${testResult ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (testResult) {
      console.log('✅ KPI system is ready for use in the simulation!');
    } else {
      console.log('❌ KPI system has issues that need to be resolved.');
    }
  } catch (error) {
    console.error('❌ Simple test failed:', error);
  }
};

(window as any).runSimpleKPITest = runSimpleKPITest;

console.log('📋 Test functions loaded. Available commands:');
console.log('  - runAllKPITests() - Run complete KPI test suite');
console.log('  - runSimpleKPITest() - Run basic integration test');
console.log('  - KPICollectorTest.runAllTests() - Direct access to KPI tests');
