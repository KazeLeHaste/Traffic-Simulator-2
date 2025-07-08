import '../helpers';
import _ = require('underscore');
import Car = require('./car');
import Intersection = require('./intersection');
import Road = require('./road');
import Pool = require('./pool');
import Rect = require('../geom/rect');
import settings = require('../settings');
import { kpiCollector } from './kpi-collector';

const { random } = Math;

class World {
  public intersections: Pool<Intersection>;
  public roads: Pool<Road>;
  public cars: Pool<Car>;
  public carsNumber: number;
  public time: number;

  constructor() {
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
  }

  // Save current world state to localStorage (excluding cars)
  save(): void {
    const data = _.extend({}, this);
    delete (data as any).cars;
    localStorage.world = JSON.stringify(data);
  }

  // Load world from provided data or localStorage
  load(data?: string): void {
    data = data || localStorage.world;
    
    const parsedData = data && JSON.parse(data);
    
    if (!parsedData) {
      return;
    }
    
    this.clear();
    
    this.carsNumber = parsedData.carsNumber || 0;
    
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
      if (intersection && intersection.controlSignals) {
        intersection.controlSignals.onTick(delta);
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
}

export = World;
