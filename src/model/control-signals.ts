import '../helpers';
import settings = require('../settings');

const { random } = Math;

interface Intersection {
  roads: any[];
}

class ControlSignals {
  public intersection: Intersection;
  public flipMultiplier: number;
  public phaseOffset: number;
  public time: number;
  public stateNum: number;
  public lastFlipTime: number;

  // Traffic light states
  static STATE = { RED: 0, GREEN: 1 };

  // Traffic signal patterns for intersections
  // 'L' = Left turn, 'F' = Forward, 'R' = Right turn
  // Each array represents a phase of the traffic light cycle
  // Each element in the array represents a direction (N, E, S, W)
  states = [
    ['L', '', 'L', ''],       // Phase 1: North & South left turns
    ['FR', '', 'FR', ''],     // Phase 2: North & South forward and right
    ['', 'L', '', 'L'],       // Phase 3: East & West left turns
    ['', 'FR', '', 'FR']      // Phase 4: East & West forward and right
  ];

  constructor(intersection: Intersection) {
    this.intersection = intersection;
    this.flipMultiplier = random();  // Randomize cycle timing for variety
    this.phaseOffset = 100 * random(); // Randomize starting phase
    this.time = this.phaseOffset;
    this.stateNum = 0;
    this.lastFlipTime = 0;
  }

  static copy(controlSignals: any, intersection: Intersection): ControlSignals {
    if (!controlSignals) {
      return new ControlSignals(intersection);
    }
    const result = Object.create(ControlSignals.prototype);
    result.flipMultiplier = controlSignals.flipMultiplier || Math.random();
    result.phaseOffset = controlSignals.phaseOffset || 100 * Math.random();
    result.time = result.phaseOffset;
    result.stateNum = controlSignals.stateNum || 0;
    result.intersection = intersection;
    result.lastFlipTime = 0;
    
    // Ensure we have the proper states array if it was serialized
    result.states = controlSignals.states || [
      ['L', '', 'L', ''],
      ['FR', '', 'FR', ''],
      ['', 'L', '', 'L'],
      ['', 'FR', '', 'FR']
    ];
    
    return result;
  }

  toJSON(): any {
    return {
      flipMultiplier: this.flipMultiplier,
      phaseOffset: this.phaseOffset,
      stateNum: this.stateNum,
      states: this.states
    };
  }

  // Calculate the interval between light changes based on the flipMultiplier
  get flipInterval(): number {
    // This formula matches the reference implementation
    return (0.1 + 0.05 * this.flipMultiplier) * settings.lightsFlipInterval;
  }

  // Convert string representation to numeric state array
  // e.g., "LFR" -> [1,1,1] (left, forward, right allowed)
  public _decode(str: string): number[] {
    const state = [0, 0, 0];
    if (str.includes('L')) state[0] = 1;
    if (str.includes('F')) state[1] = 1;
    if (str.includes('R')) state[2] = 1;
    return state;
  }

  // Get the current state of all traffic lights
  get state(): number[][] {
    let stringState = this.states[this.stateNum % this.states.length];
    
    // For 2-way or T-intersections, always allow all movements
    if (this.intersection.roads && this.intersection.roads.length <= 2) {
      stringState = ['LFR', 'LFR', 'LFR', 'LFR'];
    }
    
    // Convert string patterns to numeric state arrays
    return stringState.map(x => this._decode(x));
  }

  // Advance to the next traffic light phase
  flip(): void {
    this.stateNum += 1;
    this.lastFlipTime = this.time;
  }

  // Update the traffic light state based on elapsed time
  onTick = (delta: number): void => {
    // Update timer
    this.time += delta;
    
    // When the interval is reached, change the light
    if (this.time > this.lastFlipTime + this.flipInterval) {
      this.flip();
    }
  }
}

// Set up properties using the CoffeeScript-style property decorator
ControlSignals.property('flipInterval', {
  get: function(this: ControlSignals) {
    return (0.1 + 0.05 * this.flipMultiplier) * settings.lightsFlipInterval;
  }
});

ControlSignals.property('state', {
  get: function(this: ControlSignals) {
    let stringState = this.states[this.stateNum % this.states.length];
    
    // For 2-way or T-intersections, always allow all movements
    if (this.intersection.roads && this.intersection.roads.length <= 2) {
      stringState = ['LFR', 'LFR', 'LFR', 'LFR'];
    }
    
    // Convert string patterns to numeric state arrays
    return stringState.map(x => this._decode(x));
  }
});

export = ControlSignals;
