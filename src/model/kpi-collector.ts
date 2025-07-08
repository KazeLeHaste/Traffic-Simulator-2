/**
 * KPICollector - Collects and aggregates Key Performance Indicators for the traffic simulation
 * 
 * This class is responsible for:
 * - Recording events from vehicles, lanes, and intersections
 * - Calculating metrics based on these events
 * - Providing an API for the UI to display these metrics
 */

import { appState } from '../core/AppState';
import { Car as CarInterface, NextCarDistance } from '../interfaces';
import Car = require('./car');
import Road = require('./road');
import Intersection = require('./intersection');
import _ = require('underscore');

// Define interfaces for metric tracking
export interface VehicleMetric {
  vehicleId: string;
  timestamp: number;
  speed: number;
  position?: { x: number; y: number };
  event: VehicleEvent;
  duration?: number; // For stopped events
  oldSpeed?: number; // For speed change events
  intersectionId?: string; // For intersection entry/exit events
}

export enum VehicleEvent {
  ENTER_SIMULATION = 'enter_simulation',
  EXIT_SIMULATION = 'exit_simulation',
  ENTER_INTERSECTION = 'enter_intersection',
  EXIT_INTERSECTION = 'exit_intersection',
  START_MOVING = 'start_moving',
  STOP_MOVING = 'stop_moving',
  CHANGE_LANE = 'change_lane',
  SPEED_CHANGE = 'speed_change'
}

export interface IntersectionMetric {
  intersectionId: string;
  timestamp: number;
  queueLength: number;
  waitTime?: number;
  signalPhase?: number;
}

export interface SimulationMetrics {
  totalVehicles: number;
  activeVehicles: number;
  completedTrips: number;
  averageSpeed: number;
  averageWaitTime: number;
  maxWaitTime: number;
  totalStops: number;
  stoppedVehicles: number;
  intersectionUtilization: { [intersectionId: string]: number };
  roadUtilization: { [roadId: string]: number };
  simulationTime: number;
}

export class KPICollector {
  // Store metrics
  private vehicleMetrics: VehicleMetric[] = [];
  private intersectionMetrics: IntersectionMetric[] = [];
  private activeVehicles: Set<string> = new Set();
  private stoppedVehicles: Set<string> = new Set();
  private stoppedTimestamps: { [vehicleId: string]: number } = {};
  private completedTrips: number = 0;
  private simulationStartTime: number = 0;

  // Summary metrics (calculated on demand)
  private totalSpeed: number = 0;
  private speedMeasurements: number = 0;
  private waitTimes: number[] = [];
  
  // Settings
  private readonly sampleInterval: number = 0.5; // How often to sample speed (in simulation seconds)
  private lastSampleTime: number = 0;
  private isRecording: boolean = false;
  private cleanupTimeout: number | null = null;

  constructor() {
    this.reset();
  }

  /**
   * Start collecting metrics
   */
  public startRecording(initialTime: number = 0): void {
    this.isRecording = true;
    this.simulationStartTime = initialTime;
    this.lastSampleTime = initialTime;
    console.log('🔄 KPI Collector: Started recording metrics');
  }

  /**
   * Stop collecting metrics
   */
  public stopRecording(): void {
    this.isRecording = false;
    console.log('🛑 KPI Collector: Stopped recording metrics');
  }

  /**
   * Reset all collected metrics
   */
  public reset(): void {
    this.vehicleMetrics = [];
    this.intersectionMetrics = [];
    this.activeVehicles = new Set();
    this.stoppedVehicles = new Set();
    this.stoppedTimestamps = {};
    this.completedTrips = 0;
    this.simulationStartTime = 0;
    this.totalSpeed = 0;
    this.speedMeasurements = 0;
    this.waitTimes = [];
    this.isRecording = false;
    
    if (this.cleanupTimeout !== null) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }

    console.log('🗑️ KPI Collector: Metrics reset');
  }

  /**
   * Record vehicle entering the simulation
   */
  public recordVehicleEnter(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    this.activeVehicles.add(vehicle.id);
    
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.ENTER_SIMULATION
    });
  }

  /**
   * Record vehicle exiting the simulation
   */
  public recordVehicleExit(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    this.activeVehicles.delete(vehicle.id);
    this.completedTrips++;
    
    // If vehicle was stopped, clear that state
    if (this.stoppedVehicles.has(vehicle.id)) {
      this.stoppedVehicles.delete(vehicle.id);
      delete this.stoppedTimestamps[vehicle.id];
    }
    
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.EXIT_SIMULATION
    });
  }

  /**
   * Record vehicle stopping (speed ~= 0)
   */
  public recordVehicleStop(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    // Only record if vehicle wasn't already stopped
    if (!this.stoppedVehicles.has(vehicle.id)) {
      this.stoppedVehicles.add(vehicle.id);
      this.stoppedTimestamps[vehicle.id] = time;
      
      this.vehicleMetrics.push({
        vehicleId: vehicle.id,
        timestamp: time,
        speed: vehicle.speed,
        position: vehicle.coords,
        event: VehicleEvent.STOP_MOVING
      });
    }
  }

  /**
   * Record vehicle starting to move again
   */
  public recordVehicleStart(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    // Only record if vehicle was stopped
    if (this.stoppedVehicles.has(vehicle.id)) {
      const stoppedTime = time - this.stoppedTimestamps[vehicle.id];
      this.stoppedVehicles.delete(vehicle.id);
      delete this.stoppedTimestamps[vehicle.id];
      
      // Record wait time for analytics
      this.waitTimes.push(stoppedTime);
      
      this.vehicleMetrics.push({
        vehicleId: vehicle.id,
        timestamp: time,
        speed: vehicle.speed,
        duration: stoppedTime,
        event: VehicleEvent.START_MOVING
      });
    }
  }

  /**
   * Record vehicle changing lanes
   */
  public recordLaneChange(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.CHANGE_LANE
    });
  }

  /**
   * Record vehicle entering an intersection
   */
  public recordIntersectionEnter(vehicle: Car, intersection: Intersection, time: number): void {
    if (!this.isRecording) return;
    
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.ENTER_INTERSECTION
    });
    
    // Update intersection metrics
    const queueLength = this.getVehiclesAtIntersection(intersection.id).length;
    this.intersectionMetrics.push({
      intersectionId: intersection.id,
      timestamp: time,
      queueLength: queueLength
    });
  }

  /**
   * Record vehicle exiting an intersection
   */
  public recordIntersectionExit(vehicle: Car, intersection: Intersection, time: number): void {
    if (!this.isRecording) return;
    
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.EXIT_INTERSECTION
    });
    
    // Update intersection metrics
    const queueLength = this.getVehiclesAtIntersection(intersection.id).length;
    this.intersectionMetrics.push({
      intersectionId: intersection.id,
      timestamp: time,
      queueLength: queueLength
    });
  }

  /**
   * Sample the current speeds of all vehicles
   * Called periodically to track overall speed metrics
   */
  public sampleSpeeds(vehicles: { [id: string]: Car }, time: number): void {
    if (!this.isRecording) return;
    
    // Only sample at specific intervals to avoid too much data
    if (time - this.lastSampleTime < this.sampleInterval) {
      return;
    }
    
    this.lastSampleTime = time;
    
    // Calculate average speed from all vehicles
    let totalSpeed = 0;
    let count = 0;
    
    for (const id in vehicles) {
      const vehicle = vehicles[id];
      totalSpeed += vehicle.speed;
      count++;
      
      // Record significant speed changes individually
      // We could implement this based on threshold if needed
    }
    
    if (count > 0) {
      this.totalSpeed += totalSpeed;
      this.speedMeasurements += count;
    }
  }

  /**
   * Get currently active vehicles at a specific intersection
   */
  private getVehiclesAtIntersection(intersectionId: string): VehicleMetric[] {
    // This is a simple implementation - in a real system we'd track this more efficiently
    return this.vehicleMetrics.filter(m => 
      m.event === VehicleEvent.ENTER_INTERSECTION && 
      // Check if there's no corresponding exit event yet
      !this.vehicleMetrics.some(exit => 
        exit.vehicleId === m.vehicleId && 
        exit.event === VehicleEvent.EXIT_INTERSECTION && 
        exit.timestamp > m.timestamp
      )
    );
  }

  /**
   * Get the aggregated metrics for display or export
   */
  public getMetrics(currentTime: number = 0): SimulationMetrics {
    // Calculate average speed - give more importance to recent measurements
    const avgSpeed = this.speedMeasurements > 0 
      ? this.totalSpeed / this.speedMeasurements
      : 0;
      
    // Calculate wait times
    const avgWaitTime = this.waitTimes.length > 0
      ? this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
      : 0;
    const maxWaitTime = this.waitTimes.length > 0
      ? Math.max(...this.waitTimes)
      : 0;
    
    // Count total stops (unique stop events)
    const totalStops = this.vehicleMetrics.filter(m => 
      m.event === VehicleEvent.STOP_MOVING
    ).length;
    
    // Calculate intersection utilization
    // Group metrics by intersection ID manually
    const intersectionMetricsByID: { [id: string]: IntersectionMetric[] } = {};
    
    // Group metrics by intersection ID
    this.intersectionMetrics.forEach(metric => {
      const id = metric.intersectionId;
      if (!intersectionMetricsByID[id]) {
        intersectionMetricsByID[id] = [];
      }
      intersectionMetricsByID[id].push(metric);
    });
    
    const intersectionUtilization: {[id: string]: number} = {};
    
    // Calculate average queue length for each intersection
    Object.entries(intersectionMetricsByID).forEach(([id, metrics]) => {
      let totalQueueLength = 0;
      metrics.forEach(metric => {
        totalQueueLength += metric.queueLength;
      });
      
      const avgQueueLength = metrics.length > 0 ? totalQueueLength / metrics.length : 0;
      intersectionUtilization[id] = avgQueueLength;
    });
    
    // Calculate road utilization based on vehicle positions
    // This is an approximation based on event frequency on roads
    const roadUtilization: {[id: string]: number} = {};
    
    // Get true total vehicle count (all unique vehicles that entered)
    const totalVehicleIDs = new Set(
      this.vehicleMetrics
        .filter(m => m.event === VehicleEvent.ENTER_SIMULATION)
        .map(m => m.vehicleId)
    );
    
    return {
      totalVehicles: totalVehicleIDs.size,
      activeVehicles: this.activeVehicles.size,
      completedTrips: this.completedTrips,
      averageSpeed: avgSpeed,
      averageWaitTime: avgWaitTime,
      maxWaitTime: maxWaitTime,
      totalStops: totalStops,
      stoppedVehicles: this.stoppedVehicles.size,
      intersectionUtilization,
      roadUtilization,
      simulationTime: currentTime - this.simulationStartTime
    };
  }

  /**
   * Export metrics as CSV format
   */
  public exportMetricsCSV(): string {
    const metrics = this.getMetrics();
    let csv = 'Metric,Value\n';
    csv += `Total Vehicles,${metrics.totalVehicles}\n`;
    csv += `Completed Trips,${metrics.completedTrips}\n`;
    csv += `Average Speed (m/s),${metrics.averageSpeed.toFixed(2)}\n`;
    csv += `Average Wait Time (s),${metrics.averageWaitTime.toFixed(2)}\n`;
    csv += `Max Wait Time (s),${metrics.maxWaitTime.toFixed(2)}\n`;
    csv += `Total Stops,${metrics.totalStops}\n`;
    csv += `Simulation Time (s),${metrics.simulationTime.toFixed(2)}\n`;
    
    return csv;
  }

  /**
   * Helper to download metrics as a CSV file
   */
  public downloadMetricsCSV(): void {
    const csv = this.exportMetricsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `traffic-metrics-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Record a significant speed change
   */
  public recordSpeedChange(vehicle: Car, time: number, oldSpeed: number, newSpeed: number): void {
    if (!this.isRecording) return;
    
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: newSpeed,
      oldSpeed: oldSpeed,
      event: VehicleEvent.SPEED_CHANGE
    });
  }

  /**
   * Test function to validate KPI collection accuracy
   * Logs detailed event counts and metrics to validate collection is working properly
   * Returns HTML formatted validation report for UI display
   */
  public validateMetrics(): string {
    // Count events by type
    const eventCounts: { [key: string]: number } = {};
    for (const metric of this.vehicleMetrics) {
      eventCounts[metric.event] = (eventCounts[metric.event] || 0) + 1;
    }
    
    // Get all unique vehicle IDs
    const uniqueVehicleIds = new Set(this.vehicleMetrics.map(m => m.vehicleId));
    
    // Calculate metrics
    const metrics = this.getMetrics();
    
    // Print validation report to console
    console.log('=== KPI Collection Validation Report ===');
    console.log('Event counts:', eventCounts);
    console.log('Unique vehicles tracked:', uniqueVehicleIds.size);
    console.log('Active vehicles:', this.activeVehicles.size);
    console.log('Completed trips:', this.completedTrips);
    console.log('Total vehicles processed:', metrics.totalVehicles);
    
    // Verify data integrity
    const vehiclesWithEntry = new Set(this.vehicleMetrics
      .filter(m => m.event === VehicleEvent.ENTER_SIMULATION)
      .map(m => m.vehicleId));
      
    const vehiclesWithExit = new Set(this.vehicleMetrics
      .filter(m => m.event === VehicleEvent.EXIT_SIMULATION)
      .map(m => m.vehicleId));
      
    // Check for vehicles that have exit events but no entry events
    const vehiclesWithExitButNoEntry = [...vehiclesWithExit].filter(id => !vehiclesWithEntry.has(id));
    
    // Check for vehicles that have speed changes but no entry events
    const vehiclesWithSpeedChangeButNoEntry = new Set(this.vehicleMetrics
      .filter(m => m.event === VehicleEvent.SPEED_CHANGE && !vehiclesWithEntry.has(m.vehicleId))
      .map(m => m.vehicleId));
      
    // Check for intersection entries without exits
    const vehiclesInIntersectionWithoutExit = new Set();
    this.vehicleMetrics.forEach(m => {
      if (m.event === VehicleEvent.ENTER_INTERSECTION) {
        // Check if there's a matching exit event after this
        const hasExit = this.vehicleMetrics.some(exit => 
          exit.vehicleId === m.vehicleId && 
          exit.event === VehicleEvent.EXIT_INTERSECTION && 
          exit.timestamp > m.timestamp
        );
        if (!hasExit && this.activeVehicles.has(m.vehicleId)) {
          vehiclesInIntersectionWithoutExit.add(m.vehicleId);
        }
      }
    });
    
    // Check for stop events without subsequent start events
    const stoppedWithoutStart = new Set();
    this.vehicleMetrics.forEach(m => {
      if (m.event === VehicleEvent.STOP_MOVING) {
        // Check if there's a matching start event after this
        const hasStart = this.vehicleMetrics.some(start => 
          start.vehicleId === m.vehicleId && 
          start.event === VehicleEvent.START_MOVING && 
          start.timestamp > m.timestamp
        );
        if (!hasStart && this.activeVehicles.has(m.vehicleId)) {
          stoppedWithoutStart.add(m.vehicleId);
        }
      }
    });
    
    // Check for average speed calculation accuracy
    const calculatedAvgSpeed = this.speedMeasurements > 0 
      ? this.totalSpeed / this.speedMeasurements
      : 0;
      
    // Recalculate by direct measurement to validate
    const allSpeeds = this.vehicleMetrics.map(m => m.speed);
    const directAvgSpeed = allSpeeds.length > 0
      ? allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length
      : 0;
    
    // Log integrity issues
    console.log('=== Data Integrity Checks ===');
    console.log('Vehicles with exit but no entry:', vehiclesWithExitButNoEntry.length);
    console.log('Vehicles with speed changes but no entry:', vehiclesWithSpeedChangeButNoEntry.size);
    console.log('Vehicles currently in intersection:', vehiclesInIntersectionWithoutExit.size);
    console.log('Vehicles stopped without restart:', stoppedWithoutStart.size);
    console.log('Calculated avg speed:', calculatedAvgSpeed);
    console.log('Direct measurement avg speed:', directAvgSpeed);
    console.log('Speed measurement count:', this.speedMeasurements);
    console.log('Total event records:', this.vehicleMetrics.length);
    console.log('==============================');
    
    // Create HTML report for UI display
    let html = '<div class="kpi-validation">';
    html += '<h3>KPI Collection Validation Report</h3>';
    html += '<table class="validation-table">';
    html += '<tr><th colspan="2">Event Counts</th></tr>';
    
    for (const [event, count] of Object.entries(eventCounts)) {
      html += `<tr><td>${event}</td><td>${count}</td></tr>`;
    }
    
    html += '<tr><th colspan="2">Vehicle Statistics</th></tr>';
    html += `<tr><td>Unique vehicles tracked</td><td>${uniqueVehicleIds.size}</td></tr>`;
    html += `<tr><td>Total vehicles (entry events)</td><td>${vehiclesWithEntry.size}</td></tr>`;
    html += `<tr><td>Vehicles with exit events</td><td>${vehiclesWithExit.size}</td></tr>`;
    html += `<tr><td>Currently active vehicles</td><td>${this.activeVehicles.size}</td></tr>`;
    html += `<tr><td>Completed trips</td><td>${this.completedTrips}</td></tr>`;
    
    html += '<tr><th colspan="2">Speed Statistics</th></tr>';
    html += `<tr><td>Average speed (calculated)</td><td>${calculatedAvgSpeed.toFixed(2)} m/s</td></tr>`;
    html += `<tr><td>Average speed (direct)</td><td>${directAvgSpeed.toFixed(2)} m/s</td></tr>`;
    html += `<tr><td>Speed measurements</td><td>${this.speedMeasurements}</td></tr>`;
    
    html += '<tr><th colspan="2">Data Integrity Issues</th></tr>';
    
    // Add validation warnings in red if issues found
    const hasIssues = vehiclesWithExitButNoEntry.length > 0 || 
                     vehiclesWithSpeedChangeButNoEntry.size > 0 ||
                     Math.abs(calculatedAvgSpeed - directAvgSpeed) > 1.0;
                     
    if (hasIssues) {
      if (vehiclesWithExitButNoEntry.length > 0) {
        html += `<tr class="validation-error"><td>Vehicles with exit but no entry</td><td>${vehiclesWithExitButNoEntry.length}</td></tr>`;
      }
      
      if (vehiclesWithSpeedChangeButNoEntry.size > 0) {
        html += `<tr class="validation-error"><td>Vehicles with speed changes but no entry</td><td>${vehiclesWithSpeedChangeButNoEntry.size}</td></tr>`;
      }
      
      if (Math.abs(calculatedAvgSpeed - directAvgSpeed) > 1.0) {
        html += `<tr class="validation-error"><td>Speed calculation discrepancy</td><td>${Math.abs(calculatedAvgSpeed - directAvgSpeed).toFixed(2)}</td></tr>`;
      }
    } else {
      html += `<tr class="validation-success"><td colspan="2">All validation checks passed!</td></tr>`;
    }
    
    html += `<tr><td>Total event records</td><td>${this.vehicleMetrics.length}</td></tr>`;
    html += '</table></div>';
    
    return html;
  }
}

// Export a singleton instance for application-wide use
export const kpiCollector = new KPICollector();
