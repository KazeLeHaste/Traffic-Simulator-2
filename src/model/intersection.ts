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
    result.controlSignals = ControlSignals.copy(result.controlSignals, result);
    return result;
  }

  toJSON(): any {
    return {
      id: this.id,
      rect: this.rect,
      controlSignals: this.controlSignals
    };
  }

  update(): void {
    for (const road of this.roads) {
      road.update();
    }
    for (const road of this.inRoads) {
      road.update();
    }
  }
}

export = Intersection;
