/**
 * Storage interface for swappable storage backends
 * Supports both local storage and future database implementations
 */
export interface IStorage {
  /**
   * Save a road network layout
   */
  saveLayout(layout: any, layoutName?: string): Promise<void>;

  /**
   * Load the most recent layout
   */
  loadLayout(): Promise<any | null>;

  /**
   * Load all saved layouts for selection
   */
  loadAllLayouts(): Promise<any[]>;

  /**
   * Save simulation analytics/KPI data
   */
  saveAnalytics(data: any): Promise<void>;

  /**
   * Load all analytics data
   */
  loadAnalytics(): Promise<any[]>;

  /**
   * Save a scenario with all parameters required for reproducible simulation
   * A scenario includes road layout, traffic control settings, and simulation parameters
   */
  saveScenario(scenario: any, scenarioName?: string): Promise<void>;

  /**
   * Load a specific scenario by ID
   */
  loadScenario(id: string): Promise<any | null>;

  /**
   * Load all saved scenarios
   */
  loadAllScenarios(): Promise<any[]>;

  /**
   * Delete a specific scenario by ID
   */
  deleteScenario(id: string): Promise<void>;

  /**
   * Clear all stored data
   */
  clear(): Promise<void>;
}
