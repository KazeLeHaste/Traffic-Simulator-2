import '../helpers';
import _ = require('underscore');
import Car = require('./car');
import Intersection = require('./intersection');
import Road = require('./road');
import Pool = require('./pool');
import Rect = require('../geom/rect');
import settings = require('../settings');

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

  get instantSpeed(): number {
    if (!this.cars) return 0;
    const carsArray = Object.values(this.cars.all() || {});
    const speeds = _.map(carsArray, (car) => car.speed);
    if (speeds.length === 0) {
      return 0;
    }
    return _.reduce(speeds, (a, b) => a + b, 0) / speeds.length;
  }

  set(obj?: any): void {
    console.log('🌍 [WORLD DEBUG] set() called with obj:', obj);
    
    obj = obj || {};
    console.log('🌍 [WORLD DEBUG] Creating new pools...');
    
    this.intersections = new Pool(Intersection, obj.intersections);
    console.log('🌍 [WORLD DEBUG] Intersections pool created:', Object.keys(this.intersections.all()).length);
    
    this.roads = new Pool(Road, obj.roads);
    console.log('🌍 [WORLD DEBUG] Roads pool created:', Object.keys(this.roads.all()).length);
    
    this.cars = new Pool(Car, obj.cars);
    console.log('🌍 [WORLD DEBUG] Cars pool created:', Object.keys(this.cars.all()).length);
    
    this.carsNumber = 0;
    this.time = 0;
    console.log('🌍 [WORLD DEBUG] set() completed');
  }

  save(): void {
    const data = _.extend({}, this);
    delete (data as any).cars;
    localStorage.world = JSON.stringify(data);
  }

  load(data?: string): void {
    console.log('🌍 [WORLD DEBUG] load() called');
    console.log('🌍 [WORLD DEBUG] Data provided:', !!data);
    
    data = data || localStorage.world;
    console.log('🌍 [WORLD DEBUG] Using data source:', data ? 'provided/localStorage' : 'none');
    
    const parsedData = data && JSON.parse(data);
    console.log('🌍 [WORLD DEBUG] Parsed data:', parsedData);
    
    if (!parsedData) {
      console.log('🌍 [WORLD DEBUG] No data to load, returning early');
      return;
    }
    
    console.log('🌍 [WORLD DEBUG] Calling clear() before loading...');
    this.clear();
    console.log('🌍 [WORLD DEBUG] clear() completed, now loading data...');
    
    this.carsNumber = parsedData.carsNumber || 0;
    console.log('🌍 [WORLD DEBUG] Set carsNumber to:', this.carsNumber);
    
    let intersectionCount = 0;
    for (const id in parsedData.intersections) {
      const intersection = parsedData.intersections[id];
      console.log('🌍 [WORLD DEBUG] Loading intersection:', id, intersection);
      this.addIntersection(Intersection.copy(intersection));
      intersectionCount++;
    }
    console.log('🌍 [WORLD DEBUG] Loaded', intersectionCount, 'intersections');
    
    let roadCount = 0;
    for (const id in parsedData.roads) {
      const road = parsedData.roads[id];
      const roadCopy = Road.copy(road);
      roadCopy.source = this.getIntersection(road.source);
      roadCopy.target = this.getIntersection(road.target);
      this.addRoad(roadCopy);
    }
  }



  clear(): void {
    console.log('🌍 [WORLD DEBUG] clear() called');
    try {
      console.log('🌍 [WORLD DEBUG] Current state before clear:', {
        intersections: Object.keys(this.intersections?.all() || {}).length,
        roads: Object.keys(this.roads?.all() || {}).length,
        cars: Object.keys(this.cars?.all() || {}).length,
        carsNumber: this.carsNumber
      });
      
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
      
      console.log('🌍 [WORLD DEBUG] State after clear:', {
        intersections: Object.keys(this.intersections?.all() || {}).length,
        roads: Object.keys(this.roads?.all() || {}).length,
        cars: Object.keys(this.cars?.all() || {}).length,
        carsNumber: this.carsNumber
      });
      
      console.log('🌍 [WORLD DEBUG] clear() completed');
    } catch (error) {
      console.error('🌍 [WORLD ERROR] Failed to clear world:', error);
      
      // Recovery: force recreation of pools
      console.log('🌍 [WORLD DEBUG] Attempting recovery by recreating pools...');
      this.intersections = new Pool(Intersection);
      this.roads = new Pool(Road);
      this.cars = new Pool(Car);
      this.carsNumber = 0;
      this.time = 0;
      console.log('🌍 [WORLD DEBUG] Recovery completed');
    }
  }

  onTick = (delta: number): void => {
    console.log('🌎 [WORLD DEBUG] onTick called with delta:', delta);
    
    if (delta > 1) {
      console.error('🌎 [WORLD ERROR] Delta too large:', delta);
      delta = 1; // Cap instead of throwing
    }
    
    this.time += delta;
    
    // Refresh cars if needed (add/remove to match target count)
    const carsBefore = Object.keys(this.cars?.all() || {}).length;
    console.log('🌎 [WORLD DEBUG] Cars before refresh:', carsBefore);
    
    try {
      this.refreshCars();
    } catch (refreshError) {
      console.error('🌎 [WORLD ERROR] Error refreshing cars:', refreshError);
    }
    
    const carsAfterRefresh = Object.keys(this.cars?.all() || {}).length;
    console.log('🌎 [WORLD DEBUG] Cars after refresh:', carsAfterRefresh);
    
    // Update intersection control signals with safety checks
    let intersectionCount = 0;
    try {
      for (const id in this.intersections.all()) {
        const intersection = this.intersections.all()[id];
        if (intersection && intersection.controlSignals && typeof intersection.controlSignals.onTick === 'function') {
          intersection.controlSignals.onTick(delta);
          intersectionCount++;
        }
      }
    } catch (intersectionError) {
      console.error('🌎 [WORLD ERROR] Error updating intersections:', intersectionError);
    }
    console.log('🌎 [WORLD DEBUG] Updated', intersectionCount, 'intersections');
    
    // Update cars with safety checks
    let carsMoved = 0;
    let carsRemoved = 0;
    try {
      for (const id in this.cars.all()) {
        const car = this.cars.all()[id];
        if (car && typeof car.move === 'function') {
          try {
            car.move(delta);
            carsMoved++;
            
            if (!car.alive) {
              this.removeCar(car);
              carsRemoved++;
            }
          } catch (carMoveError) {
            console.error('🌎 [WORLD ERROR] Error moving car', id, ':', carMoveError);
          }
        }
      }
    } catch (carsError) {
      console.error('🌎 [WORLD ERROR] Error updating cars:', carsError);
    }
    
    console.log('🌎 [WORLD DEBUG] Moved', carsMoved, 'cars, removed', carsRemoved, 'cars');
    console.log('🌎 [WORLD DEBUG] onTick completed');
  }

  refreshCars(): void {
    try {
      // Safety check for cars pool
      if (!this.cars || !this.cars.all) {
        console.error('🌎 [WORLD ERROR] Cars pool is invalid in refreshCars');
        return;
      }
      
      // Get current count of cars
      const currentCarCount = Object.keys(this.cars.all()).length;
      
      // For better performance, do full refresh if there's a big difference or after reset
      const shouldDoFullRefresh = Math.abs(currentCarCount - this.carsNumber) > 20 || currentCarCount === 0;
      
      // Full refresh - clear and add all at once when starting fresh
      if (shouldDoFullRefresh && this.carsNumber > 0) {
        // Clear existing cars
        this.cars.clear();
        
        // Add all new cars with slight delay between batches to prevent freezing
        const batchSize = 10; // Process in batches of 10 for better performance
        for (let i = 0; i < this.carsNumber; i += batchSize) {
          const count = Math.min(batchSize, this.carsNumber - i);
          for (let j = 0; j < count; j++) {
            try {
              this.addRandomCar();
            } catch (addError) {
              // Silently catch error to avoid excessive logging
            }
          }
        }
        return;
      }
      
      // Gradual refresh - add or remove cars gradually
      
      // Add cars if we have too few
      if (currentCarCount < this.carsNumber) {
        // Add cars gradually to avoid sudden performance impact
        const carsToAdd = Math.min(5, this.carsNumber - currentCarCount);
        
        for (let i = 0; i < carsToAdd; i++) {
          try {
            this.addRandomCar();
          } catch (addError) {
            // Silently catch error to avoid excessive logging
          }
        }
      }
      
      // Remove cars if we have too many
      if (currentCarCount > this.carsNumber) {
        const carsToRemove = Math.min(3, currentCarCount - this.carsNumber);
        
        for (let i = 0; i < carsToRemove; i++) {
          try {
            this.removeRandomCar();
          } catch (removeError) {
            // Silently catch error to avoid excessive logging
          }
        }
      }
    } catch (error) {
      console.error('🌎 [WORLD ERROR] Error in refreshCars:', error);
    }
  }

  addRoad(road: Road): void {
    this.roads.put(road);
    road.source.roads.push(road);
    road.target.inRoads.push(road);
    road.update();
  }

  getRoad(id: string): Road {
    return this.roads.get(id);
  }

  addCar(car: Car): void {
    this.cars.put(car);
  }

  getCar(id: string): Car {
    return this.cars.get(id);
  }

  removeCar(car: Car): void {
    this.cars.pop(car);
  }

  addIntersection(intersection: Intersection): void {
    this.intersections.put(intersection);
  }

  getIntersection(id: string): Intersection {
    return this.intersections.get(id);
  }

  addRandomCar(): void {
    try {
      // Get all roads in the world
      const roadsAll = this.roads.all();
      if (!roadsAll || Object.keys(roadsAll).length === 0) {
        console.warn('🌎 [WORLD WARN] No roads available to add car');
        return;
      }
      
      const roadsArray = Object.values(roadsAll);
      
      // Try multiple times to find a suitable road
      let road = null;
      let lane = null;
      let attempts = 0;
      
      while (!lane && attempts < 5) {
        attempts++;
        
        // Get a random road
        road = _.sample(roadsArray);
        if (!road) {
          console.warn('🌎 [WORLD WARN] Failed to get random road');
          continue;
        }
        
        // Check if road has lanes
        if (!road.lanes || road.lanes.length === 0) {
          console.warn('🌎 [WORLD WARN] Road has no lanes:', road.id);
          continue;
        }
        
        // Get a random lane - prefer lanes with fewer cars
        let bestLane = null;
        let fewestCars = Infinity;
        
        for (const currentLane of road.lanes) {
          if (currentLane && currentLane.carsPositions) {
            const carCount = Object.keys(currentLane.carsPositions).length;
            if (carCount < fewestCars) {
              fewestCars = carCount;
              bestLane = currentLane;
            }
          }
        }
        
        // If we found a lane with a reasonable number of cars, use it
        if (bestLane && fewestCars < 5) {
          lane = bestLane;
        } else {
          // Otherwise just pick a random lane
          lane = _.sample(road.lanes);
        }
        
        if (!lane) {
          console.warn('🌎 [WORLD WARN] Failed to get random lane from road:', road.id);
          continue;
        }
      }
      
      // If we found a valid lane, create car
      if (lane) {
        // Choose a good position to add the car
        // Try to position it with some gap to any car ahead
        let position = 0;
        let foundSafePosition = false;
        
        // Check if there are other cars in this lane
        if (lane.carsPositions && Object.keys(lane.carsPositions).length > 0) {
          // Try a few different positions
          for (let pos of [0, lane.length * 0.1, lane.length * 0.2]) {
            let isSafe = true;
            // Check minimum distance to any other car
            for (const id in lane.carsPositions) {
              const otherPos = lane.carsPositions[id].position;
              if (Math.abs(otherPos - pos) < 10) { // Minimum safe distance
                isSafe = false;
                break;
              }
            }
            if (isSafe) {
              position = pos;
              foundSafePosition = true;
              break;
            }
          }
          
          // If we couldn't find a safe position, try another lane
          if (!foundSafePosition) {
            console.log('🌎 [WORLD INFO] Lane too congested, trying another lane');
            this.addRandomCar(); // Try again with a different lane
            return;
          }
        }
        
        console.log(`🌎 [WORLD INFO] Creating new car at position ${position.toFixed(2)}`);
        
        // Create car with computed position
        const car = new Car(lane, position);
        
        // Set initial speed to something reasonable but non-zero
        // to ensure cars start moving immediately
        car.speed = 5 + Math.random() * 10; // Random speed between 5-15
        
        // Add car to the world
        console.log('🌎 [WORLD DEBUG] Adding car to world:', car.id);
        this.addCar(car);
      } else {
        console.error('🌎 [WORLD ERROR] Failed to find valid lane for new car after', attempts, 'attempts');
      }
    } catch (error) {
      console.error('🌎 [WORLD ERROR] Error in addRandomCar:', error);
    }
  }

  removeRandomCar(): void {
    const carsAll = this.cars.all();
    const carsArray = Object.values(carsAll);
    const car = _.sample(carsArray);
    if (car) {
      this.removeCar(car);
    }
  }
}

export = World;
