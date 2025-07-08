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
  
  // We'll use the adapter directly through the trafficLightController
  private trafficControlAdapter: IntersectionTrafficControlAdapter;

  constructor(rect: Rect) {
    // Call the parent constructor first
    super(rect);
    
    // Create our adapter and connect it to the traffic light controller
    this.trafficControlAdapter = new IntersectionTrafficControlAdapter(this);
    
    // Use the setter instead of directly accessing the private field
    this.controlSignals = this.trafficControlAdapter;
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
    
    // Ensure our adapter is properly initialized
    if (intersection.trafficControlAdapter) {
      result.trafficControlAdapter = IntersectionTrafficControlAdapter.create(
        intersection.trafficControlAdapter, result
      );
    }
    
    return result;
  }

  toJSON(): any {
    // Use parent's toJSON to ensure we include all required properties
    const baseJson = super.toJSON();
    
    // Add our adapter to the serialized data
    return {
      ...baseJson,
      trafficControlAdapter: this.trafficControlAdapter
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
    // First try to use the parent's trafficLightController
    if (this.trafficLightController) {
      return this.trafficLightController;
    }
    
    // Fall back to our adapter if needed
    return this.trafficControlAdapter.getController();
  }
  
  /**
   * Change the traffic control strategy for this intersection
   * Override parent implementation for backward compatibility
   */
  setTrafficControlStrategy(strategyType: string): boolean {
    // Use the parent implementation which now uses trafficLightController
    return super.setTrafficControlStrategy(strategyType);
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
