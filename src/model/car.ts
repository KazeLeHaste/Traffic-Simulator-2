import '../helpers';
import _ = require('underscore');
import Trajectory = require('./trajectory');

const { max, min, random, sqrt } = Math;

interface Lane {
  road: any;
  leftmostAdjacent: Lane;
  rightmostAdjacent: Lane;
  leftAdjacent?: Lane;
  rightAdjacent?: Lane;
  carsPositions?: {[key: string]: any};
  isLeftmost?: boolean;
  isRightmost?: boolean;
  getTurnDirection(other: Lane): number;
  getNext?(carPosition: any): any;
  addCarPosition?(carPosition: any): void;
  removeCar?(carPosition: any): void;
  getDirection(relativePosition?: number): number;
  getPoint(relativePosition: number): any;
  length: number;
  middleLine?: any;
}

interface LanePositionResult {
  distance: number;
  car: Car | null;
}

class Car {
  public id: string;
  public color: number;
  public _speed: number;
  public width: number;
  public length: number;
  public maxSpeed: number;
  public s0: number;
  public timeHeadway: number;
  public maxAcceleration: number;
  public maxDeceleration: number;
  public trajectory: Trajectory;
  public alive: boolean;
  public preferedLane: Lane | null;
  public nextLane: Lane | null;

  constructor(lane: any, position: number) {
    this.id = _.uniqueId('car');
    this.color = (300 + 240 * random()) % 360;
    this.width = 1.7;
    this.length = 3 + 2 * random();
    
    // Vehicle dynamics parameters
    this.maxSpeed = 30 + 5 * random(); // Varied max speeds for realistic traffic
    this._speed = 5 + 2 * random();    // Start with some initial speed
    this.s0 = 2;                       // Minimum distance (meters)
    this.timeHeadway = 1.5;            // Time headway (seconds)
    this.maxAcceleration = 0.8 + 0.4 * random(); // Varied acceleration
    this.maxDeceleration = 3;          // Maximum braking deceleration
    
    this.trajectory = new Trajectory(this, lane, position);
    this.alive = true;
    this.preferedLane = null;
    this.nextLane = null;
    
    // Initialization logging removed to reduce lag
  }

  static copy(car: any): Car {
    const result = Object.create(Car.prototype);
    _.extend(result, car);
    return result;
  }

  get coords(): any {
    return this.trajectory.coords;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(speed: number) {
    if (speed < 0) speed = 0;
    if (speed > this.maxSpeed) speed = this.maxSpeed;
    this._speed = speed;
  }

  get direction(): number {
    return this.trajectory.direction;
  }

  release(): void {
    this.trajectory.release();
  }

  getAcceleration(): number {
    try {
      // Get the distance to the next car ahead
      if (!this.trajectory) {
        console.error('🚗 [CAR ERROR] Missing trajectory in getAcceleration');
        return 0;
      }
      
      const nextCarDistance = this.trajectory.nextCarDistance;
      if (!nextCarDistance) {
        console.warn('🚗 [CAR WARN] No nextCarDistance information');
        // Default to small acceleration if we can't calculate
        return 0.1;
      }
      
      // Ensure we have valid distance (prevent division by zero)
      const distanceToNextCar = max(nextCarDistance.distance || 0, 0.1); 
      
      // IDM parameters
      const a = this.maxAcceleration;
      const b = this.maxDeceleration;
      
      // Calculate relative speed (avoid NaN)
      const nextCarSpeed = nextCarDistance.car?.speed || 0;
      const deltaSpeed = (this.speed - nextCarSpeed);
      
      // === INTELLIGENT DRIVER MODEL (IDM) IMPLEMENTATION ===
      
      // 1. Free road coefficient - approaches 1 as speed approaches max speed
      // This term makes the car slow down as it approaches its maximum speed
      const freeRoadCoeff = Math.pow(this.speed / this.maxSpeed, 4);
      
      // 2. Calculate the desired safe following distance
      // s* = s0 + vT + v*deltaV/(2*sqrt(ab))
      const distanceGap = this.s0;                              // Minimum gap when stopped
      const timeGap = this.speed * this.timeHeadway;            // Time headway component
      
      // Break gap component - increases with positive speed difference
      let breakGap = 0;
      const sqrtProduct = sqrt(max(a * b, 0.001));              // Avoid sqrt of negative/zero
      if (sqrtProduct > 0) {
        breakGap = (deltaSpeed > 0) ? (this.speed * deltaSpeed / (2 * sqrtProduct)) : 0;
      }
      
      // Total safe distance needed
      const safeDistance = max(distanceGap + timeGap + breakGap, 0.1);
      
      // 3. Calculate interaction deceleration with leading vehicle
      // This term approaches 1 when actual distance is less than safe distance
      const busyRoadCoeff = Math.pow(safeDistance / distanceToNextCar, 2);
      
      // 4. Intersection handling - for traffic signals
      let intersectionCoeff = 0;
      const distanceToStopLine = this.trajectory.distanceToStopLine;
      
      if (distanceToStopLine && distanceToStopLine > 0 && distanceToStopLine < 50) { // Only consider nearby intersections
        // Calculate safe braking distance to intersection
        const safeIntersectionDistance = 1 + timeGap + Math.pow(this.speed, 2) / (2 * max(b, 0.1));
        
        // If we need to stop (red light) and we're approaching the intersection
        intersectionCoeff = Math.pow(safeIntersectionDistance / distanceToStopLine, 2);
        
        // Make intersection coefficient stronger when we're very close
        if (distanceToStopLine < 5) {
          intersectionCoeff *= 1.5;
        }
      }
      
      // 5. Calculate final acceleration
      // a = a_max * (1 - (v/v_0)^4 - (s*/s)^2)
      let coeff = 1 - freeRoadCoeff - busyRoadCoeff - intersectionCoeff;
      
      // Prevent extreme acceleration/deceleration
      coeff = Math.max(Math.min(coeff, 1), -3);
      
      const acceleration = this.maxAcceleration * coeff;
      
      // Debug output only when significant changes occur
      if (Math.abs(acceleration) > 0.5) {
        // IDM logging removed to reduce lag
      }
      
      // Don't allow extreme deceleration that might cause glitches
      return Math.max(acceleration, -this.maxDeceleration);
      
    } catch (error) {
      console.error('🚗 [CAR ERROR] Error in getAcceleration:', error);
      // Return small positive acceleration to keep cars moving
      return 0.1;
    }
  }

  /**
   * Evaluate lane change to a target lane using MOBIL model principles
   * Returns true if changing lanes is beneficial and safe
   */
  shouldChangeLane(targetLane: Lane): boolean {
    if (!targetLane || this.trajectory.isChangingLanes) {
      return false;
    }

    try {
      const currentLane = this.trajectory.current.lane;
      if (!currentLane || currentLane === targetLane) {
        return false;
      }
      
      // Safety: ensure we have enough space in target lane
      // Get our current position
      const myPosition = this.trajectory.current.position;
      
      // Check cars in target lane (simplified MOBIL model)
      let safeGapAhead = true;
      let safeGapBehind = true;
      let advantageFactor = 0;

      // Check safety gap with vehicles in target lane
      const safetyGap = 2 * this.length; // Minimum distance needed
      
      // Find cars in target lane and check if there's enough space
      const carsInTargetLane = targetLane.carsPositions || {};
      for (const id in carsInTargetLane) {
        const otherPosition = carsInTargetLane[id].position;
        const otherCar = carsInTargetLane[id].car;
        const distance = otherPosition - myPosition;
        
        // If car ahead in target lane
        if (distance > 0 && distance < this.speed * 2 + safetyGap) {
          safeGapAhead = false;
          break;
        }
        
        // If car behind in target lane
        if (distance < 0 && Math.abs(distance) < otherCar.speed * 1.5 + safetyGap) {
          safeGapBehind = false;
          break;
        }
        
        // Calculate advantage - prefer lanes with more space ahead
        if (distance > 0 && distance < 50) { // Only consider cars within 50 units ahead
          advantageFactor -= 1 / distance; // More distance = less negative impact
        }
      }
      
      // Calculate incentive based on current lane congestion
      const currentLaneCars = currentLane.carsPositions || {};
      for (const id in currentLaneCars) {
        if (id !== this.id) { // Don't count ourselves
          const otherPosition = currentLaneCars[id].position;
          const distance = otherPosition - myPosition;
          
          // If car ahead in current lane within relevant distance
          if (distance > 0 && distance < 40) {
            advantageFactor += 2 / distance; // More congestion in current lane = more incentive to change
          }
        }
      }
      
      // Check for strategic lane change (if we need to make a turn)
      if (this.nextLane) {
        const turnNumber = currentLane.getTurnDirection(this.nextLane);
        
        // If we need to turn left and target lane is to the left
        if (turnNumber === 0 && targetLane === currentLane.leftAdjacent) {
          advantageFactor += 0.5;
        }
        
        // If we need to turn right and target lane is to the right
        if (turnNumber === 2 && targetLane === currentLane.rightAdjacent) {
          advantageFactor += 0.5;
        }
      }
      
      // Only change if safe and advantageous
      const shouldChange = safeGapAhead && safeGapBehind && advantageFactor > 0.1;
      
      if (shouldChange) {
        // Lane change evaluation logging removed to reduce lag
      }
      
      return shouldChange;
      
    } catch (error) {
      console.error('🚗 [CAR ERROR] Error evaluating lane change:', error);
      return false;
    }
  }

  move(delta: number): void {
    try {
      if (!delta || isNaN(delta) || delta <= 0) {
        console.warn('🚗 [CAR WARN] Invalid delta in move:', delta);
        return;
      }
      
      // Get acceleration and update speed
      const acceleration = this.getAcceleration();
      const oldSpeed = this.speed;
      this.speed += acceleration * delta;
  
      // Handle strategic lane changing (for upcoming turns)
      if (!this.trajectory.isChangingLanes && this.nextLane) {
        try {
          const currentLane = this.trajectory.current.lane;
          if (currentLane) {
            const turnNumber = currentLane.getTurnDirection(this.nextLane);
            let preferredLane: Lane | null = null;
            
            // Choose preferred lane based on upcoming turn
            switch (turnNumber) {
              case 0: // Left turn coming up - move to leftmost lane
                preferredLane = currentLane.leftmostAdjacent;
                break;
              case 2: // Right turn coming up - move to rightmost lane
                preferredLane = currentLane.rightmostAdjacent;
                break;
              default:
                preferredLane = null; // No preference for straight ahead
            }
            
            // If we have a preference and it's different from current lane
            if (preferredLane && preferredLane !== currentLane && this.shouldChangeLane(preferredLane)) {
              // Lane change logging removed to reduce lag
              this.trajectory.changeLane(preferredLane);
            }
          }
        } catch (laneError) {
          console.error('🚗 [CAR ERROR] Error in strategic lane change logic:', laneError);
        }
      }
      
      // Handle opportunistic lane changing (MOBIL model - looking for better traffic flow)
      if (!this.trajectory.isChangingLanes && !this.nextLane && Math.random() < 0.02) { // Only occasionally check
        try {
          const currentLane = this.trajectory.current.lane;
          if (currentLane) {
            // Check if changing to left lane would be beneficial
            if (currentLane.leftAdjacent && this.shouldChangeLane(currentLane.leftAdjacent)) {
              // Left lane change logging removed to reduce lag
              this.trajectory.changeLane(currentLane.leftAdjacent);
            } 
            // Otherwise check if changing to right lane would be beneficial
            else if (currentLane.rightAdjacent && this.shouldChangeLane(currentLane.rightAdjacent)) {
              // Right lane change logging removed to reduce lag
              this.trajectory.changeLane(currentLane.rightAdjacent);
            }
          }
        } catch (laneError) {
          console.error('🚗 [CAR ERROR] Error in opportunistic lane change logic:', laneError);
        }
      }
  
      // Calculate how far to move
      const step = this.speed * delta + 0.5 * acceleration * Math.pow(delta, 2);
      
      if (step <= 0) {
        console.warn('🚗 [CAR WARN] Car', this.id, 'not moving, step =', step);
      } else if (this.speed > 5) { // Only log significant movements to reduce spam
        // Movement logging removed to reduce lag
      }
      
      // Check for end of road network/path
      // A car should be despawned when it either:
      // 1. Reaches an intersection and has no more roads to follow
      // 2. Reaches the end of its current lane and has no next lane
      
      if (this.trajectory.timeToMakeTurn(step)) {
        // We've reached an intersection
        if (!this.nextLane) {
          // No valid next lane means we're at the end of the road network
          console.log(`🚗 [CAR INFO] Car ${this.id} has reached the end of the road network. Despawning.`);
          this.alive = false;
          return;
        }
      }
      
      // Check for invalid lane position (off the layout)
      if (this.trajectory.current.position > this.trajectory.current.lane.length + 2*this.length) {
        // Position beyond the end of the lane with a margin
        console.log(`🚗 [CAR INFO] Car ${this.id} is beyond the edge of the layout. Despawning.`);
        this.alive = false;
        return;
      }
      
      // Move the car forward
      this.trajectory.moveForward(step);
    } catch (error) {
      console.error('🚗 [CAR ERROR] Error moving car', this.id, ':', error);
      console.error('🚗 [CAR ERROR] Stack trace:', error.stack);
    }
  }

  pickNextRoad(): any {
    const intersection = this.trajectory.nextIntersection;
    const currentLane = this.trajectory.current.lane;
    const possibleRoads = intersection.roads.filter((x: any) => 
      x.target !== currentLane.road.source
    );
    if (possibleRoads.length === 0) {
      return null;
    }
    return _.sample(possibleRoads);
  }

  pickNextLane(): Lane | null {
    if (this.nextLane) {
      throw new Error('next lane is already chosen');
    }
    this.nextLane = null;
    const nextRoad = this.pickNextRoad();
    if (!nextRoad) {
      return null;
    }
    const turnNumber = this.trajectory.current.lane.road.getTurnDirection(nextRoad);
    let laneNumber: number;
    switch (turnNumber) {
      case 0:
        laneNumber = nextRoad.lanesNumber - 1;
        break;
      case 1:
        laneNumber = _.random(0, nextRoad.lanesNumber - 1);
        break;
      case 2:
        laneNumber = 0;
        break;
      default:
        laneNumber = 0;
    }
    this.nextLane = nextRoad.lanes[laneNumber];
    if (!this.nextLane) {
      throw new Error('can not pick next lane');
    }
    return this.nextLane;
  }

  popNextLane(): Lane | null {
    const nextLane = this.nextLane;
    this.nextLane = null;
    this.preferedLane = null;
    return nextLane;
  }
}

// Set up properties using the CoffeeScript-style property decorator
Car.property('coords', {
  get: function(this: Car) {
    return this.trajectory.coords;
  }
});

Car.property('speed', {
  get: function(this: Car) {
    return this._speed;
  },
  set: function(this: Car, speed: number) {
    if (speed < 0) speed = 0;
    if (speed > this.maxSpeed) speed = this.maxSpeed;
    this._speed = speed;
  }
});

Car.property('direction', {
  get: function(this: Car) {
    return this.trajectory.direction;
  }
});

export = Car;
