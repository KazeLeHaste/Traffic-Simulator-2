import { Router } from '../core/Router';
import { sessionAnalyticsStorage, AnalyticsEntry } from '../lib/storage/SessionAnalyticsStorage';
import { BenchmarkRun, KPIVisualizationComponent } from '../components/KPIVisualizationComponent';

/**
 * Analytics Page Component
 * 
 * Displays session-volatile analytics data from KPI benchmark runs.
 * Data is only shown for the current browsing session and is lost
 * when the page is refreshed or the session ends.
 */
export class AnalyticsPageComponent {
  private container: HTMLElement;
  private selectedEntries: Set<string> = new Set();
  private refreshInterval: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.render();
    this.addEventListeners();
    this.startAutoRefresh();
  }

  public destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.selectedEntries.clear();
  }

  private render(): void {
    const sessionInfo = sessionAnalyticsStorage.getSessionInfo();
    const analyticsEntries = sessionAnalyticsStorage.getAllAnalyticsEntries();

    this.container.innerHTML = `
      <div class="analytics-page">
        <!-- Header -->
        <div class="analytics-header">
          <div class="analytics-title">
            <h1>📊 Traffic Analytics Dashboard</h1>
            <p class="analytics-subtitle">Session-based benchmark analysis and comparison</p>
          </div>
          <div class="analytics-session-info">
            <div class="session-badge">
              <span class="session-label">Session:</span>
              <span class="session-id">${sessionInfo.sessionId.substring(0, 12)}...</span>
            </div>
            <div class="storage-badge ${sessionInfo.isSessionStorageAvailable ? 'storage-available' : 'storage-memory'}">
              ${sessionInfo.isSessionStorageAvailable ? '💾 Session Storage' : '🧠 Memory Storage'}
            </div>
          </div>
        </div>

        <!-- Session Notice -->
        <div class="session-notice">
          <div class="notice-icon">⚠️</div>
          <div class="notice-content">
            <strong>Session-Volatile Data:</strong> Analytics data is temporary and will be cleared if you refresh this page, 
            close the browser tab, or restart the server. Only benchmarks added during your current session are shown.
          </div>
        </div>

        <!-- Analytics Controls -->
        <div class="analytics-controls">
          <div class="analytics-stats">
            <div class="stat-item">
              <span class="stat-value">${analyticsEntries.length}</span>
              <span class="stat-label">Benchmark Entries</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${this.selectedEntries.size}</span>
              <span class="stat-label">Selected for Comparison</span>
            </div>
          </div>
          <div class="analytics-actions">
            <button id="select-all-btn" class="btn btn-secondary btn-sm">
              ${this.selectedEntries.size === analyticsEntries.length ? 'Deselect All' : 'Select All'}
            </button>
            <button id="compare-selected-btn" class="btn btn-primary btn-sm" ${this.selectedEntries.size < 2 ? 'disabled' : ''}>
              📈 Compare Selected (${this.selectedEntries.size})
            </button>
            <button id="clear-all-btn" class="btn btn-danger btn-sm" ${analyticsEntries.length === 0 ? 'disabled' : ''}>
              🗑️ Clear All Analytics
            </button>
          </div>
        </div>

        <!-- Analytics Content -->
        <div class="analytics-content">
          ${analyticsEntries.length === 0 ? this.renderEmptyState() : this.renderAnalyticsTable(analyticsEntries)}
        </div>

        <!-- Comparison Panel (hidden by default) -->
        <div id="comparison-panel" class="analytics-comparison-panel" style="display: none;">
          <div class="comparison-header">
            <h3>📊 Benchmark Comparison</h3>
            <button id="close-comparison-btn" class="btn btn-outline-secondary btn-sm">✕ Close</button>
          </div>
          <div id="comparison-content" class="comparison-content">
            <!-- Comparison content will be populated here -->
          </div>
        </div>
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <div class="analytics-empty">
        <div class="empty-icon">📈</div>
        <h3>No Analytics Data Available</h3>
        <p>Analytics entries will appear here after you:</p>
        <ol class="empty-instructions">
          <li>Navigate to the <strong>Simulation</strong> page</li>
          <li>Run a KPI Benchmark test</li>
          <li>Click <strong>"Add to Analytics"</strong> in the results dialog</li>
        </ol>
        <p class="empty-note">
          <strong>Note:</strong> Analytics data is session-volatile and will be lost if you refresh the page or close the browser.
        </p>
        <div class="empty-actions">
          <a href="/simulation" class="btn btn-primary">Go to Simulation Page</a>
        </div>
      </div>
    `;
  }

  private renderAnalyticsTable(entries: AnalyticsEntry[]): string {
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.addedTimestamp).getTime() - new Date(a.addedTimestamp).getTime()
    );

    return `
      <div class="analytics-table-container">
        <table class="analytics-table">
          <thead>
            <tr>
              <th class="select-column">
                <input type="checkbox" id="select-all-checkbox" ${this.selectedEntries.size === entries.length && entries.length > 0 ? 'checked' : ''}>
              </th>
              <th>Benchmark Name</th>
              <th>Added to Analytics</th>
              <th>Duration</th>
              <th>Traffic Control</th>
              <th>Vehicles</th>
              <th>Key Metrics</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${sortedEntries.map(entry => this.renderAnalyticsRow(entry)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderAnalyticsRow(entry: AnalyticsEntry): string {
    const addedDate = new Date(entry.addedTimestamp);
    const isSelected = this.selectedEntries.has(entry.analyticsId);
    const metrics = entry.finalMetrics;

    return `
      <tr class="analytics-row ${isSelected ? 'selected' : ''}" data-analytics-id="${entry.analyticsId}">
        <td class="select-column">
          <input type="checkbox" class="entry-checkbox" data-analytics-id="${entry.analyticsId}" ${isSelected ? 'checked' : ''}>
        </td>
        <td class="benchmark-name">
          <div class="name-main">${entry.name}</div>
          <div class="name-meta">ID: ${entry.id.substring(0, 16)}...</div>
        </td>
        <td class="added-time">
          <div class="time-main">${addedDate.toLocaleDateString()}</div>
          <div class="time-sub">${addedDate.toLocaleTimeString()}</div>
        </td>
        <td class="duration">
          ${(entry.settings?.duration || 0)}s
        </td>
        <td class="traffic-control">
          <span class="control-badge">${entry.settings?.trafficControlModel || 'Unknown'}</span>
        </td>
        <td class="vehicle-count">
          ${entry.settings?.carsNumber || 'N/A'}
        </td>
        <td class="key-metrics">
          <div class="metric-item">
            <span class="metric-label">Speed:</span>
            <span class="metric-value">${metrics.averageSpeed.toFixed(1)} m/s</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Throughput:</span>
            <span class="metric-value">${metrics.globalThroughput.toFixed(1)} veh/min</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Congestion:</span>
            <span class="metric-value congestion-${this.getCongestionLevel(metrics.congestionIndex)}">${(metrics.congestionIndex * 100).toFixed(1)}%</span>
          </div>
        </td>
        <td class="actions">
          <button class="btn btn-info btn-xs view-details-btn" data-analytics-id="${entry.analyticsId}">
            👁️ View
          </button>
          <button class="btn btn-danger btn-xs remove-entry-btn" data-analytics-id="${entry.analyticsId}">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }

  private getCongestionLevel(congestionIndex: number): string {
    if (congestionIndex < 0.3) return 'low';
    if (congestionIndex < 0.6) return 'medium';
    return 'high';
  }

  private addEventListeners(): void {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
        const entries = sessionAnalyticsStorage.getAllAnalyticsEntries();
        if (selectAllCheckbox.checked) {
          entries.forEach(entry => this.selectedEntries.add(entry.analyticsId));
        } else {
          this.selectedEntries.clear();
        }
        this.updateUI();
      });
    }

    // Individual entry checkboxes
    document.querySelectorAll('.entry-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const analyticsId = target.dataset.analyticsId!;
        
        if (target.checked) {
          this.selectedEntries.add(analyticsId);
        } else {
          this.selectedEntries.delete(analyticsId);
        }
        this.updateUI();
      });
    });

    // Select all button
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const entries = sessionAnalyticsStorage.getAllAnalyticsEntries();
        if (this.selectedEntries.size === entries.length) {
          this.selectedEntries.clear();
        } else {
          entries.forEach(entry => this.selectedEntries.add(entry.analyticsId));
        }
        this.updateUI();
      });
    }

    // Compare selected button
    const compareBtn = document.getElementById('compare-selected-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.showComparison();
      });
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
          sessionAnalyticsStorage.clearAllAnalyticsEntries();
          this.selectedEntries.clear();
          this.render();
          this.addEventListeners();
        }
      });
    }

    // View details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const analyticsId = (e.target as HTMLElement).dataset.analyticsId!;
        this.viewEntryDetails(analyticsId);
      });
    });

    // Remove entry buttons
    document.querySelectorAll('.remove-entry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const analyticsId = (e.target as HTMLElement).dataset.analyticsId!;
        if (confirm('Remove this analytics entry?')) {
          sessionAnalyticsStorage.removeAnalyticsEntry(analyticsId);
          this.selectedEntries.delete(analyticsId);
          this.render();
          this.addEventListeners();
        }
      });
    });

    // Close comparison panel
    const closeComparisonBtn = document.getElementById('close-comparison-btn');
    if (closeComparisonBtn) {
      closeComparisonBtn.addEventListener('click', () => {
        document.getElementById('comparison-panel')!.style.display = 'none';
      });
    }

    // Navigation link handler
    document.querySelectorAll('a[href="/simulation"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        (window as any).router?.navigate('/simulation');
      });
    });
  }

  private updateUI(): void {
    // Update controls
    const selectAllBtn = document.getElementById('select-all-btn');
    const compareBtn = document.getElementById('compare-selected-btn');
    const entries = sessionAnalyticsStorage.getAllAnalyticsEntries();

    if (selectAllBtn) {
      selectAllBtn.textContent = this.selectedEntries.size === entries.length ? 'Deselect All' : 'Select All';
    }

    if (compareBtn) {
      (compareBtn as HTMLButtonElement).disabled = this.selectedEntries.size < 2;
      compareBtn.textContent = `📈 Compare Selected (${this.selectedEntries.size})`;
    }

    // Update row selection styles
    document.querySelectorAll('.analytics-row').forEach(row => {
      const analyticsId = row.getAttribute('data-analytics-id')!;
      if (this.selectedEntries.has(analyticsId)) {
        row.classList.add('selected');
      } else {
        row.classList.remove('selected');
      }
    });

    // Update checkboxes
    document.querySelectorAll('.entry-checkbox').forEach(checkbox => {
      const cb = checkbox as HTMLInputElement;
      const analyticsId = cb.dataset.analyticsId!;
      cb.checked = this.selectedEntries.has(analyticsId);
    });

    // Update select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = this.selectedEntries.size === entries.length && entries.length > 0;
      selectAllCheckbox.indeterminate = this.selectedEntries.size > 0 && this.selectedEntries.size < entries.length;
    }

    // Update stats
    const statsContainer = document.querySelector('.analytics-stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-item">
          <span class="stat-value">${entries.length}</span>
          <span class="stat-label">Benchmark Entries</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${this.selectedEntries.size}</span>
          <span class="stat-label">Selected for Comparison</span>
        </div>
      `;
    }
  }

  private showComparison(): void {
    if (this.selectedEntries.size < 2) return;

    const selectedAnalyticsEntries = Array.from(this.selectedEntries)
      .map(id => sessionAnalyticsStorage.getAnalyticsEntry(id))
      .filter(entry => entry !== null) as AnalyticsEntry[];

    const comparisonPanel = document.getElementById('comparison-panel')!;
    const comparisonContent = document.getElementById('comparison-content')!;

    comparisonContent.innerHTML = this.renderComparisonContent(selectedAnalyticsEntries);
    comparisonPanel.style.display = 'block';
  }

  private renderComparisonContent(entries: AnalyticsEntry[]): string {
    const metrics = ['averageSpeed', 'globalThroughput', 'averageWaitTime', 'congestionIndex', 'completedTrips', 'totalStops'];
    
    return `
      <div class="comparison-overview">
        <h4>Comparing ${entries.length} Benchmark Runs</h4>
        <div class="comparison-entries">
          ${entries.map((entry, index) => `
            <div class="comparison-entry-badge">
              <span class="badge-number">${index + 1}</span>
              <span class="badge-name">${entry.name}</span>
              <span class="badge-date">${new Date(entry.addedTimestamp).toLocaleDateString()}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              ${entries.map((entry, index) => `<th>Run ${index + 1}</th>`).join('')}
              <th>Best</th>
              <th>Worst</th>
              <th>Range</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderComparisonMetrics(entries)}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderComparisonMetrics(entries: AnalyticsEntry[]): string {
    const metricConfigs = [
      { key: 'averageSpeed', label: 'Average Speed (m/s)', higherIsBetter: true, decimals: 2 },
      { key: 'globalThroughput', label: 'Global Throughput (veh/min)', higherIsBetter: true, decimals: 2 },
      { key: 'averageWaitTime', label: 'Average Wait Time (s)', higherIsBetter: false, decimals: 2 },
      { key: 'congestionIndex', label: 'Congestion Index', higherIsBetter: false, decimals: 3 },
      { key: 'completedTrips', label: 'Completed Trips', higherIsBetter: true, decimals: 0 },
      { key: 'totalStops', label: 'Total Stops', higherIsBetter: false, decimals: 0 }
    ];

    return metricConfigs.map(config => {
      const values = entries.map(entry => entry.finalMetrics[config.key]);
      const bestValue = config.higherIsBetter ? Math.max(...values) : Math.min(...values);
      const worstValue = config.higherIsBetter ? Math.min(...values) : Math.max(...values);
      const range = Math.abs(bestValue - worstValue);

      return `
        <tr>
          <td class="metric-label">${config.label}</td>
          ${values.map(value => `
            <td class="metric-value ${value === bestValue ? 'best-value' : value === worstValue ? 'worst-value' : ''}">
              ${value.toFixed(config.decimals)}
            </td>
          `).join('')}
          <td class="best-value">${bestValue.toFixed(config.decimals)}</td>
          <td class="worst-value">${worstValue.toFixed(config.decimals)}</td>
          <td class="range-value">${range.toFixed(config.decimals)}</td>
        </tr>
      `;
    }).join('');
  }

  private viewEntryDetails(analyticsId: string): void {
    const entry = sessionAnalyticsStorage.getAnalyticsEntry(analyticsId);
    if (!entry) {
      console.error('Analytics entry not found with ID:', analyticsId);
      console.error('Analytics entry not found with ID:', analyticsId);
      return;
    }

    console.log('Showing details for analytics entry:', entry.name);

    // Create a benchmark results dialog similar to the one in SimulationPageComponent
    let dialog = document.getElementById('analytics-details-dialog');
    const visualizationContainerId = 'analytics-kpi-visualization-container';
    
    if (!dialog) {
      console.log('Creating new analytics details dialog');
      dialog = document.createElement('div');
      dialog.id = 'analytics-details-dialog';
      dialog.className = 'dialog benchmark-dialog';
      
      dialog.innerHTML = `
        <div class="dialog-content" style="max-width: 95vw; max-height: 90vh; width: 1400px;">
          <div class="dialog-header">
            <h3>📊 KPI Benchmark Results</h3>
            <button class="close-btn" style="font-size: 24px;">&times;</button>
          </div>
          <div class="dialog-body" style="max-height: calc(90vh - 100px); overflow-y: auto;">
            <div id="${visualizationContainerId}"></div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      // Add close button events
      const closeButtons = dialog.querySelectorAll('.close-btn');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          console.log('Closing analytics details dialog');
          dialog!.style.display = 'none';
          
          // Clean up the KPI visualization component
          const container = document.getElementById(visualizationContainerId);
          if (container) {
            console.log('Cleaning up visualization container');
            container.innerHTML = '';
          }
        });
      });
    }
    
    // Show dialog
    dialog.style.display = 'block';
    
    // Convert analytics entry to benchmark run format
    const benchmarkRun: BenchmarkRun = {
      id: entry.id,
      name: entry.name,
      timestamp: entry.timestamp,
      finalMetrics: entry.finalMetrics,
      samples: entry.samples,
      settings: entry.settings,
      validation: entry.validation
    };
    
    console.log('Created benchmark run object:', benchmarkRun.name);
    
    // Initialize KPI visualization component
    const container = document.getElementById(visualizationContainerId)!;
    if (!container) {
      console.error('Visualization container not found:', visualizationContainerId);
      return;
    }
    
    console.log('Clearing previous visualization content');
    container.innerHTML = ''; // Clear previous content
    
    try {
      console.log('Creating new KPI visualization component');
      // Create new visualization component and display the results
      const kpiVisualization = new KPIVisualizationComponent(container);
      kpiVisualization.displayBenchmarkResults(benchmarkRun);
      
      console.log('KPI visualization displayed successfully');
      
      // Hide the "Add to Analytics" button since we're already in the analytics page
      const addToAnalyticsBtn = container.querySelector('#add-to-analytics-btn') as HTMLButtonElement;
      if (addToAnalyticsBtn) {
        console.log('Hiding Add to Analytics button');
        addToAnalyticsBtn.style.display = 'none';
      }
    } catch (error) {
      console.error('Error displaying KPI visualization:', error);
    }
  }

  private startAutoRefresh(): void {
    // Refresh every 5 seconds to show any new analytics entries
    this.refreshInterval = window.setInterval(() => {
      const currentEntryCount = sessionAnalyticsStorage.getAllAnalyticsEntries().length;
      const displayedEntryCount = document.querySelectorAll('.analytics-row').length;
      
      if (currentEntryCount !== displayedEntryCount) {
        console.log('📊 [Analytics] Refreshing UI due to data changes');
        this.render();
        this.addEventListeners();
      }
    }, 5000);
  }

  private viewAnalyticsEntry(entry: any): void {
    console.log('Viewing analytics entry:', entry);
    
    // Generate a unique container ID for this visualization instance
    const visualizationContainerId = `kpi-visualization-${Date.now()}`;
    
    // Remove any existing benchmark results dialogs first
    const existingDialogs = document.querySelectorAll('.benchmark-dialog, .fullscreen-modal');
    existingDialogs.forEach(dialog => {
      if (dialog.parentElement) {
        dialog.parentElement.removeChild(dialog);
      }
    });
    
    // Create a direct fullscreen container for KPI visualization
    const kpiContainer = document.createElement('div');
    kpiContainer.id = visualizationContainerId;
    document.body.appendChild(kpiContainer);
    
    // Convert analytics entry to benchmark run format
    const benchmarkRun: BenchmarkRun = {
      id: entry.id,
      name: entry.name,
      timestamp: entry.timestamp,
      finalMetrics: entry.finalMetrics,
      samples: entry.samples,
      settings: entry.settings,
      validation: entry.validation || ''
    };
    
    console.log('Created benchmark run object:', benchmarkRun.name);
    
    try {
      console.log('Creating new KPI visualization component');
      // Create new visualization component and display the results
      const kpiVisualization = new KPIVisualizationComponent(kpiContainer);
      kpiVisualization.displayBenchmarkResults(benchmarkRun);
      
      console.log('KPI visualization displayed successfully');
      
      // Listen for close events to clean up the container
      document.addEventListener('kpi-dialog-closed', () => {
        if (kpiContainer && kpiContainer.parentElement) {
          kpiContainer.parentElement.removeChild(kpiContainer);
        }
      }, { once: true });
      
    } catch (error) {
      console.error('Error creating KPI visualization:', error);
    }
  }
}
