/**
 * Manual test script for traffic control strategies
 * Run this in the browser console to test the refactored traffic control system
 */

// Import the test runner
import { testRunner } from './model/traffic-control/tests/TestRunner';

// Run all tests
function runTests() {
  console.log("Starting traffic control tests...");
  testRunner.runAllTests();
}

// Export for browser access
(window as any).runTrafficTests = runTests;

// Log instructions
console.log("Run traffic control tests by calling runTrafficTests() in the browser console");
