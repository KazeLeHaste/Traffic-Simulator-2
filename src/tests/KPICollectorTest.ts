/**
 * Unit tests for KPICollector functionality
 * These tests validate the accuracy of KPI calculations using controlled scenarios
 */

import { kpiCollector, VehicleEvent } from '../model/kpi-collector';
import Car = require('../model/car');

export class KPICollectorTest {
  
  /**
   * Test basic vehicle tracking
   */
  static testVehicleTracking(): boolean {
    console.log('🧪 Testing Vehicle Tracking...');
    
    // Reset collector
    kpiCollector.reset();
    kpiCollector.startRecording(0);
    
    // Create mock vehicles
    const mockLane = { id: 'test-lane-1', length: 100, road: { id: 'test-road-1' } };
    const mockIntersection = { id: 'test-intersection-1' };
    
    // Simulate vehicle lifecycle
    const vehicle1 = { id: 'vehicle-1', speed: 0 } as Car;
    const vehicle2 = { id: 'vehicle-2', speed: 0 } as Car;
    
    // Vehicle enters simulation
    kpiCollector.recordVehicleEnter(vehicle1, 0);
    kpiCollector.recordVehicleEnter(vehicle2, 1);
    
    // Vehicle starts moving
    vehicle1.speed = 10;
    kpiCollector.recordVehicleStart(vehicle1, 2);
    
    // Vehicle stops
    vehicle1.speed = 0;
    kpiCollector.recordVehicleStop(vehicle1, 5);
    
    // Vehicle starts again
    vehicle1.speed = 15;
    kpiCollector.recordVehicleStart(vehicle1, 8);
    
    // Vehicle exits
    kpiCollector.recordVehicleExit(vehicle1, 10);
    kpiCollector.recordVehicleExit(vehicle2, 12);
    
    // Get metrics
    const metrics = kpiCollector.getMetrics(15);
    
    // Validate results
    const tests = [
      { name: 'Total Vehicles', expected: 2, actual: metrics.totalVehicles },
      { name: 'Completed Trips', expected: 2, actual: metrics.completedTrips },
      { name: 'Active Vehicles', expected: 0, actual: metrics.activeVehicles },
      { name: 'Average Stop Frequency', expected: 1, actual: metrics.averageStopFrequency }
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const passed = test.expected === test.actual;
      console.log(`  ${test.name}: ${passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    return allPassed;
  }
  
  /**
   * Test emissions calculations
   */
  static testEmissionsCalculation(): boolean {
    console.log('🧪 Testing Emissions Calculation...');
    
    kpiCollector.reset();
    kpiCollector.startRecording(0);
    
    const vehicle = { id: 'emissions-test-vehicle', speed: 0 } as Car;
    
    // Enter simulation
    kpiCollector.recordVehicleEnter(vehicle, 0);
    
    // Simulate different driving behaviors
    // Idling (high emissions)
    kpiCollector.updateVehicleEmissions(vehicle, 1, 0, 1); // 1 second of idling
    
    // Accelerating (medium-high emissions)
    vehicle.speed = 10;
    kpiCollector.updateVehicleEmissions(vehicle, 2, 2, 1); // 1 second of acceleration
    
    // Cruising (lower emissions)
    vehicle.speed = 15;
    kpiCollector.updateVehicleEmissions(vehicle, 3, 0, 1); // 1 second of cruising
    
    // Decelerating (lowest emissions)
    vehicle.speed = 5;
    kpiCollector.updateVehicleEmissions(vehicle, 4, -2, 1); // 1 second of deceleration
    
    kpiCollector.recordVehicleExit(vehicle, 5);
    
    const metrics = kpiCollector.getMetrics(6);
    
    // Validate emissions were calculated
    const tests = [
      { name: 'CO2 Emissions > 0', expected: true, actual: metrics.totalEmissions.co2Emissions > 0 },
      { name: 'Fuel Consumption > 0', expected: true, actual: metrics.totalEmissions.fuelConsumption > 0 },
      { name: 'NOx Emissions > 0', expected: true, actual: metrics.totalEmissions.noxEmissions > 0 },
      { name: 'PM Emissions > 0', expected: true, actual: metrics.totalEmissions.pmEmissions > 0 },
      { name: 'Average Emissions Calculated', expected: true, actual: metrics.averageEmissionsPerVehicle.co2Emissions > 0 }
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const passed = test.expected === test.actual;
      console.log(`  ${test.name}: ${passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    // Log actual emission values for inspection
    console.log(`  📊 Total CO2: ${metrics.totalEmissions.co2Emissions.toFixed(4)} kg`);
    console.log(`  📊 Total Fuel: ${metrics.totalEmissions.fuelConsumption.toFixed(4)} L`);
    
    return allPassed;
  }
  
  /**
   * Test queue length tracking
   */
  static testQueueTracking(): boolean {
    console.log('🧪 Testing Queue Tracking...');
    
    kpiCollector.reset();
    kpiCollector.startRecording(0);
    
    // Simulate queue formation and dissipation
    kpiCollector.recordQueueLength('intersection-1', 0, true);
    kpiCollector.recordQueueLength('intersection-1', 1, true);
    kpiCollector.recordQueueLength('intersection-1', 3, true);
    kpiCollector.recordQueueLength('intersection-1', 2, true);
    kpiCollector.recordQueueLength('intersection-1', 0, true);
    
    kpiCollector.recordQueueLength('lane-1', 2, false);
    kpiCollector.recordQueueLength('lane-1', 4, false);
    kpiCollector.recordQueueLength('lane-1', 1, false);
    
    const metrics = kpiCollector.getMetrics(10);
    
    const tests = [
      { name: 'Global Max Queue Length', expected: 4, actual: metrics.queueMetrics.globalMaxQueueLength },
      { name: 'Queue Metrics Calculated', expected: true, actual: metrics.queueMetrics.globalAverageQueueLength > 0 }
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const passed = test.expected === test.actual;
      console.log(`  ${test.name}: ${passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    console.log(`  📊 Global Average Queue: ${metrics.queueMetrics.globalAverageQueueLength.toFixed(2)}`);
    
    return allPassed;
  }
  
  /**
   * Test Level of Service calculation
   */
  static testLevelOfService(): boolean {
    console.log('🧪 Testing Level of Service Calculation...');
    
    kpiCollector.reset();
    kpiCollector.startRecording(0);
    
    const mockLane = { id: 'los-test-lane', length: 500 };
    const vehicle = { id: 'los-vehicle', speed: 20 } as Car;
    
    // Simulate lane usage with different delay scenarios
    kpiCollector.recordLaneEnter(vehicle, mockLane, 0);
    kpiCollector.updateLaneSpeedMetrics(vehicle, mockLane.id, 20);
    
    // Simulate some delay
    kpiCollector.recordVehicleStop(vehicle, 5);
    kpiCollector.recordVehicleStart(vehicle, 15); // 10 seconds delay
    
    kpiCollector.recordLaneExit(vehicle, mockLane, 20);
    
    const metrics = kpiCollector.getMetrics(25);
    
    // Check if LOS was calculated
    const losKeys = Object.keys(metrics.levelOfService);
    const hasLaneMetrics = losKeys.some(key => key.includes('lane'));
    
    const tests = [
      { name: 'LOS Metrics Generated', expected: true, actual: losKeys.length > 0 },
      { name: 'Lane LOS Calculated', expected: true, actual: hasLaneMetrics }
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const passed = test.expected === test.actual;
      console.log(`  ${test.name}: ${passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    // Log LOS details
    if (losKeys.length > 0) {
      const firstLOS = metrics.levelOfService[losKeys[0]];
      console.log(`  📊 First LOS Grade: ${firstLOS.los} (Delay: ${firstLOS.averageDelay.toFixed(2)}s)`);
    }
    
    return allPassed;
  }
  
  /**
   * Test density sampling
   */
  static testDensitySampling(): boolean {
    console.log('🧪 Testing Density Sampling...');
    
    kpiCollector.reset();
    kpiCollector.startRecording(0);
    
    // Sample different densities on a road
    kpiCollector.sampleVehicleDensity('road-1', 5, 1000); // 5 vehicles per km
    kpiCollector.sampleVehicleDensity('road-1', 10, 1000); // 10 vehicles per km
    kpiCollector.sampleVehicleDensity('road-1', 30, 1000); // 30 vehicles per km (high)
    kpiCollector.sampleVehicleDensity('road-1', 15, 1000); // 15 vehicles per km
    
    const metrics = kpiCollector.getMetrics(5);
    
    const road1Density = metrics.vehicleDensity['road-1'];
    
    const tests = [
      { name: 'Density Metrics Calculated', expected: true, actual: road1Density !== undefined },
      { name: 'Max Density Correct', expected: 30, actual: road1Density?.maxDensity || 0 },
      { name: 'Average Density > 0', expected: true, actual: (road1Density?.averageDensity || 0) > 0 }
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const passed = test.expected === test.actual;
      console.log(`  ${test.name}: ${passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    if (road1Density) {
      console.log(`  📊 Average Density: ${road1Density.averageDensity.toFixed(2)} veh/km`);
      console.log(`  📊 Time Above Threshold: ${(road1Density.timeAboveThreshold * 100).toFixed(1)}%`);
    }
    
    return allPassed;
  }
  
  /**
   * Test travel time calculation
   */
  static testTravelTimeCalculation(): boolean {
    console.log('🧪 Testing Travel Time Calculation...');
    
    kpiCollector.reset();
    kpiCollector.startRecording(0);
    
    const vehicle1 = { id: 'travel-vehicle-1', speed: 15 } as Car;
    const vehicle2 = { id: 'travel-vehicle-2', speed: 20 } as Car;
    
    // Vehicle 1: 10-second journey
    kpiCollector.recordVehicleEnter(vehicle1, 0);
    kpiCollector.recordVehicleExit(vehicle1, 10);
    
    // Vehicle 2: 15-second journey
    kpiCollector.recordVehicleEnter(vehicle2, 5);
    kpiCollector.recordVehicleExit(vehicle2, 20);
    
    const metrics = kpiCollector.getMetrics(25);
    
    const expectedAvgTravelTime = (10 + 15) / 2; // 12.5 seconds
    const actualAvgTravelTime = metrics.averageTravelTime;
    
    const tests = [
      { name: 'Average Travel Time', expected: expectedAvgTravelTime, actual: actualAvgTravelTime },
      { name: 'Travel Time > 0', expected: true, actual: actualAvgTravelTime > 0 }
    ];
    
    let allPassed = true;
    tests.forEach(test => {
      const passed = typeof test.expected === 'boolean' ? 
        test.expected === test.actual : 
        Math.abs(test.expected - test.actual) < 0.1;
      console.log(`  ${test.name}: ${passed ? '✅' : '❌'} (Expected: ${test.expected}, Actual: ${test.actual})`);
      if (!passed) allPassed = false;
    });
    
    return allPassed;
  }
  
  /**
   * Run all KPI tests
   */
  static runAllTests(): boolean {
    console.log('🧪 Running KPI Collector Tests...\n');
    
    const tests = [
      this.testVehicleTracking,
      this.testEmissionsCalculation,
      this.testQueueTracking,
      this.testLevelOfService,
      this.testDensitySampling,
      this.testTravelTimeCalculation
    ];
    
    let allTestsPassed = true;
    let passedCount = 0;
    
    tests.forEach((test, index) => {
      try {
        const result = test();
        if (result) {
          passedCount++;
        } else {
          allTestsPassed = false;
        }
        console.log(''); // Add spacing between tests
      } catch (error) {
        console.error(`❌ Test ${index + 1} failed with error:`, error);
        allTestsPassed = false;
      }
    });
    
    console.log(`\n📋 Test Summary: ${passedCount}/${tests.length} tests passed`);
    console.log(allTestsPassed ? '✅ All tests passed!' : '❌ Some tests failed!');
    
    return allTestsPassed;
  }
}

// Export for use in browser console or test runner
(window as any).KPICollectorTest = KPICollectorTest;
