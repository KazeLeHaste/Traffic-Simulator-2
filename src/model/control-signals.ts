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

  static STATE = { RED: 0, GREEN: 1 };

  states = [
    ['L', '', 'L', ''],
    ['FR', '', 'FR', ''],
    ['', 'L', '', 'L'],
    ['', 'FR', '', 'FR']
  ];

  constructor(intersection: Intersection) {
    this.intersection = intersection;
    this.flipMultiplier = random();
    this.phaseOffset = 100 * random();
    this.time = this.phaseOffset;
    this.stateNum = 0;
  }

  static copy(controlSignals: any, intersection: Intersection): ControlSignals {
    if (!controlSignals) {
      return new ControlSignals(intersection);
    }
    const result = Object.create(ControlSignals.prototype);
    result.flipMultiplier = controlSignals.flipMultiplier;
    result.time = result.phaseOffset = controlSignals.phaseOffset;
    result.stateNum = 0;
    result.intersection = intersection;
    return result;
  }

  toJSON(): any {
    return {
      flipMultiplier: this.flipMultiplier,
      phaseOffset: this.phaseOffset
    };
  }

  get flipInterval(): number {
    return (0.1 + 0.05 * this.flipMultiplier) * settings.lightsFlipInterval;
  }

  public _decode(str: string): number[] {
    const state = [0, 0, 0];
    if (str.includes('L')) state[0] = 1;
    if (str.includes('F')) state[1] = 1;
    if (str.includes('R')) state[2] = 1;
    return state;
  }

  get state(): number[][] {
    let stringState = this.states[this.stateNum % this.states.length];
    if (this.intersection.roads.length <= 2) {
      stringState = ['LFR', 'LFR', 'LFR', 'LFR'];
    }
    return stringState.map(x => this._decode(x));
  }

  flip(): void {
    this.stateNum += 1;
  }

  onTick = (delta: number): void => {
    this.time += delta;
    if (this.time > this.flipInterval) {
      this.flip();
      this.time -= this.flipInterval;
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
    if (this.intersection.roads.length <= 2) {
      stringState = ['LFR', 'LFR', 'LFR', 'LFR'];
    }
    return stringState.map(x => this._decode(x));
  }
});

export = ControlSignals;
