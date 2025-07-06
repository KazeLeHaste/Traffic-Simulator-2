/**
 * Storage interface for swappable storage backends
 * Supports both local storage and future database implementations
 */
export interface IStorage {
  /**
   * Save a road network layout
   */
  saveLayout(layout: any): Promise<void>;

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
   * Clear all stored data
   */
  clear(): Promise<void>;
}
