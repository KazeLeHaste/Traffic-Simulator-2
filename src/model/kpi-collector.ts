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
  laneId?: string; // For lane-specific events
  roadId?: string; // For road-specific events
}

export enum VehicleEvent {
  ENTER_SIMULATION = 'enter_simulation',
  EXIT_SIMULATION = 'exit_simulation',
  ENTER_INTERSECTION = 'enter_intersection',
  EXIT_INTERSECTION = 'exit_intersection',
  START_MOVING = 'start_moving',
  STOP_MOVING = 'stop_moving',
  CHANGE_LANE = 'change_lane',
  SPEED_CHANGE = 'speed_change',
  ENTER_LANE = 'enter_lane',
  EXIT_LANE = 'exit_lane'
}

export interface IntersectionMetric {
  intersectionId: string;
  timestamp: number;
  queueLength: number;
  waitTime?: number;
  signalPhase?: number;
  throughput?: number; // Vehicles per minute passing through
}

export interface LaneMetric {
  laneId: string;
  timestamp: number;
  vehicleCount: number;
  averageSpeed: number; 
  congestionRate: number; // 0-1 value representing congestion level
  queueLength?: number;
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
  
  // New expanded metrics
  laneMetrics: { [laneId: string]: LaneDetailedMetrics };
  intersectionMetrics: { [intersectionId: string]: IntersectionDetailedMetrics };
  globalThroughput: number; // Vehicles per minute for entire simulation
  congestionIndex: number; // Overall congestion index (0-1)
}

// Detailed metrics for lanes
export interface LaneDetailedMetrics {
  laneId: string;
  averageSpeed: number;
  vehicleCount: number;
  maxVehicleCount: number;
  averageVehicleCount: number;
  congestionRate: number; // 0-1 ratio of vehicle count to capacity
  throughput: number; // Vehicles per minute
  totalVehiclesPassed: number;
  averageWaitTime: number;
  queueLength: number; // Average queue length
}

// Detailed metrics for intersections
export interface IntersectionDetailedMetrics {
  intersectionId: string;
  throughput: number; // Vehicles per minute
  averageWaitTime: number;
  maxWaitTime: number;
  averageQueueLength: number;
  maxQueueLength: number;
  totalVehiclesPassed: number;
  congestionRate: number; // Based on queue length and wait time
}

export class KPICollector {
  // Store metrics
  private vehicleMetrics: VehicleMetric[] = [];
  private intersectionMetrics: IntersectionMetric[] = [];
  private laneMetrics: LaneMetric[] = [];
  private activeVehicles: Set<string> = new Set();
  private stoppedVehicles: Set<string> = new Set();
  private stoppedTimestamps: { [vehicleId: string]: number } = {};
  private completedTrips: number = 0;
  private simulationStartTime: number = 0;

  // Summary metrics (calculated on demand)
  private totalSpeed: number = 0;
  private speedMeasurements: number = 0;
  private waitTimes: number[] = [];
  
  // Lane tracking
  private vehiclesInLane: { [laneId: string]: Set<string> } = {}; // laneId -> Set of vehicleIds
  private laneEntryTimes: { [vehicleId: string]: { [laneId: string]: number } } = {}; // vehicleId -> {laneId -> entryTime}
  private laneThroughput: { [laneId: string]: number } = {}; // laneId -> count
  private laneWaitTimes: { [laneId: string]: number[] } = {}; // laneId -> waitTimes array
  private laneTotalSpeeds: { [laneId: string]: { total: number, count: number } } = {}; // laneId -> {total, count}
  
  // Intersection tracking
  private intersectionEntryTimes: { [vehicleId: string]: { [intersectionId: string]: number } } = {}; // vehicleId -> {intersectionId -> entryTime}
  private intersectionThroughput: { [intersectionId: string]: number } = {}; // intersectionId -> count
  private intersectionWaitTimes: { [intersectionId: string]: number[] } = {}; // intersectionId -> waitTimes array
  private intersectionQueueHistory: { [intersectionId: string]: number[] } = {}; // intersectionId -> queueLengths array
  
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
    this.laneMetrics = [];
    this.activeVehicles = new Set();
    this.stoppedVehicles = new Set();
    this.stoppedTimestamps = {};
    this.completedTrips = 0;
    this.simulationStartTime = 0;
    this.totalSpeed = 0;
    this.speedMeasurements = 0;
    this.waitTimes = [];
    this.isRecording = false;
    
    // Reset lane tracking
    this.vehiclesInLane = {};
    this.laneEntryTimes = {};
    this.laneThroughput = {};
    this.laneWaitTimes = {};
    this.laneTotalSpeeds = {};
    
    // Reset intersection tracking
    this.intersectionEntryTimes = {};
    this.intersectionThroughput = {};
    this.intersectionWaitTimes = {};
    this.intersectionQueueHistory = {};
    
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
    
    // Add to active vehicles set
    this.activeVehicles.add(vehicle.id);
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.ENTER_SIMULATION
    });
    
    console.log(`KPI Collector: Vehicle ${vehicle.id} entered simulation at time ${time}`);
  }

  /**
   * Record vehicle exiting the simulation
   */
  public recordVehicleExit(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    // Remove from active vehicles set
    this.activeVehicles.delete(vehicle.id);
    
    // Increment completed trips counter
    this.completedTrips++;
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.EXIT_SIMULATION
    });
    
    console.log(`KPI Collector: Vehicle ${vehicle.id} exited simulation at time ${time}`);
  }

  /**
   * Record vehicle stopping (speed ~= 0)
   */
  public recordVehicleStop(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    // Add to stopped vehicles set
    this.stoppedVehicles.add(vehicle.id);
    
    // Record stop timestamp for duration calculation later
    this.stoppedTimestamps[vehicle.id] = time;
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.STOP_MOVING
    });
  }

  /**
   * Record vehicle starting to move again
   */
  public recordVehicleStart(vehicle: Car, time: number): void {
    if (!this.isRecording) return;
    
    // Remove from stopped vehicles set
    this.stoppedVehicles.delete(vehicle.id);
    
    // Calculate stop duration if we have a stop timestamp
    let duration = 0;
    if (this.stoppedTimestamps[vehicle.id]) {
      duration = time - this.stoppedTimestamps[vehicle.id];
      delete this.stoppedTimestamps[vehicle.id];
      
      // Record wait time for statistics
      this.waitTimes.push(duration);
    }
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      event: VehicleEvent.START_MOVING,
      duration: duration
    });
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
    
    const intersectionId = intersection.id;
    
    // Initialize intersection tracking structures if needed
    if (!this.intersectionEntryTimes[vehicle.id]) {
      this.intersectionEntryTimes[vehicle.id] = {};
    }
    if (!this.intersectionQueueHistory[intersectionId]) {
      this.intersectionQueueHistory[intersectionId] = [];
    }
    
    // Record entry time for calculating wait time later
    this.intersectionEntryTimes[vehicle.id][intersectionId] = time;
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      intersectionId: intersectionId,
      event: VehicleEvent.ENTER_INTERSECTION
    });
    
    // Update intersection metrics
    const queueLength = this.getVehiclesAtIntersection(intersectionId).length;
    
    // Store queue length history
    this.intersectionQueueHistory[intersectionId].push(queueLength);
    
    // Record updated intersection metrics
    this.intersectionMetrics.push({
      intersectionId: intersectionId,
      timestamp: time,
      queueLength: queueLength
    });
  }

  /**
   * Record vehicle exiting an intersection
   */
  public recordIntersectionExit(vehicle: Car, intersection: Intersection, time: number): void {
    if (!this.isRecording) return;
    
    const intersectionId = intersection.id;
    
    // Initialize tracking if needed
    if (!this.intersectionEntryTimes[vehicle.id]) {
      this.intersectionEntryTimes[vehicle.id] = {};
    }
    if (!this.intersectionThroughput[intersectionId]) {
      this.intersectionThroughput[intersectionId] = 0;
    }
    if (!this.intersectionWaitTimes[intersectionId]) {
      this.intersectionWaitTimes[intersectionId] = [];
    }
    
    // Calculate wait time for the vehicle at this intersection
    if (this.intersectionEntryTimes[vehicle.id][intersectionId]) {
      const waitTime = time - this.intersectionEntryTimes[vehicle.id][intersectionId];
      this.intersectionWaitTimes[intersectionId].push(waitTime);
      delete this.intersectionEntryTimes[vehicle.id][intersectionId];
    }
    
    // Increment throughput counter
    this.intersectionThroughput[intersectionId]++;
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      intersectionId: intersectionId,
      event: VehicleEvent.EXIT_INTERSECTION
    });
    
    // Update intersection metrics
    const queueLength = this.getVehiclesAtIntersection(intersectionId).length;
    
    // Update queue length history
    if (!this.intersectionQueueHistory[intersectionId]) {
      this.intersectionQueueHistory[intersectionId] = [];
    }
    this.intersectionQueueHistory[intersectionId].push(queueLength);
    
    // Record updated intersection metrics
    this.intersectionMetrics.push({
      intersectionId: intersectionId,
      timestamp: time,
      queueLength: queueLength,
      // Calculate throughput as vehicles per minute (based on simulation time)
      throughput: this.calculateIntersectionThroughput(intersectionId, time)
    });
  }
  
  /**
   * Calculate vehicles per minute throughput for an intersection
   */
  private calculateIntersectionThroughput(intersectionId: string, currentTime: number): number {
    const throughput = this.intersectionThroughput[intersectionId] || 0;
    const elapsedMinutes = Math.max(0.001, (currentTime - this.simulationStartTime) / 60);
    return throughput / elapsedMinutes; // Vehicles per minute
  }

  /**
   * Record a vehicle entering a lane
   */
  public recordLaneEnter(vehicle: Car, lane: any, time: number): void {
    if (!this.isRecording) return;
    
    const laneId = lane.id;
    
    // Initialize lane tracking structures if needed
    if (!this.vehiclesInLane[laneId]) {
      this.vehiclesInLane[laneId] = new Set();
    }
    if (!this.laneEntryTimes[vehicle.id]) {
      this.laneEntryTimes[vehicle.id] = {};
    }
    
    // Add vehicle to lane set
    this.vehiclesInLane[laneId].add(vehicle.id);
    
    // Record entry time for calculating wait time later
    this.laneEntryTimes[vehicle.id][laneId] = time;
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      laneId: laneId,
      roadId: lane.road ? lane.road.id : undefined,
      event: VehicleEvent.ENTER_LANE
    });
    
    // Update lane metrics
    const vehicleCount = this.vehiclesInLane[laneId].size;
    const averageSpeed = this.calculateAverageLaneSpeed(laneId);
    const congestionRate = this.calculateLaneCongestion(laneId, lane);
    
    // Record lane metrics
    this.laneMetrics.push({
      laneId: laneId,
      timestamp: time,
      vehicleCount: vehicleCount,
      averageSpeed: averageSpeed,
      congestionRate: congestionRate
    });
  }
  
  /**
   * Record a vehicle exiting a lane
   */
  public recordLaneExit(vehicle: Car, lane: any, time: number): void {
    if (!this.isRecording) return;
    
    const laneId = lane.id;
    
    // Initialize tracking structures if needed
    if (!this.vehiclesInLane[laneId]) {
      this.vehiclesInLane[laneId] = new Set();
    }
    if (!this.laneEntryTimes[vehicle.id]) {
      this.laneEntryTimes[vehicle.id] = {};
    }
    if (!this.laneThroughput[laneId]) {
      this.laneThroughput[laneId] = 0;
    }
    if (!this.laneWaitTimes[laneId]) {
      this.laneWaitTimes[laneId] = [];
    }
    
    // Remove vehicle from lane set
    this.vehiclesInLane[laneId].delete(vehicle.id);
    
    // Calculate time spent in lane
    if (this.laneEntryTimes[vehicle.id] && this.laneEntryTimes[vehicle.id][laneId]) {
      const timeInLane = time - this.laneEntryTimes[vehicle.id][laneId];
      this.laneWaitTimes[laneId].push(timeInLane);
      delete this.laneEntryTimes[vehicle.id][laneId];
    }
    
    // Increment lane throughput counter
    this.laneThroughput[laneId]++;
    
    // Record the vehicle event
    this.vehicleMetrics.push({
      vehicleId: vehicle.id,
      timestamp: time,
      speed: vehicle.speed,
      laneId: laneId,
      roadId: lane.road ? lane.road.id : undefined,
      event: VehicleEvent.EXIT_LANE
    });
    
    // Update lane metrics
    const vehicleCount = this.vehiclesInLane[laneId].size;
    const averageSpeed = this.calculateAverageLaneSpeed(laneId);
    const congestionRate = this.calculateLaneCongestion(laneId, lane);
    
    // Record lane metrics
    this.laneMetrics.push({
      laneId: laneId,
      timestamp: time,
      vehicleCount: vehicleCount,
      averageSpeed: averageSpeed,
      congestionRate: congestionRate
    });
  }

  /**
   * Calculate average speed in a lane
   */
  private calculateAverageLaneSpeed(laneId: string): number {
    if (!this.laneTotalSpeeds[laneId] || this.laneTotalSpeeds[laneId].count === 0) {
      return 0;
    }
    
    return this.laneTotalSpeeds[laneId].total / this.laneTotalSpeeds[laneId].count;
  }
  
  /**
   * Calculate lane congestion (0-1 scale)
   */
  private calculateLaneCongestion(laneId: string, lane: any): number {
    if (!this.vehiclesInLane[laneId]) {
      return 0;
    }
    
    // Assuming a lane can fit roughly lane.length / 5 cars (average car length + safety distance)
    const laneCapacity = lane.length ? Math.floor(lane.length / 5) : 10;
    return Math.min(this.vehiclesInLane[laneId].size / laneCapacity, 1);
  }
  
  /**
   * Sample the current state of a specific lane
   */
  public sampleLaneState(lane: any, time: number): void {
    if (!this.isRecording) return;
    
    const laneId = lane.id;
    if (!this.vehiclesInLane[laneId]) {
      this.vehiclesInLane[laneId] = new Set();
    }
    
    // Count vehicles in the lane
    const vehicleCount = this.vehiclesInLane[laneId].size;
    
    // Calculate congestion rate
    const congestionRate = this.calculateLaneCongestion(lane, vehicleCount);
    
    // Collect speeds of vehicles in the lane to calculate average speed
    let totalSpeed = 0;
    let count = 0;
    
    // This would require a mapping of which vehicles are in which lane
    // We'll update this in the recordLaneEnter/Exit methods
    
    // Add this to our lane metrics
    this.laneMetrics.push({
      laneId: laneId,
      timestamp: time,
      vehicleCount: vehicleCount,
      averageSpeed: this.calculateAverageLaneSpeed(laneId),
      congestionRate: congestionRate,
      queueLength: this.calculateLaneQueueLength(laneId)
    });
  }
  
  /**
   * Calculate queue length in a lane based on stopped vehicles
   */
  private calculateLaneQueueLength(laneId: string): number {
    // Count stopped vehicles in the lane
    let queueCount = 0;
    
    if (this.vehiclesInLane[laneId]) {
      this.vehiclesInLane[laneId].forEach(vehicleId => {
        if (this.stoppedVehicles.has(vehicleId)) {
          queueCount++;
        }
      });
    }
    
    return queueCount;
  }
  
  /**
   * Update lane speed metrics when a vehicle's speed changes
   */
  public updateLaneSpeedMetrics(vehicle: Car, laneId: string, speed: number): void {
    if (!this.isRecording || !laneId) return;
    
    // Initialize if needed
    if (!this.laneTotalSpeeds[laneId]) {
      this.laneTotalSpeeds[laneId] = { total: 0, count: 0 };
    }
    
    // Update speed metrics for the lane
    this.laneTotalSpeeds[laneId].total += speed;
    this.laneTotalSpeeds[laneId].count++;
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
      simulationTime: currentTime - this.simulationStartTime,
      
      // New expanded metrics
      laneMetrics: this.calculateLaneMetrics(),
      intersectionMetrics: this.calculateIntersectionMetrics(),
      globalThroughput: this.calculateGlobalThroughput(),
      congestionIndex: this.calculateCongestionIndex()
    };
  }

  /**
   * Calculate detailed lane metrics
   */
  private calculateLaneMetrics(): { [laneId: string]: LaneDetailedMetrics } {
    const laneMetrics: { [laneId: string]: LaneDetailedMetrics } = {};
    
    // Calculate metrics for each vehicle
    this.vehicleMetrics.forEach(metric => {
      if (metric.event === VehicleEvent.ENTER_LANE || metric.event === VehicleEvent.EXIT_LANE) {
        const laneId = metric.laneId || '';
        if (!laneMetrics[laneId]) {
          laneMetrics[laneId] = {
            laneId: laneId,
            averageSpeed: 0,
            vehicleCount: 0,
            maxVehicleCount: 0,
            averageVehicleCount: 0,
            congestionRate: 0,
            throughput: 0,
            totalVehiclesPassed: 0,
            averageWaitTime: 0,
            queueLength: 0
          };
        }
        
        const laneMetric = laneMetrics[laneId];
        
        // Update counts
        laneMetric.vehicleCount++;
        laneMetric.totalVehiclesPassed++;
        
        // Update speeds
        laneMetric.averageSpeed += metric.speed;
        
        // Update queue length (simple approximation)
        if (metric.event === VehicleEvent.ENTER_LANE) {
          laneMetric.queueLength++;
        } else if (metric.event === VehicleEvent.EXIT_LANE) {
          laneMetric.queueLength = Math.max(0, laneMetric.queueLength - 1);
        }
      }
    });
    
    // Finalize metrics calculation
    for (const laneId in laneMetrics) {
      const metric = laneMetrics[laneId];
      metric.averageSpeed /= metric.vehicleCount || 1;
      metric.congestionRate = Math.min(1, metric.queueLength / 10); // Assume max 10 vehicles before congestion
      metric.throughput = metric.totalVehiclesPassed / (this.simulationStartTime + 1); // Per minute
    }
    
    return laneMetrics;
  }

  /**
   * Calculate detailed intersection metrics
   */
  private calculateIntersectionMetrics(): { [intersectionId: string]: IntersectionDetailedMetrics } {
    const intersectionMetrics: { [intersectionId: string]: IntersectionDetailedMetrics } = {};
    
    // Calculate metrics for each vehicle
    this.vehicleMetrics.forEach(metric => {
      if (metric.event === VehicleEvent.ENTER_INTERSECTION || metric.event === VehicleEvent.EXIT_INTERSECTION) {
        const intersectionId = metric.intersectionId || '';
        if (!intersectionMetrics[intersectionId]) {
          intersectionMetrics[intersectionId] = {
            intersectionId: intersectionId,
            throughput: 0,
            averageWaitTime: 0,
            maxWaitTime: 0,
            averageQueueLength: 0,
            maxQueueLength: 0,
            totalVehiclesPassed: 0,
            congestionRate: 0
          };
        }
        
        const intersectionMetric = intersectionMetrics[intersectionId];
        
        // Update counts
        intersectionMetric.totalVehiclesPassed++;
        
        // Update queue length (simple approximation)
        if (metric.event === VehicleEvent.ENTER_INTERSECTION) {
          intersectionMetric.averageQueueLength++;
        } else if (metric.event === VehicleEvent.EXIT_INTERSECTION) {
          intersectionMetric.averageQueueLength = Math.max(0, intersectionMetric.averageQueueLength - 1);
        }
      }
    });
    
    // Finalize metrics calculation
    for (const intersectionId in intersectionMetrics) {
      const metric = intersectionMetrics[intersectionId];
      metric.throughput = metric.totalVehiclesPassed / (this.simulationStartTime + 1); // Per minute
      metric.congestionRate = Math.min(1, metric.averageQueueLength / 10); // Assume max 10 vehicles before congestion
    }
    
    return intersectionMetrics;
  }

  /**
   * Calculate global throughput (vehicles per minute)
   */
  private calculateGlobalThroughput(): number {
    return this.vehicleMetrics.length / (this.simulationStartTime + 1);
  }

  /**
   * Calculate congestion index (0-1)
   */
  private calculateCongestionIndex(): number {
    // Simple index based on average queue length across all intersections and lanes
    const totalQueueLength = Object.values(this.calculateLaneMetrics()).reduce((sum, metric) => sum + metric.queueLength, 0) +
                             Object.values(this.calculateIntersectionMetrics()).reduce((sum, metric) => sum + metric.averageQueueLength, 0);
    
    const maxPossibleQueueLength = (Object.keys(this.calculateLaneMetrics()).length + Object.keys(this.calculateIntersectionMetrics()).length) * 10; // Assume max 10 vehicles before congestion per lane/intersection
    return Math.min(1, totalQueueLength / maxPossibleQueueLength);
  }

  /**
   * Export metrics as CSV format
   */
  public exportMetricsCSV(): string {
    const metrics = this.getMetrics();
    let csv = 'Metric,Value\n';
    
    // Global metrics
    csv += '# Global Simulation Metrics\n';
    csv += `Total Vehicles,${metrics.totalVehicles}\n`;
    csv += `Active Vehicles,${metrics.activeVehicles}\n`;
    csv += `Completed Trips,${metrics.completedTrips}\n`;
    csv += `Average Speed (m/s),${metrics.averageSpeed.toFixed(2)}\n`;
    csv += `Average Wait Time (s),${metrics.averageWaitTime.toFixed(2)}\n`;
    csv += `Max Wait Time (s),${metrics.maxWaitTime.toFixed(2)}\n`;
    csv += `Total Stops,${metrics.totalStops}\n`;
    csv += `Stopped Vehicles,${metrics.stoppedVehicles}\n`;
    csv += `Global Throughput (vehicles/min),${metrics.globalThroughput.toFixed(2)}\n`;
    csv += `Global Congestion Index,${metrics.congestionIndex.toFixed(2)}\n`;
    csv += `Simulation Time (s),${metrics.simulationTime.toFixed(2)}\n\n`;
    
    // Lane metrics
    csv += '# Lane Metrics\n';
    csv += 'Lane ID,Average Speed,Vehicle Count,Max Vehicle Count,Average Vehicle Count,Congestion Rate,Throughput,Total Vehicles Passed,Average Wait Time,Queue Length\n';
    
    Object.values(metrics.laneMetrics).forEach(lane => {
      csv += `${lane.laneId},${lane.averageSpeed.toFixed(2)},${lane.vehicleCount},${lane.maxVehicleCount},`;
      csv += `${lane.averageVehicleCount.toFixed(2)},${lane.congestionRate.toFixed(2)},${lane.throughput.toFixed(2)},`;
      csv += `${lane.totalVehiclesPassed},${lane.averageWaitTime.toFixed(2)},${lane.queueLength}\n`;
    });
    
    csv += '\n# Intersection Metrics\n';
    csv += 'Intersection ID,Throughput,Average Wait Time,Max Wait Time,Average Queue Length,Max Queue Length,Total Vehicles Passed,Congestion Rate\n';
    
    Object.values(metrics.intersectionMetrics).forEach(intersection => {
      csv += `${intersection.intersectionId},${intersection.throughput.toFixed(2)},${intersection.averageWaitTime.toFixed(2)},`;
      csv += `${intersection.maxWaitTime.toFixed(2)},${intersection.averageQueueLength.toFixed(2)},${intersection.maxQueueLength},`;
      csv += `${intersection.totalVehiclesPassed},${intersection.congestionRate.toFixed(2)}\n`;
    });
    
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
    
    // Check for lane entries without exits
    const vehiclesInLaneWithoutExit = new Set();
    this.vehicleMetrics.forEach(m => {
      if (m.event === VehicleEvent.ENTER_LANE) {
        // Check if there's a matching exit event after this
        const hasExit = this.vehicleMetrics.some(exit => 
          exit.vehicleId === m.vehicleId && 
          exit.event === VehicleEvent.EXIT_LANE && 
          exit.laneId === m.laneId && 
          exit.timestamp > m.timestamp
        );
        if (!hasExit && this.activeVehicles.has(m.vehicleId)) {
          vehiclesInLaneWithoutExit.add(m.vehicleId);
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
      
    // Validate lane metrics consistency
    const laneEntryEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.ENTER_LANE);
    const laneExitEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.EXIT_LANE);
    const lanesToValidate = Object.keys(metrics.laneMetrics);
    
    const laneMetricsValidation: { [laneId: string]: { entries: number, exits: number, balance: number } } = {};
    lanesToValidate.forEach(laneId => {
      const entries = laneEntryEvents.filter(m => m.laneId === laneId).length;
      const exits = laneExitEvents.filter(m => m.laneId === laneId).length;
      laneMetricsValidation[laneId] = {
        entries,
        exits,
        balance: entries - exits
      };
    });
    
    // Validate intersection metrics consistency
    const intersectionEntryEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.ENTER_INTERSECTION);
    const intersectionExitEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.EXIT_INTERSECTION);
    const intersectionsToValidate = Object.keys(metrics.intersectionMetrics);
    
    const intersectionMetricsValidation: { [intersectionId: string]: { entries: number, exits: number, balance: number } } = {};
    intersectionsToValidate.forEach(intersectionId => {
      const entries = intersectionEntryEvents.filter(m => m.intersectionId === intersectionId).length;
      const exits = intersectionExitEvents.filter(m => m.intersectionId === intersectionId).length;
      intersectionMetricsValidation[intersectionId] = {
        entries,
        exits,
        balance: entries - exits
      };
    });
    
    // Log integrity issues
    console.log('=== Data Integrity Checks ===');
    console.log('Vehicles with exit but no entry:', vehiclesWithExitButNoEntry.length);
    console.log('Vehicles with speed changes but no entry:', vehiclesWithSpeedChangeButNoEntry.size);
    console.log('Vehicles currently in intersection:', vehiclesInIntersectionWithoutExit.size);
    console.log('Vehicles in lane without exit:', vehiclesInLaneWithoutExit.size);
    console.log('Vehicles stopped without restart:', stoppedWithoutStart.size);
    console.log('Calculated avg speed:', calculatedAvgSpeed);
    console.log('Direct measurement avg speed:', directAvgSpeed);
    console.log('Speed measurement count:', this.speedMeasurements);
    console.log('Lane metrics validation:', laneMetricsValidation);
    console.log('Intersection metrics validation:', intersectionMetricsValidation);
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
    
    // Lane and intersection validation
    html += '<tr><th colspan="3">Lane Metrics Validation</th></tr>';
    html += '<tr><td>Lane ID</td><td>Entries</td><td>Exits</td></tr>';
    for (const [laneId, validation] of Object.entries(laneMetricsValidation)) {
      const isBalanced = validation.balance === 0 || 
                       (validation.entries > 0 && (validation.balance / validation.entries) < 0.05);
      const rowClass = isBalanced ? '' : 'validation-error';
      html += `<tr class="${rowClass}"><td>${laneId}</td><td>${validation.entries}</td><td>${validation.exits}</td></tr>`;
    }
    
    html += '<tr><th colspan="3">Intersection Metrics Validation</th></tr>';
    html += '<tr><td>Intersection ID</td><td>Entries</td><td>Exits</td></tr>';
    for (const [intersectionId, validation] of Object.entries(intersectionMetricsValidation)) {
      const isBalanced = validation.balance === 0 || 
                       (validation.entries > 0 && (validation.balance / validation.entries) < 0.05);
      const rowClass = isBalanced ? '' : 'validation-error';
      html += `<tr class="${rowClass}"><td>${intersectionId}</td><td>${validation.entries}</td><td>${validation.exits}</td></tr>`;
    }
    
    html += '<tr><th colspan="2">Data Integrity Issues</th></tr>';
    
    // Add validation warnings in red if issues found
    const hasIssues = vehiclesWithExitButNoEntry.length > 0 || 
                     vehiclesWithSpeedChangeButNoEntry.size > 0 ||
                     Math.abs(calculatedAvgSpeed - directAvgSpeed) > 1.0 ||
                     vehiclesInLaneWithoutExit.size > 0;
                     
    if (hasIssues) {
      if (vehiclesWithExitButNoEntry.length > 0) {
        html += `<tr class="validation-error"><td>Vehicles with exit but no entry</td><td>${vehiclesWithExitButNoEntry.length}</td></tr>`;
      }
      
      if (vehiclesWithSpeedChangeButNoEntry.size > 0) {
        html += `<tr class="validation-error"><td>Vehicles with speed changes but no entry</td><td>${vehiclesWithSpeedChangeButNoEntry.size}</td></tr>`;
      }
      
      if (vehiclesInLaneWithoutExit.size > 0) {
        html += `<tr class="validation-error"><td>Vehicles in lane without exit</td><td>${vehiclesInLaneWithoutExit.size}</td></tr>`;
      }
      
      if (Math.abs(calculatedAvgSpeed - directAvgSpeed) > 1.0) {
        html += `<tr class="validation-error"><td>Speed calculation discrepancy</td><td>${Math.abs(calculatedAvgSpeed - directAvgSpeed).toFixed(2)}</td></tr>`;
      }
    } else {
      html += `<tr class="validation-success"><td colspan="2">All validation checks passed!</td></tr>`;
    }
    
    // Global metrics summary
    html += '<tr><th colspan="2">Global Metrics</th></tr>';
    html += `<tr><td>Global Throughput (vehicles/min)</td><td>${metrics.globalThroughput.toFixed(2)}</td></tr>`;
    html += `<tr><td>Congestion Index (0-1)</td><td>${metrics.congestionIndex.toFixed(2)}</td></tr>`;
    html += `<tr><td>Total event records</td><td>${this.vehicleMetrics.length}</td></tr>`;
    
    html += '</table></div>';
    
    return html;
  }
}

// Export a singleton instance for application-wide use
export const kpiCollector = new KPICollector();
