/**
 * Session-only Analytics Storage System
 * 
 * This storage system manages analytics data that persists only for the current browser session.
 * Data is lost when the page is refreshed, tab is closed, or browser session ends.
 * 
 * Design Philosophy:
 * - Uses sessionStorage for temporary persistence during current session
 * - Falls back to in-memory storage if sessionStorage is unavailable
 * - Preserves exact data format from KPI Benchmark Results
 * - No data transformation or loss during storage/retrieval
 */

import { BenchmarkRun } from '../../components/KPIVisualizationComponent';

export interface AnalyticsEntry extends BenchmarkRun {
  analyticsId: string;
  addedTimestamp: string;
  sessionId: string;
}

export class SessionAnalyticsStorage {
  private static readonly STORAGE_KEY = 'traffic_simulator_session_analytics';
  private static readonly SESSION_ID_KEY = 'traffic_simulator_session_id';
  private static instance: SessionAnalyticsStorage;
  
  private sessionId: string;
  private memoryStorage: AnalyticsEntry[] = []; // Fallback if sessionStorage unavailable
  private isSessionStorageAvailable: boolean;

  private constructor() {
    this.isSessionStorageAvailable = this.checkSessionStorageAvailability();
    this.sessionId = this.initializeSessionId();
    this.cleanupOldSessions();
  }

  public static getInstance(): SessionAnalyticsStorage {
    if (!SessionAnalyticsStorage.instance) {
      SessionAnalyticsStorage.instance = new SessionAnalyticsStorage();
    }
    return SessionAnalyticsStorage.instance;
  }

  /**
   * Add a benchmark result to session analytics
   * Preserves exact data format from KPI Benchmark Result
   */
  public addBenchmarkToAnalytics(benchmarkRun: BenchmarkRun): AnalyticsEntry {
    const analyticsEntry: AnalyticsEntry = {
      ...benchmarkRun, // Preserve all original data exactly as-is
      analyticsId: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedTimestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    const currentEntries = this.getAllAnalyticsEntries();
    currentEntries.push(analyticsEntry);
    
    this.saveAnalyticsEntries(currentEntries);
    
    console.log('📊 [Analytics] Added benchmark to session analytics:', {
      analyticsId: analyticsEntry.analyticsId,
      benchmarkName: analyticsEntry.name,
      originalId: analyticsEntry.id,
      sessionId: this.sessionId,
      totalEntries: currentEntries.length
    });

    return analyticsEntry;
  }

  /**
   * Get all analytics entries for the current session
   */
  public getAllAnalyticsEntries(): AnalyticsEntry[] {
    if (this.isSessionStorageAvailable) {
      try {
        const stored = sessionStorage.getItem(SessionAnalyticsStorage.STORAGE_KEY);
        if (stored) {
          const entries = JSON.parse(stored) as AnalyticsEntry[];
          // Filter to only current session entries (safety check)
          return entries.filter(entry => entry.sessionId === this.sessionId);
        }
      } catch (error) {
        console.warn('📊 [Analytics] Failed to load from sessionStorage, using memory fallback:', error);
        return this.memoryStorage;
      }
    }
    return this.memoryStorage;
  }

  /**
   * Remove a specific analytics entry
   */
  public removeAnalyticsEntry(analyticsId: string): boolean {
    const currentEntries = this.getAllAnalyticsEntries();
    const initialLength = currentEntries.length;
    const filteredEntries = currentEntries.filter(entry => entry.analyticsId !== analyticsId);
    
    if (filteredEntries.length < initialLength) {
      this.saveAnalyticsEntries(filteredEntries);
      console.log('📊 [Analytics] Removed analytics entry:', analyticsId);
      return true;
    }
    return false;
  }

  /**
   * Clear all analytics entries for current session
   */
  public clearAllAnalyticsEntries(): void {
    this.saveAnalyticsEntries([]);
    console.log('📊 [Analytics] Cleared all analytics entries for session:', this.sessionId);
  }

  /**
   * Get analytics entry by ID
   */
  public getAnalyticsEntry(analyticsId: string): AnalyticsEntry | null {
    const entries = this.getAllAnalyticsEntries();
    return entries.find(entry => entry.analyticsId === analyticsId) || null;
  }

  /**
   * Check if a benchmark has already been added to analytics
   */
  public isBenchmarkInAnalytics(benchmarkId: string): boolean {
    const entries = this.getAllAnalyticsEntries();
    return entries.some(entry => entry.id === benchmarkId);
  }

  /**
   * Get session information
   */
  public getSessionInfo(): { sessionId: string; entryCount: number; isSessionStorageAvailable: boolean } {
    return {
      sessionId: this.sessionId,
      entryCount: this.getAllAnalyticsEntries().length,
      isSessionStorageAvailable: this.isSessionStorageAvailable
    };
  }

  private checkSessionStorageAvailability(): boolean {
    try {
      const testKey = '__test_session_storage__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('📊 [Analytics] sessionStorage not available, using memory storage:', error);
      return false;
    }
  }

  private initializeSessionId(): string {
    if (this.isSessionStorageAvailable) {
      try {
        let sessionId = sessionStorage.getItem(SessionAnalyticsStorage.SESSION_ID_KEY);
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem(SessionAnalyticsStorage.SESSION_ID_KEY, sessionId);
        }
        return sessionId;
      } catch (error) {
        console.warn('📊 [Analytics] Failed to initialize session ID in sessionStorage:', error);
      }
    }
    // Fallback to memory-based session ID
    return `memory_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveAnalyticsEntries(entries: AnalyticsEntry[]): void {
    if (this.isSessionStorageAvailable) {
      try {
        sessionStorage.setItem(SessionAnalyticsStorage.STORAGE_KEY, JSON.stringify(entries));
        return;
      } catch (error) {
        console.warn('📊 [Analytics] Failed to save to sessionStorage, using memory fallback:', error);
      }
    }
    // Fallback to memory storage
    this.memoryStorage = entries;
  }

  private cleanupOldSessions(): void {
    // Since we're using sessionStorage, cleanup happens automatically
    // when the session ends. This method is for future extensibility.
    console.log('📊 [Analytics] Session analytics storage initialized for session:', this.sessionId);
  }
}

// Export singleton instance
export const sessionAnalyticsStorage = SessionAnalyticsStorage.getInstance();
