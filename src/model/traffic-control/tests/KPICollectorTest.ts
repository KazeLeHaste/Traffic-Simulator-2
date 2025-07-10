import { TestCase } from '../../../tests/TestCase';
import { KPICollector, VehicleEvent, SimulationMetrics } from '../../kpi-collector';
import Car = require('../../car');
import Lane = require('../../lane');
import Intersection = require('../../intersection');

/**
 * Tests for the KPI Collector system
 */
export class KPICollectorTest extends TestCase {
  private kpiCollector: KPICollector;
  private mockCar: Car;
  private mockLane: any;
  private mockIntersection: any;
  private time: number = 0;

  setUp(): void {
    this.kpiCollector = new KPICollector();
    
    // Create mock objects
    this.mockCar = this.createMockCar();
    this.mockLane = this.createMockLane('lane-1');
    this.mockIntersection = this.createMockIntersection('intersection-1', [this.mockLane]);
    
    // Reset metrics
    this.kpiCollector.reset();
    
    // Start recording metrics
    this.time = 0;
    this.kpiCollector.startRecording(this.time);
  }
  
  tearDown(): void {
    this.kpiCollector.stopRecording();
  }

  /**
   * Test initialization of KPI Collector
   */
  testInitialization(): void {
    // First reset to ensure clean state
    this.kpiCollector.reset();
    
    const metrics = this.kpiCollector.getMetrics(this.time);
    this.assertEqual(metrics.totalVehicles, 0, 'Initial total vehicles should be 0');
    this.assertEqual(metrics.activeVehicles, 0, 'Initial active vehicles should be 0');
    this.assertEqual(metrics.completedTrips, 0, 'Initial completed trips should be 0');
    this.assertEqual(metrics.averageSpeed, 0, 'Initial average speed should be 0');
    this.assertEqual(metrics.globalThroughput, 0, 'Initial throughput should be 0');
    this.assertEqual(metrics.averageWaitTime, 0, 'Initial average wait time should be 0');
    this.assertEqual(metrics.maxWaitTime, 0, 'Initial max wait time should be 0');
    this.assertEqual(metrics.totalStops, 0, 'Initial total stops should be 0');
    this.assertEqual(metrics.stoppedVehicles, 0, 'Initial stopped vehicles should be 0');
    this.assertEqual(metrics.congestionIndex, 0, 'Initial congestion index should be 0');
  }

  /**
   * Test recording vehicle enter and exit
   */
  testRecordVehicleEnterExit(): void {
    // Set up mock car with speed
    this.mockCar.id = 'car-1';
    this.mockCar.speed = 10; // m/s
    
    // Record vehicle enter
    this.kpiCollector.recordVehicleEnter(this.mockCar, this.time);
    
    // Check metrics
    const metrics = this.kpiCollector.getMetrics(this.time);
    this.assertEqual(metrics.activeVehicles, 1, 'Active vehicles should be 1');
    
    // Record another car entering
    const mockCar2 = this.createMockCar();
    mockCar2.id = 'car-2';
    mockCar2.speed = 5; // m/s
    
    this.kpiCollector.recordVehicleEnter(mockCar2, this.time);
    
    // Check updated metrics
    const updatedMetrics = this.kpiCollector.getMetrics(this.time);
    this.assertEqual(updatedMetrics.activeVehicles, 2, 'Active vehicles should be 2');
    
    // Record first car exiting
    this.kpiCollector.recordVehicleExit(this.mockCar, this.time + 10);
    
    // Check metrics after exit
    const exitMetrics = this.kpiCollector.getMetrics(this.time + 10);
    this.assertEqual(exitMetrics.activeVehicles, 1, 'Active vehicles should be 1 after exit');
    this.assertEqual(exitMetrics.completedTrips, 1, 'Completed trips should be 1');
  }

  /**
   * Test recording vehicle stops and starts
   */
  testRecordVehicleStopStart(): void {
    // Set up mock car
    this.mockCar.id = 'car-1';
    this.mockCar.speed = 0;
    
    // Record vehicle enter
    this.kpiCollector.recordVehicleEnter(this.mockCar, this.time);
    
    // Record vehicle stop
    this.kpiCollector.recordVehicleStop(this.mockCar, this.time + 5);
    
    // Check metrics
    const metrics = this.kpiCollector.getMetrics(this.time + 5);
    this.assertEqual(metrics.stoppedVehicles, 1, 'Stopped vehicles should be 1');
    
    // Record vehicle start
    this.time += 10; // 10 seconds stopped
    this.mockCar.speed = 5; // Moving again
    this.kpiCollector.recordVehicleStart(this.mockCar, this.time);
    
    // Check updated metrics
    const updatedMetrics = this.kpiCollector.getMetrics(this.time);
    this.assertEqual(updatedMetrics.stoppedVehicles, 0, 'Stopped vehicles should be 0');
    
    // Wait times should be recorded
    this.assertTrue(updatedMetrics.averageWaitTime > 0, 'Should have recorded wait time');
  }

  /**
   * Test lane metrics tracking
   */
  testLaneMetricsTracking(): void {
    // Setup lane and car
    this.mockCar.id = 'car-1';
    this.mockCar.speed = 10;
    
    // Record vehicle entering a lane
    this.kpiCollector.recordLaneEnter(this.mockCar, this.mockLane, this.time);
    
    // Check metrics - lane metrics are accessible via getMetrics().laneMetrics
    const metrics = this.kpiCollector.getMetrics(this.time);
    const laneMetrics = metrics.laneMetrics[this.mockLane.id];
    
    this.assertNotNull(laneMetrics, 'Lane metrics should exist');
    this.assertEqual(laneMetrics.laneId, 'lane-1', 'Lane ID should match');
    this.assertTrue(laneMetrics.vehicleCount > 0, 'Vehicle count should be greater than 0');
    
    // Record another vehicle
    const mockCar2 = this.createMockCar();
    mockCar2.id = 'car-2';
    mockCar2.speed = 5;
    
    this.kpiCollector.recordLaneEnter(mockCar2, this.mockLane, this.time);
    
    // Record vehicles exiting the lane
    this.time += 10; // 10 seconds later
    this.kpiCollector.recordLaneExit(this.mockCar, this.mockLane, this.time);
    this.kpiCollector.recordLaneExit(mockCar2, this.mockLane, this.time);
    
    // Get final metrics
    const updatedMetrics = this.kpiCollector.getMetrics(this.time);
    this.assertTrue(updatedMetrics.laneMetrics[this.mockLane.id].totalVehiclesPassed > 0, 
      'Total vehicles passed should be greater than 0');
  }

  /**
   * Test intersection metrics tracking
   */
  testIntersectionMetricsTracking(): void {
    // Setup intersection and car
    this.mockCar.id = 'car-1';
    
    // Record vehicle entering intersection
    this.kpiCollector.recordIntersectionEnter(this.mockCar, this.mockIntersection, this.time);
    
    // Check metrics
    const metrics = this.kpiCollector.getMetrics(this.time);
    this.assertTrue(metrics.intersectionMetrics.hasOwnProperty(this.mockIntersection.id),
      'Intersection metrics should exist');
    
    // Record vehicle exiting intersection
    this.time += 5; // 5 seconds later
    this.kpiCollector.recordIntersectionExit(this.mockCar, this.mockIntersection, this.time);
    
    // Check updated metrics
    const updatedMetrics = this.kpiCollector.getMetrics(this.time);
    const intersectionMetrics = updatedMetrics.intersectionMetrics[this.mockIntersection.id];
    
    this.assertNotNull(intersectionMetrics, 'Intersection metrics should exist');
    this.assertEqual(intersectionMetrics.intersectionId, this.mockIntersection.id, 'Intersection ID should match');
    this.assertTrue(intersectionMetrics.totalVehiclesPassed > 0, 'Vehicles passed should be greater than 0');
    this.assertTrue(intersectionMetrics.averageWaitTime > 0, 'Average wait time should be greater than 0');
  }

  /**
   * Test congestion index calculation
   */
  testCongestionIndexCalculation(): void {
    // Add multiple vehicles and make some stopped
    for (let i = 0; i < 10; i++) {
      const car = this.createMockCar();
      car.id = `car-${i}`;
      car.speed = i < 5 ? 0 : 10; // Half are stopped
      
      // Enter simulation
      this.kpiCollector.recordVehicleEnter(car, this.time);
      
      // Stop half the cars
      if (i < 5) {
        this.kpiCollector.recordVehicleStop(car, this.time);
      }
    }
    
    // Check metrics
    const metrics = this.kpiCollector.getMetrics(this.time);
    this.assertEqual(metrics.activeVehicles, 10, 'Active vehicles should be 10');
    this.assertEqual(metrics.stoppedVehicles, 5, 'Stopped vehicles should be 5');
    this.assertTrue(metrics.congestionIndex > 0, 'Congestion index should be greater than 0');
  }

  /**
   * Test overall metrics calculations
   */
  testOverallMetricsCalculation(): void {
    // Simulate a scenario with multiple vehicles and events
    
    // Time 0: Start with 3 vehicles
    for (let i = 0; i < 3; i++) {
      const car = this.createMockCar();
      car.id = `car-${i}`;
      car.speed = 10;
      this.kpiCollector.recordVehicleEnter(car, this.time);
    }
    
    // Time 10: One vehicle stops
    this.time = 10;
    const stoppedCar = this.createMockCar();
    stoppedCar.id = 'stopped-car';
    stoppedCar.speed = 0;
    this.kpiCollector.recordVehicleEnter(stoppedCar, this.time);
    this.kpiCollector.recordVehicleStop(stoppedCar, this.time);
    
    // Time 20: One vehicle enters and exits an intersection
    this.time = 20;
    const intersectionCar = this.createMockCar();
    intersectionCar.id = 'intersection-car';
    intersectionCar.speed = 8;
    this.kpiCollector.recordVehicleEnter(intersectionCar, this.time);
    this.kpiCollector.recordIntersectionEnter(intersectionCar, this.mockIntersection, this.time);
    this.time = 25;
    this.kpiCollector.recordIntersectionExit(intersectionCar, this.mockIntersection, this.time);
    
    // Time 30: Stopped vehicle starts moving again
    this.time = 30;
    stoppedCar.speed = 5;
    this.kpiCollector.recordVehicleStart(stoppedCar, this.time);
    
    // Time 40: One vehicle exits the simulation
    this.time = 40;
    this.kpiCollector.recordVehicleExit(intersectionCar, this.time);
    
    // Check final metrics
    const metrics = this.kpiCollector.getMetrics(this.time);
    
    // Verify core metrics
    this.assertTrue(metrics.totalVehicles >= 5, 'Total vehicles should be at least 5');
    this.assertTrue(metrics.completedTrips >= 1, 'Should have at least 1 completed trip');
    this.assertTrue(metrics.averageSpeed > 0, 'Average speed should be greater than 0');
    this.assertTrue(metrics.averageWaitTime > 0, 'Average wait time should be greater than 0');
    this.assertTrue(metrics.simulationTime === 40, 'Simulation time should be 40');
  }

  /**
   * Test CSV export
   */
  testExportCSV(): void {
    // Setup some data
    this.mockCar.id = 'car-1';
    this.mockCar.speed = 10;
    
    // Record events
    this.kpiCollector.recordVehicleEnter(this.mockCar, this.time);
    
    // Record vehicle entering a lane
    this.kpiCollector.recordLaneEnter(this.mockCar, this.mockLane, this.time);
    
    // Record vehicle entering intersection
    this.kpiCollector.recordIntersectionEnter(this.mockCar, this.mockIntersection, this.time);
    this.time += 5;
    this.kpiCollector.recordIntersectionExit(this.mockCar, this.mockIntersection, this.time);
    
    // Export to CSV
    const csv = this.kpiCollector.exportMetricsCSV();
    
    // Check CSV content
    this.assertTrue(csv.includes('Global Metrics'), 'CSV should have global metrics');
    this.assertTrue(csv.includes('Lane Metrics'), 'CSV should have lane section');
    this.assertTrue(csv.includes('Intersection Metrics'), 'CSV should have intersection section');
  }

  /**
   * Test JSON export
   */
  testExportJSON(): void {
    // Setup some data
    this.mockCar.id = 'car-1';
    this.mockCar.speed = 10;
    
    // Record events
    this.kpiCollector.recordVehicleEnter(this.mockCar, this.time);
    
    // Record vehicle entering a lane
    this.kpiCollector.recordLaneEnter(this.mockCar, this.mockLane, this.time);
    
    // Record vehicle entering intersection
    this.kpiCollector.recordIntersectionEnter(this.mockCar, this.mockIntersection, this.time);
    this.time += 5;
    this.kpiCollector.recordIntersectionExit(this.mockCar, this.mockIntersection, this.time);
    
    // Export to JSON
    const jsonString = this.kpiCollector.exportMetricsJSON();
    
    // Parse JSON
    const json = JSON.parse(jsonString);
    
    // Check JSON content
    this.assertTrue(json.hasOwnProperty('simulationTime'), 'JSON should have simulation time');
    this.assertTrue(json.hasOwnProperty('totalVehicles'), 'JSON should have total vehicles');
    this.assertTrue(json.hasOwnProperty('intersectionMetrics'), 'JSON should have intersection metrics');
    this.assertTrue(json.hasOwnProperty('laneMetrics'), 'JSON should have lane metrics');
  }

  /**
   * Test export validation
   */
  testExportValidation(): void {
    // Setup some data
    this.mockCar.id = 'car-1';
    this.mockCar.speed = 10;
    
    this.kpiCollector.recordVehicleEnter(this.mockCar, this.time);
    
    // Validate exports
    const validationResult = this.kpiCollector.validateExportData();
    
    // Check validation result
    this.assertTrue(validationResult.isValid, 'Validation should pass');
    this.assertTrue(validationResult.discrepancies.length >= 0, 'Should have discrepancies list');
    this.assertTrue(validationResult.summary.length > 0, 'Should have summary text');
  }
  
  /**
   * Helper to create a mock car
   */
  private createMockCar(): Car {
    // @ts-ignore - Create a simplified mock car for testing
    return {
      id: '',
      speed: 0
    };
  }
  
  /**
   * Helper to create a mock lane
   */
  private createMockLane(id: string): any {
    return {
      id: id,
      length: 100,
      width: 3,
      cars: []
    };
  }
  
  /**
   * Helper to create a mock intersection
   */
  private createMockIntersection(id: string, lanes: any[]): any {
    return {
      id: id,
      incomingLanes: lanes,
      outgoingLanes: []
    };
  }
}
