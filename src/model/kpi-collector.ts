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
  
  // Enhanced KPIs
  laneMetrics: { [laneId: string]: LaneDetailedMetrics };
  intersectionMetrics: { [intersectionId: string]: IntersectionDetailedMetrics };
  globalThroughput: number; // Vehicles per minute for entire simulation
  congestionIndex: number; // Overall congestion index (0-1)
  
  // New comprehensive KPIs
  averageVehicleDelay: number; // Average delay per vehicle in seconds
  averageTravelTime: number; // Average complete journey time in seconds
  averageStopFrequency: number; // Average number of stops per vehicle
  totalEmissions: EmissionMetrics; // Total emissions and fuel consumption
  averageEmissionsPerVehicle: EmissionMetrics; // Average emissions per vehicle
  intersectionUtilizationRate: { [intersectionId: string]: UtilizationMetrics };
  vehicleDensity: { [roadId: string]: DensityMetrics };
  levelOfService: { [segmentId: string]: LevelOfServiceMetrics };
  queueMetrics: QueueMetrics; // Enhanced queue length statistics
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

// New comprehensive metric interfaces
export interface EmissionMetrics {
  co2Emissions: number; // kg of CO2
  fuelConsumption: number; // liters of fuel
  noxEmissions: number; // kg of NOx
  pmEmissions: number; // kg of particulate matter
  totalEmissions: number; // Total environmental impact score
}

export interface UtilizationMetrics {
  activeTime: number; // Time spent with vehicles (seconds)
  totalTime: number; // Total simulation time (seconds)
  utilizationRate: number; // Percentage (0-100)
  idleTime: number; // Time with no vehicles (seconds)
  peakUtilization: number; // Maximum utilization rate observed
}

export interface DensityMetrics {
  averageDensity: number; // Average vehicles per kilometer
  maxDensity: number; // Maximum density observed
  densityVariance: number; // Variance in density measurements
  congestionThreshold: number; // Density at which congestion starts
  timeAboveThreshold: number; // Time spent above congestion threshold
}

export interface LevelOfServiceMetrics {
  los: string; // Level of Service grade (A-F)
  averageDelay: number; // Average delay in seconds
  averageSpeed: number; // Average speed in m/s
  densityScore: number; // Traffic density score
  qualityScore: number; // Overall quality score (0-100)
  description: string; // Human-readable description
}

export interface QueueMetrics {
  globalMaxQueueLength: number; // Maximum queue length across all locations
  globalAverageQueueLength: number; // Average queue length across all locations
  totalQueueTime: number; // Total time vehicles spent in queues
  averageQueueTime: number; // Average time per vehicle in queues
  queuesByIntersection: { [intersectionId: string]: QueueLocationMetrics };
  queuesByLane: { [laneId: string]: QueueLocationMetrics };
}

export interface QueueLocationMetrics {
  maxQueueLength: number;
  averageQueueLength: number;
  totalQueueTime: number;
  queueFormationEvents: number; // Number of times queues formed
  queueDissipationEvents: number; // Number of times queues cleared
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
  
  // New comprehensive KPI tracking
  private vehicleJourneyTimes: { [vehicleId: string]: { startTime: number, endTime?: number, totalDelay: number } } = {};
  private vehicleStopCounts: { [vehicleId: string]: number } = {};
  private vehicleEmissions: { [vehicleId: string]: EmissionMetrics } = {};
  private totalEmissions: EmissionMetrics = { co2Emissions: 0, fuelConsumption: 0, noxEmissions: 0, pmEmissions: 0, totalEmissions: 0 };
  private intersectionUtilizationTracking: { [intersectionId: string]: { activeTime: number, totalTime: number, lastVehicleTime: number } } = {};
  private densityMeasurements: { [roadId: string]: number[] } = {};
  private queueLengthHistory: { [locationId: string]: number[] } = {};
  private delayMeasurements: number[] = [];
  
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
    
    // Reset new comprehensive KPI tracking
    this.vehicleJourneyTimes = {};
    this.vehicleStopCounts = {};
    this.vehicleEmissions = {};
    this.totalEmissions = { co2Emissions: 0, fuelConsumption: 0, noxEmissions: 0, pmEmissions: 0, totalEmissions: 0 };
    this.intersectionUtilizationTracking = {};
    this.densityMeasurements = {};
    this.queueLengthHistory = {};
    this.delayMeasurements = [];
    
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
    
    // Initialize journey tracking
    this.vehicleJourneyTimes[vehicle.id] = {
      startTime: time,
      totalDelay: 0
    };
    
    // Initialize stop count
    this.vehicleStopCounts[vehicle.id] = 0;
    
    // Initialize emissions tracking
    this.vehicleEmissions[vehicle.id] = {
      co2Emissions: 0,
      fuelConsumption: 0,
      noxEmissions: 0,
      pmEmissions: 0,
      totalEmissions: 0
    };
    
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
    
    // Complete journey tracking
    if (this.vehicleJourneyTimes[vehicle.id]) {
      this.vehicleJourneyTimes[vehicle.id].endTime = time;
    }
    
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
    
    // Increment stop count for this vehicle
    if (this.vehicleStopCounts[vehicle.id] !== undefined) {
      this.vehicleStopCounts[vehicle.id]++;
    }
    
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
      
      // Add to delay measurements
      this.delayMeasurements.push(duration);
      
      // Add to vehicle's total delay
      if (this.vehicleJourneyTimes[vehicle.id]) {
        this.vehicleJourneyTimes[vehicle.id].totalDelay += duration;
      }
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
      stoppedVehicles: this.getAccurateStoppedVehiclesCount(),
      intersectionUtilization,
      roadUtilization,
      simulationTime: currentTime - this.simulationStartTime,
      
      // Enhanced KPIs
      laneMetrics: this.calculateLaneMetrics(),
      intersectionMetrics: this.calculateIntersectionMetrics(),
      globalThroughput: this.calculateGlobalThroughput(),
      congestionIndex: this.calculateCongestionIndex(),
      
      // New comprehensive KPIs
      averageVehicleDelay: this.calculateAverageVehicleDelay(),
      averageTravelTime: this.calculateAverageTravelTime(),
      averageStopFrequency: this.calculateAverageStopFrequency(),
      totalEmissions: this.totalEmissions,
      averageEmissionsPerVehicle: this.calculateAverageEmissionsPerVehicle(),
      intersectionUtilizationRate: this.calculateIntersectionUtilizationRates(currentTime),
      vehicleDensity: this.calculateVehicleDensityMetrics(),
      levelOfService: this.calculateLevelOfServiceMetrics(),
      queueMetrics: this.calculateQueueMetrics()
    };
  }

  /**
   * Validate export data against current UI display for accuracy
   * Returns an object with validation results
   */
  public validateExportData(): { isValid: boolean; discrepancies: string[]; summary: string } {
    const currentMetrics = this.getMetrics();
    const csvData = this.exportMetricsCSV();
    const jsonData = JSON.parse(this.exportMetricsJSON());
    
    const discrepancies: string[] = [];
    
    // Validate CSV data structure
    const csvLines = csvData.split('\n');
    let csvGlobalMetricsFound = false;
    let csvLaneMetricsFound = false;
    let csvIntersectionMetricsFound = false;
    
    for (const line of csvLines) {
      if (line.includes('Total Vehicles,')) {
        const csvValue = parseInt(line.split(',')[1]);
        if (csvValue !== currentMetrics.totalVehicles) {
          discrepancies.push(`Total Vehicles mismatch: CSV=${csvValue}, UI=${currentMetrics.totalVehicles}`);
        }
        csvGlobalMetricsFound = true;
      }
      
      if (line.includes('Average Speed (m/s),')) {
        const csvValue = parseFloat(line.split(',')[1]);
        const diff = Math.abs(csvValue - currentMetrics.averageSpeed);
        if (diff > 0.01) {
          discrepancies.push(`Average Speed mismatch: CSV=${csvValue}, UI=${currentMetrics.averageSpeed.toFixed(2)}`);
        }
      }
      
      if (line.includes('Lane Performance Metrics')) {
        csvLaneMetricsFound = true;
      }
      
      if (line.includes('Intersection Performance Metrics')) {
        csvIntersectionMetricsFound = true;
      }
    }
    
    // Validate JSON data structure
    if (jsonData.summary.totalVehicles !== currentMetrics.totalVehicles) {
      discrepancies.push(`JSON Total Vehicles mismatch: JSON=${jsonData.summary.totalVehicles}, UI=${currentMetrics.totalVehicles}`);
    }
    
    if (Math.abs(jsonData.summary.averageSpeed - currentMetrics.averageSpeed) > 0.01) {
      discrepancies.push(`JSON Average Speed mismatch: JSON=${jsonData.summary.averageSpeed}, UI=${currentMetrics.averageSpeed.toFixed(2)}`);
    }
    
    // Check lane metrics count
    const uiLaneCount = Object.keys(currentMetrics.laneMetrics).length;
    const jsonLaneCount = Object.keys(jsonData.laneMetrics).length;
    if (jsonLaneCount !== uiLaneCount) {
      discrepancies.push(`Lane metrics count mismatch: JSON=${jsonLaneCount}, UI=${uiLaneCount}`);
    }
    
    // Check intersection metrics count
    const uiIntersectionCount = Object.keys(currentMetrics.intersectionMetrics).length;
    const jsonIntersectionCount = Object.keys(jsonData.intersectionMetrics).length;
    if (jsonIntersectionCount !== uiIntersectionCount) {
      discrepancies.push(`Intersection metrics count mismatch: JSON=${jsonIntersectionCount}, UI=${uiIntersectionCount}`);
    }
    
    // Validate required sections exist
    if (!csvGlobalMetricsFound) {
      discrepancies.push('CSV missing global metrics section');
    }
    if (!csvLaneMetricsFound) {
      discrepancies.push('CSV missing lane metrics section');
    }
    if (!csvIntersectionMetricsFound) {
      discrepancies.push('CSV missing intersection metrics section');
    }
    
    const isValid = discrepancies.length === 0;
    const summary = isValid 
      ? '✅ All export data matches UI display accurately'
      : `❌ Found ${discrepancies.length} discrepancy/discrepancies between export data and UI`;
    
    return {
      isValid,
      discrepancies,
      summary
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
    // Fix: Proper throughput is based on completed trips (exited vehicles) per minute
    const completedTrips = this.vehicleMetrics.filter(m => 
      m.event === VehicleEvent.EXIT_SIMULATION
    ).length;
    
    // Add 1 to avoid division by zero, and convert to per-minute metric
    // Use simulation duration since start time
    const simulationDuration = this.simulationStartTime > 0 ? (Date.now() / 1000) - this.simulationStartTime : 1;
    const simulationMinutes = Math.max(1, simulationDuration / 60);
    return completedTrips / simulationMinutes;
  }

  /**
   * Calculate congestion index (0-1)
   */
  private calculateCongestionIndex(): number {
    // More accurate congestion index based on multiple factors:
    // 1. Queue lengths (weighted)
    // 2. Number of stopped vehicles
    // 3. Average speed compared to max possible speed
    
    // Get lane metrics and intersection metrics
    const laneMetrics = this.calculateLaneMetrics();
    const intersectionMetrics = this.calculateIntersectionMetrics();
    
    // Fix: Handle empty metrics properly
    let queueCongestion = 0;
    let locationCount = Math.max(1, Object.keys(laneMetrics).length + Object.keys(intersectionMetrics).length);
    
    try {
      // Calculate queue-based congestion safely
      const totalQueueLength = 
        Object.values(laneMetrics).reduce((sum, metric) => sum + (metric.queueLength || 0), 0) +
        Object.values(intersectionMetrics).reduce((sum, metric) => sum + (metric.averageQueueLength || 0), 0);
      
      queueCongestion = Math.min(1, totalQueueLength / (locationCount * 5)); // Assume 5 vehicles per location is heavy congestion
    } catch (error) {
      console.warn('Error calculating queue congestion:', error);
      queueCongestion = 0;
    }
    
    // Stopped vehicles congestion factor (percentage of active vehicles that are stopped)
    const stoppedVehicleRatio = this.activeVehicles.size > 0 ? 
      this.getAccurateStoppedVehiclesCount() / this.activeVehicles.size : 0;
    
    // Speed-based congestion (how much slower are vehicles compared to ideal)
    const maxSpeed = 10; // Maximum expected speed in m/s
    const avgSpeed = this.speedMeasurements > 0 ? this.totalSpeed / this.speedMeasurements : 0;
    const speedCongestion = Math.max(0, Math.min(1, 1 - (avgSpeed / maxSpeed)));
    
    // Weighted average of the three factors
    return 0.4 * queueCongestion + 0.3 * stoppedVehicleRatio + 0.3 * speedCongestion;
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
    
    // New comprehensive KPIs
    csv += '# Enhanced KPI Metrics\n';
    csv += `Average Vehicle Delay (s),${metrics.averageVehicleDelay.toFixed(2)}\n`;
    csv += `Average Travel Time (s),${metrics.averageTravelTime.toFixed(2)}\n`;
    csv += `Average Stop Frequency,${metrics.averageStopFrequency.toFixed(2)}\n`;
    csv += `Total CO2 Emissions (kg),${metrics.totalEmissions.co2Emissions.toFixed(3)}\n`;
    csv += `Total Fuel Consumption (L),${metrics.totalEmissions.fuelConsumption.toFixed(3)}\n`;
    csv += `Total NOx Emissions (kg),${metrics.totalEmissions.noxEmissions.toFixed(3)}\n`;
    csv += `Total PM Emissions (kg),${metrics.totalEmissions.pmEmissions.toFixed(3)}\n`;
    csv += `Average CO2 per Vehicle (kg),${metrics.averageEmissionsPerVehicle.co2Emissions.toFixed(3)}\n`;
    csv += `Average Fuel per Vehicle (L),${metrics.averageEmissionsPerVehicle.fuelConsumption.toFixed(3)}\n`;
    csv += `Global Max Queue Length,${metrics.queueMetrics.globalMaxQueueLength}\n`;
    csv += `Global Average Queue Length,${metrics.queueMetrics.globalAverageQueueLength.toFixed(2)}\n\n`;
    
    // Intersection utilization rates
    csv += '# Intersection Utilization Rates\n';
    csv += 'Intersection ID,Utilization Rate (%),Active Time (s),Idle Time (s)\n';
    Object.entries(metrics.intersectionUtilizationRate).forEach(([id, util]) => {
      csv += `${id},${util.utilizationRate.toFixed(2)},${util.activeTime.toFixed(2)},${util.idleTime.toFixed(2)}\n`;
    });
    csv += '\n';
    
    // Vehicle density metrics
    csv += '# Vehicle Density Metrics\n';
    csv += 'Road ID,Average Density (veh/km),Max Density (veh/km),Time Above Threshold (%)\n';
    Object.entries(metrics.vehicleDensity).forEach(([roadId, density]) => {
      csv += `${roadId},${density.averageDensity.toFixed(2)},${density.maxDensity.toFixed(2)},${(density.timeAboveThreshold * 100).toFixed(2)}\n`;
    });
    csv += '\n';
    
    // Level of Service metrics
    csv += '# Level of Service Metrics\n';
    csv += 'Segment ID,LOS Grade,Average Delay (s),Quality Score,Description\n';
    Object.entries(metrics.levelOfService).forEach(([segmentId, los]) => {
      csv += `${segmentId},${los.los},${los.averageDelay.toFixed(2)},${los.qualityScore},${los.description}\n`;
    });
    csv += '\n';
    
    // Lane metrics
    csv += '# Lane Performance Metrics\n';
    csv += 'Lane ID,Average Speed,Vehicle Count,Max Vehicle Count,Average Vehicle Count,Congestion Rate,Throughput,Total Vehicles Passed,Average Wait Time,Queue Length\n';
    
    Object.values(metrics.laneMetrics).forEach(lane => {
      csv += `${lane.laneId},${lane.averageSpeed.toFixed(2)},${lane.vehicleCount},${lane.maxVehicleCount},`;
      csv += `${lane.averageVehicleCount.toFixed(2)},${lane.congestionRate.toFixed(2)},${lane.throughput.toFixed(2)},`;
      csv += `${lane.totalVehiclesPassed},${lane.averageWaitTime.toFixed(2)},${lane.queueLength}\n`;
    });
    
    csv += '\n# Intersection Performance Metrics\n';
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
   * Export metrics as JSON format
   */
  public exportMetricsJSON(): string {
    const metrics = this.getMetrics();
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalVehicles: metrics.totalVehicles,
        activeVehicles: metrics.activeVehicles,
        completedTrips: metrics.completedTrips,
        averageSpeed: metrics.averageSpeed,
        averageWaitTime: metrics.averageWaitTime,
        maxWaitTime: metrics.maxWaitTime,
        totalStops: metrics.totalStops,
        stoppedVehicles: metrics.stoppedVehicles,
        globalThroughput: metrics.globalThroughput,
        congestionIndex: metrics.congestionIndex,
        simulationTime: metrics.simulationTime
      },
      enhancedKPIs: {
        averageVehicleDelay: metrics.averageVehicleDelay,
        averageTravelTime: metrics.averageTravelTime,
        averageStopFrequency: metrics.averageStopFrequency,
        totalEmissions: metrics.totalEmissions,
        averageEmissionsPerVehicle: metrics.averageEmissionsPerVehicle,
        queueMetrics: metrics.queueMetrics
      },
      laneMetrics: metrics.laneMetrics,
      intersectionMetrics: metrics.intersectionMetrics,
      intersectionUtilization: metrics.intersectionUtilization,
      intersectionUtilizationRate: metrics.intersectionUtilizationRate,
      roadUtilization: metrics.roadUtilization,
      vehicleDensity: metrics.vehicleDensity,
      levelOfService: metrics.levelOfService,
      rawData: {
        vehicleEvents: this.vehicleMetrics,
        intersectionEvents: this.intersectionMetrics,
        laneEvents: this.laneMetrics,
        vehicleJourneyTimes: this.vehicleJourneyTimes,
        vehicleStopCounts: this.vehicleStopCounts,
        vehicleEmissions: this.vehicleEmissions,
        densityMeasurements: this.densityMeasurements,
        queueLengthHistory: this.queueLengthHistory
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Helper to download metrics as a JSON file
   */
  public downloadMetricsJSON(): void {
    const json = this.exportMetricsJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `traffic-metrics-${new Date().toISOString().slice(0, 10)}.json`);
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
  
  /**
   * Fix: Calculate accurate stopped vehicles count
   * This ensures we don't have phantom stopped vehicles that weren't properly tracked
   */
  private getAccurateStoppedVehiclesCount(): number {
    // Use only active vehicles that are actually in the stopped set
    let count = 0;
    
    // Only count vehicles as stopped if they're active
    this.stoppedVehicles.forEach(id => {
      if (this.activeVehicles.has(id)) {
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Calculate emissions based on vehicle speed, acceleration, and driving behavior
   * Uses a simplified but realistic model based on VSP (Vehicle Specific Power)
   */
  public updateVehicleEmissions(vehicle: Car, time: number, acceleration: number, delta: number): void {
    if (!this.isRecording || !this.vehicleEmissions[vehicle.id]) return;
    
    const speed = vehicle.speed; // m/s
    const mass = 1500; // Assume average car mass of 1500 kg
    
    // Calculate Vehicle Specific Power (VSP) in kW/ton
    // VSP = (v * (a + g * sin(grade) + CR * g) + 0.5 * CdA * rho * v^3) / (1000 * mass)
    // Simplified for flat roads: VSP ≈ (v * a + drag_term) / 1000
    const dragCoeff = 0.0003; // Simplified drag coefficient
    const vsp = (speed * acceleration + dragCoeff * Math.pow(speed, 3)) / 1000;
    
    // Base emission factors (g/s at different driving modes)
    let co2Rate = 0; // kg/s
    let fuelRate = 0; // L/s
    let noxRate = 0; // kg/s
    let pmRate = 0; // kg/s
    
    if (speed < 0.1) {
      // Idling
      co2Rate = 0.0008; // Higher emissions when idling
      fuelRate = 0.0003;
      noxRate = 0.00001;
      pmRate = 0.000005;
    } else if (acceleration > 0.5) {
      // Accelerating
      co2Rate = 0.002 + Math.max(0, vsp * 0.0001);
      fuelRate = 0.0007 + Math.max(0, vsp * 0.00004);
      noxRate = 0.00003;
      pmRate = 0.00001;
    } else if (acceleration < -0.5) {
      // Decelerating (lower emissions due to engine braking)
      co2Rate = 0.0005;
      fuelRate = 0.0002;
      noxRate = 0.00001;
      pmRate = 0.000003;
    } else {
      // Cruising - emissions vary with speed
      const speedFactor = Math.min(2.0, 0.5 + speed / 15); // Optimal around 15 m/s
      co2Rate = 0.001 * speedFactor;
      fuelRate = 0.0004 * speedFactor;
      noxRate = 0.00002 * speedFactor;
      pmRate = 0.000007 * speedFactor;
    }
    
    // Calculate emissions for this time step
    const emissions = this.vehicleEmissions[vehicle.id];
    const co2Increment = co2Rate * delta;
    const fuelIncrement = fuelRate * delta;
    const noxIncrement = noxRate * delta;
    const pmIncrement = pmRate * delta;
    
    // Update vehicle emissions
    emissions.co2Emissions += co2Increment;
    emissions.fuelConsumption += fuelIncrement;
    emissions.noxEmissions += noxIncrement;
    emissions.pmEmissions += pmIncrement;
    emissions.totalEmissions += (co2Increment + noxIncrement * 20 + pmIncrement * 50); // Weighted environmental impact
    
    // Update total emissions
    this.totalEmissions.co2Emissions += co2Increment;
    this.totalEmissions.fuelConsumption += fuelIncrement;
    this.totalEmissions.noxEmissions += noxIncrement;
    this.totalEmissions.pmEmissions += pmIncrement;
    this.totalEmissions.totalEmissions += (co2Increment + noxIncrement * 20 + pmIncrement * 50);
  }
  
  /**
   * Record intersection utilization when vehicles enter/exit
   */
  public recordIntersectionUtilization(intersectionId: string, time: number, hasVehicles: boolean): void {
    if (!this.isRecording) return;
    
    if (!this.intersectionUtilizationTracking[intersectionId]) {
      this.intersectionUtilizationTracking[intersectionId] = {
        activeTime: 0,
        totalTime: 0,
        lastVehicleTime: 0
      };
    }
    
    const tracking = this.intersectionUtilizationTracking[intersectionId];
    
    if (hasVehicles) {
      tracking.lastVehicleTime = time;
    }
    
    // This method should be called regularly to update total time
    tracking.totalTime = time - this.simulationStartTime;
  }
  
  /**
   * Sample vehicle density on roads
   */
  public sampleVehicleDensity(roadId: string, vehicleCount: number, roadLength: number): void {
    if (!this.isRecording || roadLength <= 0) return;
    
    const density = (vehicleCount / roadLength) * 1000; // vehicles per km
    
    if (!this.densityMeasurements[roadId]) {
      this.densityMeasurements[roadId] = [];
    }
    
    this.densityMeasurements[roadId].push(density);
  }
  
  /**
   * Record queue lengths for detailed tracking
   */
  public recordQueueLength(locationId: string, queueLength: number, isIntersection: boolean = false): void {
    if (!this.isRecording) return;
    
    const key = `${isIntersection ? 'intersection' : 'lane'}_${locationId}`;
    
    if (!this.queueLengthHistory[key]) {
      this.queueLengthHistory[key] = [];
    }
    
    this.queueLengthHistory[key].push(queueLength);
  }
  
  /**
   * Calculate Level of Service (LOS) based on HCM standards
   */
  private calculateLevelOfService(averageDelay: number, averageSpeed: number, density: number): LevelOfServiceMetrics {
    let los = 'F';
    let qualityScore = 0;
    let description = '';
    
    // LOS calculation based on average delay (seconds) for urban streets
    if (averageDelay <= 10) {
      los = 'A';
      qualityScore = 95;
      description = 'Free flow conditions with minimal delays';
    } else if (averageDelay <= 20) {
      los = 'B';
      qualityScore = 85;
      description = 'Stable flow with acceptable delays';
    } else if (averageDelay <= 35) {
      los = 'C';
      qualityScore = 75;
      description = 'Stable flow with noticeable delays';
    } else if (averageDelay <= 55) {
      los = 'D';
      qualityScore = 65;
      description = 'Approaching unstable flow with longer delays';
    } else if (averageDelay <= 80) {
      los = 'E';
      qualityScore = 45;
      description = 'Unstable flow with significant delays';
    } else {
      los = 'F';
      qualityScore = 25;
      description = 'Forced flow with excessive delays and congestion';
    }
    
    // Adjust score based on speed and density
    if (averageSpeed < 5) qualityScore -= 10;
    if (density > 50) qualityScore -= 10; // More than 50 vehicles per km
    
    qualityScore = Math.max(0, Math.min(100, qualityScore));
    
    return {
      los,
      averageDelay,
      averageSpeed,
      densityScore: density,
      qualityScore,
      description
    };
  }
  
  /**
   * Calculate average vehicle delay across all vehicles
   */
  private calculateAverageVehicleDelay(): number {
    if (this.delayMeasurements.length === 0) return 0;
    return this.delayMeasurements.reduce((sum, delay) => sum + delay, 0) / this.delayMeasurements.length;
  }
  
  /**
   * Calculate average travel time for completed journeys
   */
  private calculateAverageTravelTime(): number {
    const completedJourneys = Object.values(this.vehicleJourneyTimes).filter(journey => journey.endTime !== undefined);
    if (completedJourneys.length === 0) return 0;
    
    const totalTravelTime = completedJourneys.reduce((sum, journey) => {
      return sum + (journey.endTime! - journey.startTime);
    }, 0);
    
    return totalTravelTime / completedJourneys.length;
  }
  
  /**
   * Calculate average stop frequency per vehicle
   */
  private calculateAverageStopFrequency(): number {
    const stopCounts = Object.values(this.vehicleStopCounts);
    if (stopCounts.length === 0) return 0;
    
    return stopCounts.reduce((sum, count) => sum + count, 0) / stopCounts.length;
  }
  
  /**
   * Calculate average emissions per vehicle
   */
  private calculateAverageEmissionsPerVehicle(): EmissionMetrics {
    const vehicleEmissions = Object.values(this.vehicleEmissions);
    if (vehicleEmissions.length === 0) {
      return { co2Emissions: 0, fuelConsumption: 0, noxEmissions: 0, pmEmissions: 0, totalEmissions: 0 };
    }
    
    const totals = vehicleEmissions.reduce(
      (sum, emissions) => ({
        co2Emissions: sum.co2Emissions + emissions.co2Emissions,
        fuelConsumption: sum.fuelConsumption + emissions.fuelConsumption,
        noxEmissions: sum.noxEmissions + emissions.noxEmissions,
        pmEmissions: sum.pmEmissions + emissions.pmEmissions,
        totalEmissions: sum.totalEmissions + emissions.totalEmissions
      }),
      { co2Emissions: 0, fuelConsumption: 0, noxEmissions: 0, pmEmissions: 0, totalEmissions: 0 }
    );
    
    const count = vehicleEmissions.length;
    return {
      co2Emissions: totals.co2Emissions / count,
      fuelConsumption: totals.fuelConsumption / count,
      noxEmissions: totals.noxEmissions / count,
      pmEmissions: totals.pmEmissions / count,
      totalEmissions: totals.totalEmissions / count
    };
  }
  
  /**
   * Calculate intersection utilization rates
   */
  private calculateIntersectionUtilizationRates(currentTime: number): { [intersectionId: string]: UtilizationMetrics } {
    const results: { [intersectionId: string]: UtilizationMetrics } = {};
    
    for (const [intersectionId, tracking] of Object.entries(this.intersectionUtilizationTracking)) {
      const totalTime = currentTime - this.simulationStartTime;
      const activeTime = Math.min(tracking.activeTime, totalTime);
      const utilizationRate = totalTime > 0 ? (activeTime / totalTime) * 100 : 0;
      
      results[intersectionId] = {
        activeTime,
        totalTime,
        utilizationRate,
        idleTime: totalTime - activeTime,
        peakUtilization: utilizationRate // Simplified - could track peak over time
      };
    }
    
    return results;
  }
  
  /**
   * Calculate vehicle density metrics for all roads
   */
  private calculateVehicleDensityMetrics(): { [roadId: string]: DensityMetrics } {
    const results: { [roadId: string]: DensityMetrics } = {};
    
    for (const [roadId, densities] of Object.entries(this.densityMeasurements)) {
      if (densities.length === 0) continue;
      
      const averageDensity = densities.reduce((sum, d) => sum + d, 0) / densities.length;
      const maxDensity = Math.max(...densities);
      const variance = densities.reduce((sum, d) => sum + Math.pow(d - averageDensity, 2), 0) / densities.length;
      const congestionThreshold = 25; // vehicles per km
      const timeAboveThreshold = densities.filter(d => d > congestionThreshold).length / densities.length;
      
      results[roadId] = {
        averageDensity,
        maxDensity,
        densityVariance: variance,
        congestionThreshold,
        timeAboveThreshold
      };
    }
    
    return results;
  }
  
  /**
   * Calculate Level of Service metrics for all segments
   */
  private calculateLevelOfServiceMetrics(): { [segmentId: string]: LevelOfServiceMetrics } {
    const results: { [segmentId: string]: LevelOfServiceMetrics } = {};
    
    // Calculate LOS for lanes
    for (const [laneId, waitTimes] of Object.entries(this.laneWaitTimes)) {
      if (waitTimes.length === 0) continue;
      
      const avgDelay = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
      const avgSpeed = this.laneTotalSpeeds[laneId] 
        ? this.laneTotalSpeeds[laneId].total / this.laneTotalSpeeds[laneId].count 
        : 0;
      const density = this.densityMeasurements[laneId] 
        ? this.densityMeasurements[laneId].reduce((sum, d) => sum + d, 0) / this.densityMeasurements[laneId].length
        : 0;
      
      results[`lane_${laneId}`] = this.calculateLevelOfService(avgDelay, avgSpeed, density);
    }
    
    // Calculate LOS for intersections
    for (const [intersectionId, waitTimes] of Object.entries(this.intersectionWaitTimes)) {
      if (waitTimes.length === 0) continue;
      
      const avgDelay = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
      const queueHistory = this.intersectionQueueHistory[intersectionId] || [];
      const avgQueue = queueHistory.length > 0 
        ? queueHistory.reduce((sum, q) => sum + q, 0) / queueHistory.length 
        : 0;
      
      results[`intersection_${intersectionId}`] = this.calculateLevelOfService(avgDelay, 0, avgQueue);
    }
    
    return results;
  }
  
  /**
   * Calculate comprehensive queue metrics
   */
  private calculateQueueMetrics(): QueueMetrics {
    const allQueueLengths: number[] = [];
    const queuesByIntersection: { [intersectionId: string]: QueueLocationMetrics } = {};
    const queuesByLane: { [laneId: string]: QueueLocationMetrics } = {};
    
    // Process intersection queues
    for (const [intersectionId, queueHistory] of Object.entries(this.intersectionQueueHistory)) {
      allQueueLengths.push(...queueHistory);
      
      queuesByIntersection[intersectionId] = {
        maxQueueLength: queueHistory.length > 0 ? Math.max(...queueHistory) : 0,
        averageQueueLength: queueHistory.length > 0 ? queueHistory.reduce((sum, q) => sum + q, 0) / queueHistory.length : 0,
        totalQueueTime: queueHistory.reduce((sum, q) => sum + q, 0),
        queueFormationEvents: queueHistory.filter((q, i) => i > 0 && queueHistory[i-1] === 0 && q > 0).length,
        queueDissipationEvents: queueHistory.filter((q, i) => i > 0 && queueHistory[i-1] > 0 && q === 0).length
      };
    }
    
    // Process lane queues from history
    for (const [key, queueHistory] of Object.entries(this.queueLengthHistory)) {
      if (key.startsWith('lane_')) {
        const laneId = key.substring(5);
        allQueueLengths.push(...queueHistory);
        
        queuesByLane[laneId] = {
          maxQueueLength: queueHistory.length > 0 ? Math.max(...queueHistory) : 0,
          averageQueueLength: queueHistory.length > 0 ? queueHistory.reduce((sum, q) => sum + q, 0) / queueHistory.length : 0,
          totalQueueTime: queueHistory.reduce((sum, q) => sum + q, 0),
          queueFormationEvents: queueHistory.filter((q, i) => i > 0 && queueHistory[i-1] === 0 && q > 0).length,
          queueDissipationEvents: queueHistory.filter((q, i) => i > 0 && queueHistory[i-1] > 0 && q === 0).length
        };
      }
    }
    
    return {
      globalMaxQueueLength: allQueueLengths.length > 0 ? Math.max(...allQueueLengths) : 0,
      globalAverageQueueLength: allQueueLengths.length > 0 ? allQueueLengths.reduce((sum, q) => sum + q, 0) / allQueueLengths.length : 0,
      totalQueueTime: allQueueLengths.reduce((sum, q) => sum + q, 0),
      averageQueueTime: allQueueLengths.length > 0 ? allQueueLengths.reduce((sum, q) => sum + q, 0) / allQueueLengths.length : 0,
      queuesByIntersection,
      queuesByLane
    };
  }
}

// Export a singleton instance for application-wide use
export const kpiCollector = new KPICollector();
