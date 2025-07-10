import '../helpers';
import _ = require('underscore');
import Car = require('./car');
import Intersection = require('./intersection');
import Road = require('./road');
import Pool = require('./pool');
import Rect = require('../geom/rect');
import settings = require('../settings');
import { kpiCollector } from './kpi-collector';
import { trafficControlStrategyManager } from './traffic-control/TrafficControlStrategyManager';

const { random } = Math;

/**
 * Represents a complete traffic simulation world
 */
class World {
  public intersections: Pool<Intersection>;
  public roads: Pool<Road>;
  public cars: Pool<Car>;
  public carsNumber: number;
  public time: number;
  public activeTrafficControlStrategy: string;
  public customSettings: { [key: string]: any };

  constructor() {
    this.customSettings = {};
    this.set({});
  }

  // Calculate the average speed of all cars
  get instantSpeed(): number {
    if (!this.cars) return 0;
    const carsArray = Object.values(this.cars.all() || {});
    const speeds = _.map(carsArray, (car) => car.speed);
    if (speeds.length === 0) {
      return 0;
    }
    return _.reduce(speeds, (a, b) => a + b, 0) / speeds.length;
  }

  // Initialize the world with provided data or as empty
  set(obj?: any): void {
    obj = obj || {};
    
    this.intersections = new Pool(Intersection, obj.intersections);
    this.roads = new Pool(Road, obj.roads);
    this.cars = new Pool(Car, obj.cars);
    this.carsNumber = 0;
    this.time = 0;
    this.activeTrafficControlStrategy = obj.activeTrafficControlStrategy || 'fixed-timing';
    this.customSettings = obj.customSettings || {};
  }

  // Save current world state to localStorage (excluding cars)
  save(): void {
    const data = _.extend({}, this);
    delete (data as any).cars;
    localStorage.world = JSON.stringify(data);
  }

  // Load world from provided data or localStorage
  load(data?: string, preserveCarsNumber?: boolean): void {
    data = data || localStorage.world;
    
    const parsedData = data && JSON.parse(data);
    
    if (!parsedData) {
      return;
    }
    
    // Store original car count if we need to preserve it
    const originalCarsNumber = preserveCarsNumber ? this.carsNumber : undefined;
    
    this.clear();
    
    // Use preserved car number or from parsed data
    this.carsNumber = originalCarsNumber !== undefined ? originalCarsNumber : (parsedData.carsNumber || 0);
    this.activeTrafficControlStrategy = parsedData.activeTrafficControlStrategy || 'fixed-timing';
    this.customSettings = parsedData.customSettings || {};
    
    // Load intersections
    for (const id in parsedData.intersections) {
      const intersection = parsedData.intersections[id];
      this.addIntersection(Intersection.copy(intersection));
    }
    
    // Load roads and connect them to intersections
    for (const id in parsedData.roads) {
      const road = parsedData.roads[id];
      const roadCopy = Road.copy(road);
      roadCopy.source = this.getIntersection(road.source);
      roadCopy.target = this.getIntersection(road.target);
      this.addRoad(roadCopy);
    }
    
    // Apply traffic control strategy if specified
    if (this.activeTrafficControlStrategy) {
      this.applyTrafficControlStrategy(this.activeTrafficControlStrategy);
    }
  }

  // Save as a complete scenario for reproducible benchmarks
  saveAsScenario(): any {
    const scenarioData = {
      // Base world state (without cars)
      worldState: {
        intersections: this.intersections,
        roads: this.roads,
        carsNumber: this.carsNumber,
        activeTrafficControlStrategy: this.activeTrafficControlStrategy,
        customSettings: this.customSettings
      },
      // Additional simulation parameters
      simulationParams: {
        timeFactor: settings.defaultTimeFactor
      },
      // Traffic control configuration
      trafficControlParams: trafficControlStrategyManager.getStrategySettings(this.activeTrafficControlStrategy),
      // Random seed for reproducibility (not implemented yet, but placeholder)
      randomSeed: null,
      // Metadata
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return scenarioData;
  }

  // Load a complete scenario
  loadScenario(scenarioData: any): void {
    console.log('World.loadScenario called with data:', scenarioData);
    
    // Check if we have valid scenario data
    if (!scenarioData) {
      console.error('Scenario data is null or undefined');
      throw new Error('Invalid scenario data: null or undefined');
    }
    
    // Handle different data formats - direct world state vs. wrapped scenario data
    let worldState: any;
    
    if (scenarioData.worldState) {
      console.log('Using wrapped scenario data format');
      worldState = scenarioData.worldState;
      
      // Update simulation parameters if available
      if (scenarioData.simulationParams) {
        console.log('Applying simulation parameters:', scenarioData.simulationParams);
        settings.defaultTimeFactor = scenarioData.simulationParams.timeFactor || settings.defaultTimeFactor;
      }
      
      // Apply traffic control parameters if available
      if (scenarioData.trafficControlParams) {
        console.log('Traffic control parameters will be applied after world setup');
      }
    } else {
      console.log('Using direct world state format - legacy or simplified scenario');
      worldState = scenarioData;
    }
    
    // Validate world state
    if (!worldState.intersections || !worldState.roads) {
      console.error('Invalid world state data - missing required properties', worldState);
      throw new Error('Invalid scenario data: missing required properties');
    }
    
    // Clear current state
    console.log('Clearing current world state');
    this.clear();
    
    // Load world state
    console.log('Loading world state:', worldState);
    this.carsNumber = worldState.carsNumber || 0;
    this.activeTrafficControlStrategy = worldState.activeTrafficControlStrategy || 'fixed-timing';
    this.customSettings = worldState.customSettings || {};
    
    // Load intersections
    console.log('Loading intersections...');
    for (const id in worldState.intersections) {
      console.log(`Loading intersection: ${id}`);
      const intersection = worldState.intersections[id];
      try {
        this.addIntersection(Intersection.copy(intersection));
      } catch (error) {
        console.error(`Failed to load intersection ${id}:`, error);
        throw new Error(`Failed to load intersection ${id}: ${error.message}`);
      }
    }
    console.log('All intersections loaded successfully');
    
    // Load roads and connect them to intersections
    console.log('Loading roads...');
    for (const id in worldState.roads) {
      console.log(`Loading road: ${id}`);
      try {
        const road = worldState.roads[id];
        const roadCopy = Road.copy(road);
        
        // Get source and target intersections
        const sourceIntersection = this.getIntersection(road.source);
        const targetIntersection = this.getIntersection(road.target);
        
        if (!sourceIntersection) {
          throw new Error(`Source intersection ${road.source} not found`);
        }
        
        if (!targetIntersection) {
          throw new Error(`Target intersection ${road.target} not found`);
        }
        
        roadCopy.source = sourceIntersection;
        roadCopy.target = targetIntersection;
        this.addRoad(roadCopy);
      } catch (error) {
        console.error(`Failed to load road ${id}:`, error);
        throw new Error(`Failed to load road ${id}: ${error.message}`);
      }
    }
    console.log('All roads loaded successfully');
    
    // Apply traffic control configuration
    console.log('Applying traffic control settings...');
    
    try {
      // Apply traffic control strategy
      console.log(`Applying traffic control strategy: ${this.activeTrafficControlStrategy}`);
      this.applyTrafficControlStrategy(this.activeTrafficControlStrategy);
      
      // Apply traffic control parameters if available (only for wrapped scenario format)
      if (scenarioData.trafficControlParams) {
        console.log('Applying traffic control parameters:', scenarioData.trafficControlParams);
        trafficControlStrategyManager.applyStrategySettings(
          this.activeTrafficControlStrategy, 
          scenarioData.trafficControlParams
        );
      }
      
      console.log('Traffic control strategy applied successfully');
    } catch (error) {
      console.error('Error applying traffic control strategy:', error);
      // Continue anyway - don't throw, this is not critical
    }
  }

  // Apply a traffic control strategy to all intersections
  applyTrafficControlStrategy(strategyName: string): void {
    if (!strategyName) return;
    
    // Store the active strategy
    this.activeTrafficControlStrategy = strategyName;
    
    // Update all intersections
    for (const id in this.intersections.all()) {
      const intersection = this.intersections.all()[id];
      if (intersection && intersection.setTrafficControlStrategy) {
        // We need to pass the strategy name as a string
        if (strategyName === null || strategyName === undefined) {
          // Handle null or undefined case
          intersection.setTrafficControlStrategy('DefaultStrategy');
        } else if (typeof strategyName === 'object') {
          console.error('Expected strategy name string but received an object', strategyName);
          // Try to get the strategy name if possible, using non-null assertion since we know it's an object here
          const strategyNameStr = strategyName!.constructor?.name || 'UnknownStrategy';
          intersection.setTrafficControlStrategy(strategyNameStr);
        } else {
          // Pass the strategy name as is (should be string at this point)
          intersection.setTrafficControlStrategy(strategyName);
        }
      }
    }
  }

  // Clear all entities from the world
  clear(): void {
    // First explicitly clear each pool to ensure complete cleanup
    if (this.intersections && typeof this.intersections.clear === 'function') {
      this.intersections.clear();
    }
    
    if (this.roads && typeof this.roads.clear === 'function') {
      this.roads.clear();
    }
    
    if (this.cars && typeof this.cars.clear === 'function') {
      this.cars.clear();
    }
    
    // Reset car count
    this.carsNumber = 0;
    
    // Then do a full reset with set({})
    this.set({});
  }

  // Main update function called every frame (directly from reference)
  // Main simulation tick method - exactly from reference implementation
  onTick = (delta: number): void => {
    // Safety check - cap delta to 1.0 to prevent simulation issues (directly from reference)
    if (delta > 1) {
      throw new Error('delta > 1');
    }
    
    // Update simulation time
    this.time += delta;
    
    // Update static world time in Car class for KPI reporting
    Car.updateWorldTime(this.time);
    
    // Refresh cars to match the target count (exactly one addition/removal per tick)
    this.refreshCars();
    
    // Update all intersection traffic signals
    for (const id in this.intersections.all()) {
      const intersection = this.intersections.all()[id];
      if (intersection) {
        // Use the new method to handle both new and legacy traffic control
        intersection.onTick(delta);
      }
    }
    
    // Update all cars (movement, decision making) and remove dead cars
    for (const id in this.cars.all()) {
      const car = this.cars.all()[id];
      if (car) {
        car.move(delta);
        // Remove car if it's no longer alive
        if (!car.alive) {
          this.removeCar(car);
        }
      }
    }
    
    // Sample car speeds for KPI collection
    kpiCollector.sampleSpeeds(this.cars.all(), this.time);
    
    // Periodically sample lane states for KPI collection (every ~1 simulation second)
    if (Math.floor(this.time) > Math.floor(this.time - delta)) {
      this.sampleLaneStates();
    }
  }

  // Sample all lane states for KPI collection
  private sampleLaneStates(): void {
    // Sample each lane's state
    for (const roadId in this.roads.all()) {
      const road = this.roads.all()[roadId];
      if (road && road.lanes) {
        for (const lane of road.lanes) {
          kpiCollector.sampleLaneState(lane, this.time);
        }
        
        // Sample vehicle density for this road
        const vehicleCount = Object.values(this.cars.all()).filter(car => {
          return car.trajectory && car.trajectory.current && car.trajectory.current.lane && 
                 car.trajectory.current.lane.road && car.trajectory.current.lane.road.id === roadId;
        }).length;
        
        if (road.length) {
          kpiCollector.sampleVehicleDensity(roadId, vehicleCount, road.length);
        }
      }
    }
    
    // Sample intersection utilization
    for (const intersectionId in this.intersections.all()) {
      const intersection = this.intersections.all()[intersectionId];
      if (intersection) {
        // Count vehicles currently in or approaching this intersection
        const vehiclesAtIntersection = Object.values(this.cars.all()).filter(car => {
          // Check if car is near this intersection (simplified check)
          return car.trajectory && car.trajectory.nextIntersection && 
                 car.trajectory.nextIntersection.id === intersectionId &&
                 car.trajectory.distanceToStopLine < 50; // Within 50 meters
        }).length;
        
        kpiCollector.recordIntersectionUtilization(intersectionId, this.time, vehiclesAtIntersection > 0);
        
        // Record current queue length at intersection
        kpiCollector.recordQueueLength(intersectionId, vehiclesAtIntersection, true);
      }
    }
  }

  // Add or remove ONE car per tick to match target count (exactly from reference)
  refreshCars(): void {
    if (Object.keys(this.cars.all()).length < this.carsNumber) {
      this.addRandomCar();
    }
    if (Object.keys(this.cars.all()).length > this.carsNumber) {
      this.removeRandomCar();
    }
  }

  // Force immediate refresh of all cars to match target count
  // This is used when we want to immediately update the car count
  // rather than waiting for the gradual tick-by-tick update
  forceRefreshCars(): void {
    // Get current car count
    const currentCount = Object.keys(this.cars.all()).length;
    const targetCount = this.carsNumber;
    const difference = targetCount - currentCount;
    
    console.log(`🚗 Force refreshing cars: current=${currentCount}, target=${targetCount}, diff=${difference}`);
    
    // Add or remove cars as needed
    if (difference > 0) {
      // Add cars
      for (let i = 0; i < difference; i++) {
        this.addRandomCar();
      }
    } else if (difference < 0) {
      // Remove cars
      for (let i = 0; i < Math.abs(difference); i++) {
        this.removeRandomCar();
      }
    }
    
    console.log(`🚗 Cars after force refresh: ${Object.keys(this.cars.all()).length}`);
  }

  // Add a road to the world and update its connections
  addRoad(road: Road): void {
    this.roads.put(road);
    road.source.roads.push(road);
    road.target.inRoads.push(road);
    road.update();
  }

  // Get a road by ID
  getRoad(id: string): Road {
    return this.roads.get(id);
  }

  // Add a car to the world
  addCar(car: Car): void {
    this.cars.put(car);
  }

  // Get a car by ID
  getCar(id: string): Car {
    return this.cars.get(id);
  }

  // Remove a car from the world
  removeCar(car: Car): void {
    car.release();
    this.cars.pop(car);
  }

  // Add an intersection to the world
  addIntersection(intersection: Intersection): void {
    this.intersections.put(intersection);
  }

  // Get an intersection by ID
  getIntersection(id: string): Intersection {
    return this.intersections.get(id);
  }

  // Add a car at a random position on a random road (exactly from reference)
  addRandomCar(): void {
    const road = _.sample(Object.values(this.roads.all() || {}));
    if (road && road.lanes && road.lanes.length > 0) {
      const lane = _.sample(road.lanes);
      if (lane) {
        this.addCar(new Car(lane, 0));
      }
    }
  }

  // Remove a random car from the world (exactly from reference)
  removeRandomCar(): void {
    const car = _.sample(Object.values(this.cars.all() || {}));
    if (car) {
      this.removeCar(car);
    }
  }

  // Generate a new map with grid-based intersections and connecting roads (exactly from reference)
  generateMap(minX: number = -2, maxX: number = 2, minY: number = -2, maxY: number = 2): void {
    this.clear();
    
    const intersectionsNumber = Math.floor(0.8 * (maxX - minX + 1) * (maxY - minY + 1));
    const map: {[key: string]: Intersection} = {};
    const gridSize = settings.gridSize;
    const step = 5 * gridSize;
    
    this.carsNumber = 100;
    
    // Create intersections
    let remaining = intersectionsNumber;
    while (remaining > 0) {
      const x = _.random(minX, maxX);
      const y = _.random(minY, maxY);
      
      if (!map[`${x},${y}`]) {
        const rect = new Rect(step * x, step * y, gridSize, gridSize);
        const intersection = new Intersection(rect);
        this.addIntersection(intersection);
        map[`${x},${y}`] = intersection;
        remaining--;
      }
    }
    
    // Connect intersections horizontally
    for (let x = minX; x <= maxX; x++) {
      let previous: Intersection | null = null;
      for (let y = minY; y <= maxY; y++) {
        const intersection = map[`${x},${y}`];
        if (intersection) {
          if (previous && random() < 0.9) {
            this.addRoad(new Road(intersection, previous));
            this.addRoad(new Road(previous, intersection));
          }
          previous = intersection;
        }
      }
    }
    
    // Connect intersections vertically
    for (let y = minY; y <= maxY; y++) {
      let previous: Intersection | null = null;
      for (let x = minX; x <= maxX; x++) {
        const intersection = map[`${x},${y}`];
        if (intersection) {
          if (previous && random() < 0.9) {
            this.addRoad(new Road(intersection, previous));
            this.addRoad(new Road(previous, intersection));
          }
          previous = intersection;
        }
      }
    }
  }

  // Get KPI metrics for the current simulation state
  getKPIMetrics(): any {
    return kpiCollector.getMetrics(this.time);
  }

  // Export KPI metrics as CSV
  exportKPIMetricsCSV(): string {
    return kpiCollector.exportMetricsCSV();
  }

  // Validate KPI metrics and return HTML report
  validateKPIMetrics(): string {
    return kpiCollector.validateMetrics();
  }
}

export = World;
