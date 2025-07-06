import './helpers';
import World = require('./model/world');
import _ = require('underscore');
import settings = require('./settings');
import * as fs from 'fs';

function measureAverageSpeed(setupCallback?: (world: World) => void): number {
  const world = new World();
  const map = fs.readFileSync('./experiments/map.json', { encoding: 'utf8' });
  console.log(map);
  // world.generateMap();
  world.load(map);
  world.carsNumber = 50;
  if (setupCallback) {
    setupCallback(world);
  }
  const results: number[] = [];
  for (let i = 0; i <= 10000; i++) {
    world.onTick(0.2);
    // console.log(world.instantSpeed);
    results.push(world.instantSpeed);
  }
  return results.reduce((a, b) => a + b, 0) / results.length;
}

function getParams(world: World): number[] {
  const intersections = Object.values(world.intersections.all());
  const params = intersections.map(i => i.controlSignals.flipMultiplier);
  // console.log(JSON.stringify(params));
  return params;
}

settings.lightsFlipInterval = 160;

function experiment1(): void {
  const out = fs.createWriteStream('./experiments/1.data');
  out.write('multiplier avg_speed\n');
  const multipliers = [0.0001, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 2, 3, 4, 5];
  for (const multiplier of multipliers) {
    const result = measureAverageSpeed((world) => {
      const intersections = Object.values(world.intersections.all());
      for (const i of intersections) {
        i.controlSignals.flipMultiplier = multiplier;
      }
      getParams(world);
    });
    out.write(multiplier + ' ' + result + '\n');
  }
  out.end();
}

function experiment2(): void {
  const out = fs.createWriteStream('./experiments/2.data');
  out.write('it avg_speed\n');
  for (let it = 0; it <= 9; it++) {
    const result = measureAverageSpeed((world) => {
      const intersections = Object.values(world.intersections.all());
      for (const i of intersections) {
        i.controlSignals.flipMultiplier = Math.random();
      }
      getParams(world);
    });
    out.write(it + ' ' + result + '\n');
  }
  out.end();
}

function experiment3(): void {
  const out = fs.createWriteStream('./experiments/3.data');
  out.write('it avg_speed\n');
  for (let it = 0; it <= 10; it++) {
    const result = measureAverageSpeed((world) => {
      const intersections = Object.values(world.intersections.all());
      for (const i of intersections) {
        i.controlSignals.flipMultiplier = 1;
        i.controlSignals.phaseOffset = 0;
      }
      getParams(world);
    });
    out.write(it + ' ' + result + '\n');
  }
  out.end();
}

// experiment1();
// experiment2();
// experiment3();
