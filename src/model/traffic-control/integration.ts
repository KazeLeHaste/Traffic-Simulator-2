/**
 * Traffic Control Integration Utilities
 * 
 * This file provides utilities to help integrate the new traffic control system
 * with the existing codebase.
 */

import Intersection = require('../intersection');
import IntersectionWithStrategies = require('../IntersectionWithStrategies');
import { IntersectionTrafficControlAdapter } from './IntersectionTrafficControlAdapter';

/**
 * Upgrade an existing intersection to use the new strategy-based control system
 * 
 * @param intersection The existing intersection to upgrade
 * @returns A new IntersectionWithStrategies instance with the same properties
 */
export function upgradeIntersection(intersection: Intersection): IntersectionWithStrategies {
  // Create a new intersection with strategies
  const result = new IntersectionWithStrategies(intersection.rect);
  
  // Copy over important properties
  result.id = intersection.id;
  result.roads = intersection.roads;
  result.inRoads = intersection.inRoads;
  
  // Ensure we convert the existing control signals
  if (intersection.controlSignals) {
    result.controlSignals = IntersectionTrafficControlAdapter.create(
      intersection.controlSignals, 
      result as unknown as Intersection
    );
  }
  
  return result;
}

/**
 * Check if an intersection is already using the strategy system
 */
export function isStrategyEnabled(intersection: Intersection): boolean {
  return intersection instanceof IntersectionWithStrategies;
}

/**
 * Get the traffic controller from an intersection, if it supports strategies
 */
export function getTrafficController(intersection: Intersection): any {
  if (isStrategyEnabled(intersection)) {
    return (intersection as unknown as IntersectionWithStrategies).getTrafficController();
  }
  return null;
}

/**
 * Set a traffic control strategy on an intersection, upgrading it if needed
 */
export function setTrafficStrategy(
  intersection: Intersection, 
  strategyType: string
): Intersection {
  // If it's not already upgraded, upgrade it
  if (!isStrategyEnabled(intersection)) {
    intersection = upgradeIntersection(intersection);
  }
  
  // Now set the strategy
  (intersection as unknown as IntersectionWithStrategies).setTrafficControlStrategy(strategyType);
  
  return intersection;
}
