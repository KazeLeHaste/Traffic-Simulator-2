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
    const carsArray = Object.values(this.cars.all());
    const speeds = _.map(carsArray, (car) => car.speed);
    if (speeds.length === 0) {
      return 0;
    }
    return _.reduce(speeds, (a, b) => a + b, 0) / speeds.length;
  }

  set(obj?: any): void {
    obj = obj || {};
    this.intersections = new Pool(Intersection, obj.intersections);
    this.roads = new Pool(Road, obj.roads);
    this.cars = new Pool(Car, obj.cars);
    this.carsNumber = 0;
    this.time = 0;
  }

  save(): void {
    const data = _.extend({}, this);
    delete (data as any).cars;
    localStorage.world = JSON.stringify(data);
  }

  load(data?: string): void {
    data = data || localStorage.world;
    const parsedData = data && JSON.parse(data);
    if (!parsedData) {
      return;
    }
    this.clear();
    this.carsNumber = parsedData.carsNumber || 0;
    for (const id in parsedData.intersections) {
      const intersection = parsedData.intersections[id];
      this.addIntersection(Intersection.copy(intersection));
    }
    for (const id in parsedData.roads) {
      const road = parsedData.roads[id];
      const roadCopy = Road.copy(road);
      roadCopy.source = this.getIntersection(road.source);
      roadCopy.target = this.getIntersection(road.target);
      this.addRoad(roadCopy);
    }
  }

  generateMap(minX: number = -2, maxX: number = 2, minY: number = -2, maxY: number = 2): void {
    this.clear();
    const intersectionsNumber = (0.8 * (maxX - minX + 1) * (maxY - minY + 1)) | 0;
    const map: { [key: string]: Intersection } = {};
    const gridSize = settings.gridSize;
    const step = 5 * gridSize;
    this.carsNumber = 100;
    let remainingIntersections = intersectionsNumber;
    
    while (remainingIntersections > 0) {
      const x = _.random(minX, maxX);
      const y = _.random(minY, maxY);
      const key = `${x},${y}`;
      if (!map[key]) {
        const rect = new Rect(step * x, step * y, gridSize, gridSize);
        const intersection = new Intersection(rect);
        this.addIntersection(intersection);
        map[key] = intersection;
        remainingIntersections -= 1;
      }
    }
    
    for (let x = minX; x <= maxX; x++) {
      let previous: Intersection | null = null;
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;
        const intersection = map[key];
        if (intersection) {
          if (random() < 0.9) {
            if (previous) {
              this.addRoad(new Road(intersection, previous));
              this.addRoad(new Road(previous, intersection));
            }
          }
          previous = intersection;
        }
      }
    }
    
    for (let y = minY; y <= maxY; y++) {
      let previous: Intersection | null = null;
      for (let x = minX; x <= maxX; x++) {
        const key = `${x},${y}`;
        const intersection = map[key];
        if (intersection) {
          if (random() < 0.9) {
            if (previous) {
              this.addRoad(new Road(intersection, previous));
              this.addRoad(new Road(previous, intersection));
            }
          }
          previous = intersection;
        }
      }
    }
  }

  clear(): void {
    this.set({});
  }

  onTick = (delta: number): void => {
    if (delta > 1) {
      throw new Error('delta > 1');
    }
    this.time += delta;
    this.refreshCars();
    for (const id in this.intersections.all()) {
      const intersection = this.intersections.all()[id];
      intersection.controlSignals.onTick(delta);
    }
    for (const id in this.cars.all()) {
      const car = this.cars.all()[id];
      car.move(delta);
      if (!car.alive) {
        this.removeCar(car);
      }
    }
  }

  refreshCars(): void {
    if (this.cars.length < this.carsNumber) {
      this.addRandomCar();
    }
    if (this.cars.length > this.carsNumber) {
      this.removeRandomCar();
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
    console.log('🟡 World: Adding intersection at', intersection.rect.x, intersection.rect.y);
    this.intersections.put(intersection);
    console.log('🟡 World: Total intersections now:', Object.keys(this.intersections.all()).length);
  }

  getIntersection(id: string): Intersection {
    return this.intersections.get(id);
  }

  addRandomCar(): void {
    const roadsAll = this.roads.all();
    const roadsArray = Object.values(roadsAll);
    const road = _.sample(roadsArray);
    if (road) {
      const lane = _.sample(road.lanes);
      if (lane) {
        this.addCar(new Car(lane, 0));
      }
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

// Set up properties using the CoffeeScript-style property decorator
World.property('instantSpeed', {
  get: function(this: World) {
    const speeds = _.map(Object.values(this.cars.all()), (car) => car.speed);
    if (speeds.length === 0) {
      return 0;
    }
    return _.reduce(speeds, (a, b) => a + b, 0) / speeds.length;
  }
});

export = World;
