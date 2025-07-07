import '../helpers';
import _ = require('underscore');
import ControlSignals = require('./control-signals');
import Rect = require('../geom/rect');

class Intersection {
  public rect: Rect;
  public id: string;
  public roads: any[];
  public inRoads: any[];
  public controlSignals: ControlSignals;

  constructor(rect: Rect) {
    this.rect = rect;
    this.id = _.uniqueId('intersection');
    this.roads = [];
    this.inRoads = [];
    this.controlSignals = new ControlSignals(this);
  }

  static copy(intersection: any): Intersection {
    intersection.rect = Rect.copy(intersection.rect);
    const result = Object.create(Intersection.prototype);
    _.extend(result, intersection);
    result.roads = [];
    result.inRoads = [];
    
    // Ensure controlSignals is properly initialized
    if (intersection.controlSignals) {
      result.controlSignals = ControlSignals.copy(intersection.controlSignals, result);
    } else {
      result.controlSignals = new ControlSignals(result);
    }
    
    return result;
  }

  toJSON(): any {
    return {
      id: this.id,
      rect: this.rect,
      controlSignals: this.controlSignals
    };
  }

  // Update all connected roads when intersection properties change
  update(): void {
    for (const road of this.roads) {
      road.update();
    }
    for (const road of this.inRoads) {
      road.update();
    }
  }
  
  // Get outgoing roads (used for route planning)
  getOutgoingRoads(): any[] {
    return this.roads.slice();
  }
  
  // Get incoming roads (used for signal control)
  getIncomingRoads(): any[] {
    return this.inRoads.slice();
  }
}

// Set up properties using the CoffeeScript-style property decorator
Intersection.property('getOutgoingRoads', {
  get: function(this: Intersection) {
    return this.roads.slice();
  }
});

Intersection.property('getIncomingRoads', {
  get: function(this: Intersection) {
    return this.inRoads.slice();
  }
});

export = Intersection;
