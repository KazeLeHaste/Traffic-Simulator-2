import type { IStorage } from './IStorage';

/**
 * Local storage implementation of the storage interface
 * Uses browser localStorage for data persistence
 */
export class LocalStorage implements IStorage {
  private readonly LAYOUT_KEY = 'traffic_simulator_layouts';
  private readonly ANALYTICS_KEY = 'traffic_simulator_analytics';
  private readonly CURRENT_LAYOUT_KEY = 'traffic_simulator_current_layout';

  async saveLayout(layout: any, layoutName?: string): Promise<void> {
    try {
      // Only add to layouts collection - don't auto-save as current layout
      const layouts = await this.loadAllLayouts();
      const newLayout = {
        id: `layout_${Date.now()}`,
        name: layoutName || `Layout ${new Date().toLocaleString()}`,
        data: layout,
        createdAt: new Date().toISOString()
      };
      
      layouts.push(newLayout);
      localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.error('Failed to save layout:', error);
      throw new Error('Failed to save layout to local storage');
    }
  }

  async loadLayout(): Promise<any | null> {
    try {
      const data = localStorage.getItem(this.CURRENT_LAYOUT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load layout:', error);
      return null;
    }
  }

  async loadAllLayouts(): Promise<any[]> {
    try {
      const data = localStorage.getItem(this.LAYOUT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load layouts:', error);
      return [];
    }
  }

  async saveAnalytics(data: any): Promise<void> {
    try {
      const analytics = await this.loadAnalytics();
      const newAnalytics = {
        id: `analytics_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: data
      };
      
      analytics.push(newAnalytics);
      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to save analytics:', error);
      throw new Error('Failed to save analytics to local storage');
    }
  }

  async loadAnalytics(): Promise<any[]> {
    try {
      const data = localStorage.getItem(this.ANALYTICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load analytics:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.LAYOUT_KEY);
      localStorage.removeItem(this.ANALYTICS_KEY);
      localStorage.removeItem(this.CURRENT_LAYOUT_KEY);
      // Keep the legacy 'world' key for now
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear local storage');
    }
  }
}
