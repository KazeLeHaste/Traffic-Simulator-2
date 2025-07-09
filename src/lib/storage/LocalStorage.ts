import type { IStorage } from './IStorage';

/**
 * Local storage implementation of the storage interface
 * Uses browser localStorage for data persistence
 */
export class LocalStorage implements IStorage {
  private readonly LAYOUT_KEY = 'traffic_simulator_layouts';
  private readonly ANALYTICS_KEY = 'traffic_simulator_analytics';
  private readonly CURRENT_LAYOUT_KEY = 'traffic_simulator_current_layout';
  private readonly SCENARIO_KEY = 'traffic_simulator_scenarios';

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

  async saveScenario(scenario: any, scenarioName?: string): Promise<void> {
    try {
      const scenarios = await this.loadAllScenarios();
      const newScenario = {
        id: `scenario_${Date.now()}`,
        name: scenarioName || `Scenario ${new Date().toLocaleString()}`,
        data: scenario,
        createdAt: new Date().toISOString()
      };
      
      scenarios.push(newScenario);
      localStorage.setItem(this.SCENARIO_KEY, JSON.stringify(scenarios));
    } catch (error) {
      console.error('Failed to save scenario:', error);
      throw new Error('Failed to save scenario to local storage');
    }
  }

  async loadScenario(id: string): Promise<any | null> {
    try {
      console.log(`LocalStorage: Loading scenario with ID: ${id}`);
      const scenarios = await this.loadAllScenarios();
      
      console.log(`LocalStorage: Found ${scenarios.length} total scenarios`);
      console.log('LocalStorage: Available scenario IDs:', scenarios.map(s => s.id));
      
      const scenario = scenarios.find(s => s.id === id);
      
      if (!scenario) {
        console.error(`LocalStorage: No scenario found with ID: ${id}`);
        return null;
      }
      
      console.log(`LocalStorage: Found scenario: ${scenario.name}`);
      
      // Ensure data exists
      if (!scenario.data) {
        console.error(`LocalStorage: Scenario ${id} has no data property`);
        return null;
      }
      
      return scenario.data;
    } catch (error) {
      console.error('LocalStorage: Failed to load scenario:', error);
      return null;
    }
  }

  async loadAllScenarios(): Promise<any[]> {
    try {
      const data = localStorage.getItem(this.SCENARIO_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      return [];
    }
  }

  async deleteScenario(id: string): Promise<void> {
    try {
      // Get current scenarios
      const scenarios = await this.loadAllScenarios();
      
      // Filter out the scenario to delete
      const updatedScenarios = scenarios.filter(s => s.id !== id);
      
      // Save the updated list back to localStorage
      localStorage.setItem(this.SCENARIO_KEY, JSON.stringify(updatedScenarios));
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      throw new Error('Failed to delete scenario from local storage');
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.LAYOUT_KEY);
      localStorage.removeItem(this.ANALYTICS_KEY);
      localStorage.removeItem(this.CURRENT_LAYOUT_KEY);
      localStorage.removeItem(this.SCENARIO_KEY);
      // Keep the legacy 'world' key for now
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear local storage');
    }
  }
}
