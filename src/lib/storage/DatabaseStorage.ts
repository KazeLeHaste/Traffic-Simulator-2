import type { IStorage } from './IStorage';

/**
 * Future database storage implementation
 * This will be implemented when adding SQLite or backend storage
 */
export class DatabaseStorage implements IStorage {
  private dbConnection: any = null;

  constructor(connectionString?: string) {
    // TODO: Initialize database connection
    console.warn('DatabaseStorage is not yet implemented. Use LocalStorage for now.');
  }

  async saveLayout(layout: any): Promise<void> {
    throw new Error('DatabaseStorage not implemented yet. Please use LocalStorage.');
  }

  async loadLayout(id?: string): Promise<any | null> {
    throw new Error('DatabaseStorage not implemented yet. Please use LocalStorage.');
  }

  async loadAllLayouts(): Promise<any[]> {
    throw new Error('DatabaseStorage not implemented yet. Please use LocalStorage.');
  }

  async saveAnalytics(data: any): Promise<void> {
    throw new Error('DatabaseStorage not implemented yet. Please use LocalStorage.');
  }

  async loadAnalytics(): Promise<any[]> {
    throw new Error('DatabaseStorage not implemented yet. Please use LocalStorage.');
  }

  async clear(): Promise<void> {
    throw new Error('DatabaseStorage not implemented yet. Please use LocalStorage.');
  }
}
