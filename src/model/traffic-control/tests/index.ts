/**
 * Traffic Control Tests Integration
 * 
 * This file registers the test runner with the global window object
 * so it can be called from the browser console.
 */

import { testRunner } from './TestRunner';

// Register the test runner with the global window object
(window as any).trafficControlTests = testRunner;

// Log a message to the console indicating how to run tests
console.log(`
To run traffic control tests, open the browser console and type:
  trafficControlTests.runAllTests()
  
Or run specific test categories:
  trafficControlTests.runFixedTimingTests()
`);
