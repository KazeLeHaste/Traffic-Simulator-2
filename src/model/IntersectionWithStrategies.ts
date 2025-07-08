/**
 * IntersectionWithStrategies
 * 
 * Enhanced Intersection implementation that uses the new modular traffic control system.
 * This class extends the base Intersection class to ensure type compatibility while
 * providing the new strategy-based traffic control functionality.
 */

import '../helpers';
import _ = require('underscore');
import Rect = require('../geom/rect');
import Intersection = require('./intersection');
import { IntersectionTrafficControlAdapter } from './traffic-control/IntersectionTrafficControlAdapter';
import TrafficLightController = require('./traffic-control/TrafficLightController');

/**
 * Steps to integrate this with the existing codebase:
 * 
 * 1. Replace "import ControlSignals = require('./control-signals')" with
 *    "import { IntersectionTrafficControlAdapter as ControlSignals } from './traffic-control/IntersectionTrafficControlAdapter'"
 *    in intersection.ts
 * 
 * 2. Update the Intersection constructor to use the adapter:
 *    this.controlSignals = new ControlSignals(this);
 * 
 * 3. Update the static copy method to use TrafficLightController.copy:
 *    if (intersection.controlSignals) {
 *      result.controlSignals = ControlSignals.create(intersection.controlSignals, result);
 *    } else {
 *      result.controlSignals = new ControlSignals(result);
 *    }
 * 
 * 4. Ensure the world.onTick method still calls controlSignals.onTick
 */

class IntersectionWithStrategies extends Intersection {
  // Note: We don't need to redeclare the properties inherited from Intersection
  // public rect: Rect;
  // public id: string;
  // public roads: any[];
  // public inRoads: any[];
  // The controlSignals property is overridden with the specific adapter type
  public controlSignals: IntersectionTrafficControlAdapter;

  constructor(rect: Rect) {
    // Call the parent constructor first
    super(rect);
    
    // Override the controlSignals with our adapter
    this.controlSignals = new IntersectionTrafficControlAdapter(this);
  }

  static copy(intersection: any): IntersectionWithStrategies {
    // First create a copy using the parent class method
    const baseIntersection = Intersection.copy(intersection);
    
    // Then create our extended class instance
    const result = new IntersectionWithStrategies(baseIntersection.rect);
    
    // Copy over any additional properties
    result.id = baseIntersection.id;
    result.roads = baseIntersection.roads;
    result.inRoads = baseIntersection.inRoads;
    
    // Ensure controlSignals is properly initialized with our adapter
    if (intersection.controlSignals) {
      result.controlSignals = IntersectionTrafficControlAdapter.create(intersection.controlSignals, result);
    } else {
      result.controlSignals = new IntersectionTrafficControlAdapter(result);
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

  update(): void {
    // Use the parent implementation
    super.update();
  }
  
  /**
   * Get the traffic light controller with access to strategies
   */
  getTrafficController(): TrafficLightController {
    return this.controlSignals.getController();
  }
  
  /**
   * Change the traffic control strategy for this intersection
   */
  setTrafficControlStrategy(strategyType: string): boolean {
    return this.controlSignals.getController().setStrategy(strategyType);
  }
  
  /**
   * Return this intersection as a standard Intersection object
   * Useful for compatibility with code that expects the base class
   */
  asIntersection(): Intersection {
    return this as unknown as Intersection;
  }
}

export = IntersectionWithStrategies;
