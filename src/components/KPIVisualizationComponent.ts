/**
 * KPI Visualization Component - Creates interactive tables and charts for KPI display
 * 
 * This component provides:
 * - Interactive tables with sorting and filtering
 * - Time-series charts for metrics evolution
 * - Export functionality for CSV and JSON
 * - Side-by-side comparison of benchmark runs
 */

// Import Chart.js with auto-registration of all components
import Chart from 'chart.js/auto';
import { SimulationMetrics, LaneDetailedMetrics, IntersectionDetailedMetrics } from '../model/kpi-collector';

// Chart configuration type
interface ChartConfig {
  type: string;
  data: any;
  options?: any;
}

export interface BenchmarkRun {
  id: string;
  name: string;
  timestamp: string;
  finalMetrics: SimulationMetrics;
  samples: SimulationMetrics[];
  settings: any;
  validation: string;
}

export class KPIVisualizationComponent {
  private container: HTMLElement;
  private charts: { [key: string]: Chart } = {};
  private currentBenchmark: BenchmarkRun | null = null;
  private benchmarkHistory: BenchmarkRun[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.loadBenchmarkHistory();
  }

  /**
   * Display benchmark results with interactive tables and charts
   */
  public displayBenchmarkResults(benchmarkData: BenchmarkRun): void {
    this.currentBenchmark = benchmarkData;
    this.addToBenchmarkHistory(benchmarkData);
    this.render();
  }

  /**
   * Render the complete KPI visualization interface
   */
  private render(): void {
    if (!this.currentBenchmark) {
      this.container.innerHTML = '<div class="kpi-message">No benchmark data available</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="kpi-visualization">
        <!-- Header Controls -->
        <div class="kpi-header">
          <h3>KPI Benchmark Results</h3>
          <div class="kpi-controls">
            <button id="export-csv-btn" class="btn btn-success btn-sm">📄 Export CSV</button>
            <button id="export-json-btn" class="btn btn-info btn-sm">📋 Export JSON</button>
            <button id="compare-runs-btn" class="btn btn-warning btn-sm">📊 Compare Runs</button>
            <button id="validate-data-btn" class="btn btn-secondary btn-sm">✓ Validate Data</button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="kpi-summary">
          ${this.renderSummaryCards()}
        </div>

        <!-- Time Series Charts -->
        <div class="kpi-charts">
          <div class="chart-section">
            <h4>Performance Over Time</h4>
            <div class="chart-grid">
              <div class="chart-container">
                <canvas id="speed-chart"></canvas>
              </div>
              <div class="chart-container">
                <canvas id="throughput-chart"></canvas>
              </div>
              <div class="chart-container">
                <canvas id="wait-time-chart"></canvas>
              </div>
              <div class="chart-container">
                <canvas id="congestion-chart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Tables -->
        <div class="kpi-tables">
          <!-- Lane Metrics Table -->
          <div class="table-section">
            <h4>Lane Performance Metrics</h4>
            <div class="table-controls">
              <input type="text" id="lane-search" placeholder="Search lanes..." class="form-control">
              <select id="lane-sort" class="form-control">
                <option value="">Sort by...</option>
                <option value="averageSpeed">Average Speed</option>
                <option value="throughput">Throughput</option>
                <option value="congestionRate">Congestion Rate</option>
                <option value="queueLength">Queue Length</option>
              </select>
            </div>
            <div class="table-wrapper">
              <table id="lane-metrics-table" class="interactive-table">
                <thead>
                  <tr>
                    <th data-sort="laneId">Lane ID</th>
                    <th data-sort="averageSpeed">Avg Speed (m/s)</th>
                    <th data-sort="vehicleCount">Vehicle Count</th>
                    <th data-sort="throughput">Throughput (veh/min)</th>
                    <th data-sort="congestionRate">Congestion Rate</th>
                    <th data-sort="queueLength">Queue Length</th>
                    <th data-sort="averageWaitTime">Avg Wait Time (s)</th>
                    <th data-sort="totalVehiclesPassed">Total Passed</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

          <!-- Intersection Metrics Table -->
          <div class="table-section">
            <h4>Intersection Performance Metrics</h4>
            <div class="table-controls">
              <input type="text" id="intersection-search" placeholder="Search intersections..." class="form-control">
              <select id="intersection-sort" class="form-control">
                <option value="">Sort by...</option>
                <option value="throughput">Throughput</option>
                <option value="averageWaitTime">Average Wait Time</option>
                <option value="averageQueueLength">Average Queue Length</option>
                <option value="congestionRate">Congestion Rate</option>
              </select>
            </div>
            <div class="table-wrapper">
              <table id="intersection-metrics-table" class="interactive-table">
                <thead>
                  <tr>
                    <th data-sort="intersectionId">Intersection ID</th>
                    <th data-sort="throughput">Throughput (veh/min)</th>
                    <th data-sort="averageWaitTime">Avg Wait Time (s)</th>
                    <th data-sort="maxWaitTime">Max Wait Time (s)</th>
                    <th data-sort="averageQueueLength">Avg Queue Length</th>
                    <th data-sort="maxQueueLength">Max Queue Length</th>
                    <th data-sort="congestionRate">Congestion Rate</th>
                    <th data-sort="totalVehiclesPassed">Total Passed</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Comparison Panel (hidden by default) -->
        <div id="comparison-panel" class="comparison-panel" style="display: none;">
          <h4>Benchmark Comparison</h4>
          <div class="comparison-controls">
            <select id="comparison-benchmark" class="form-control">
              <option value="">Select benchmark to compare...</option>
            </select>
            <button id="close-comparison" class="btn btn-secondary btn-sm">Close</button>
          </div>
          <div id="comparison-content"></div>
        </div>

        <!-- Validation Results (hidden by default) -->
        <div id="validation-panel" class="validation-panel" style="display: none;">
          <h4>Data Validation Results</h4>
          <div id="validation-content"></div>
        </div>
      </div>
    `;

    // Initialize event listeners
    this.initializeEventListeners();
    
    // Populate tables
    this.populateTables();
    
    // Create charts
    this.createCharts();
  }

  /**
   * Render summary cards for key metrics
   */
  private renderSummaryCards(): string {
    const metrics = this.currentBenchmark!.finalMetrics;
    
    return `
      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-value">${metrics.averageSpeed.toFixed(2)}</div>
          <div class="card-label">Average Speed (m/s)</div>
          <div class="card-change ${this.getChangeClass('speed')}">${this.getChangeText('speed')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.globalThroughput.toFixed(1)}</div>
          <div class="card-label">Global Throughput (veh/min)</div>
          <div class="card-change ${this.getChangeClass('throughput')}">${this.getChangeText('throughput')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.averageWaitTime.toFixed(1)}</div>
          <div class="card-label">Avg Wait Time (s)</div>
          <div class="card-change ${this.getChangeClass('waitTime')}">${this.getChangeText('waitTime')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${(metrics.congestionIndex * 100).toFixed(1)}%</div>
          <div class="card-label">Congestion Index</div>
          <div class="card-change ${this.getChangeClass('congestion')}">${this.getChangeText('congestion')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.totalVehicles}</div>
          <div class="card-label">Total Vehicles</div>
          <div class="card-change">-</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.completedTrips}</div>
          <div class="card-label">Completed Trips</div>
          <div class="card-change">-</div>
        </div>
      </div>
    `;
  }

  /**
   * Get change class for metric comparison
   */
  private getChangeClass(metric: string): string {
    // For now, return neutral. In the future, this could compare with previous runs
    return 'neutral';
  }

  /**
   * Get change text for metric comparison
   */
  private getChangeText(metric: string): string {
    // For now, return no change. In the future, this could show actual changes
    return '-';
  }

  /**
   * Initialize event listeners for interactive elements
   */
  private initializeEventListeners(): void {
    // Export buttons
    document.getElementById('export-csv-btn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('export-json-btn')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('compare-runs-btn')?.addEventListener('click', () => this.showComparisonPanel());
    document.getElementById('validate-data-btn')?.addEventListener('click', () => this.showValidationPanel());

    // Table search and sort
    document.getElementById('lane-search')?.addEventListener('input', (e) => 
      this.filterTable('lane-metrics-table', (e.target as HTMLInputElement).value));
    document.getElementById('intersection-search')?.addEventListener('input', (e) => 
      this.filterTable('intersection-metrics-table', (e.target as HTMLInputElement).value));
    
    document.getElementById('lane-sort')?.addEventListener('change', (e) => 
      this.sortTable('lane-metrics-table', (e.target as HTMLSelectElement).value));
    document.getElementById('intersection-sort')?.addEventListener('change', (e) => 
      this.sortTable('intersection-metrics-table', (e.target as HTMLSelectElement).value));

    // Table header sorting
    document.querySelectorAll('#lane-metrics-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const sortKey = th.getAttribute('data-sort')!;
        this.sortTable('lane-metrics-table', sortKey);
      });
    });

    document.querySelectorAll('#intersection-metrics-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const sortKey = th.getAttribute('data-sort')!;
        this.sortTable('intersection-metrics-table', sortKey);
      });
    });

    // Comparison panel
    document.getElementById('close-comparison')?.addEventListener('click', () => {
      document.getElementById('comparison-panel')!.style.display = 'none';
    });

    document.getElementById('comparison-benchmark')?.addEventListener('change', (e) => {
      const selectedId = (e.target as HTMLSelectElement).value;
      if (selectedId) {
        this.showComparison(selectedId);
      }
    });
  }

  /**
   * Populate interactive tables with data
   */
  private populateTables(): void {
    this.populateLaneTable();
    this.populateIntersectionTable();
  }

  /**
   * Populate lane metrics table
   */
  private populateLaneTable(): void {
    const tbody = document.querySelector('#lane-metrics-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    Object.values(metrics.laneMetrics).forEach((lane: LaneDetailedMetrics) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${lane.laneId}</td>
        <td>${lane.averageSpeed.toFixed(2)}</td>
        <td>${lane.vehicleCount}</td>
        <td>${lane.throughput.toFixed(2)}</td>
        <td><span class="congestion-indicator" style="background-color: ${this.getCongestionColor(lane.congestionRate)}">${(lane.congestionRate * 100).toFixed(1)}%</span></td>
        <td>${lane.queueLength}</td>
        <td>${lane.averageWaitTime.toFixed(1)}</td>
        <td>${lane.totalVehiclesPassed}</td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Populate intersection metrics table
   */
  private populateIntersectionTable(): void {
    const tbody = document.querySelector('#intersection-metrics-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    Object.values(metrics.intersectionMetrics).forEach((intersection: IntersectionDetailedMetrics) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${intersection.intersectionId}</td>
        <td>${intersection.throughput.toFixed(2)}</td>
        <td>${intersection.averageWaitTime.toFixed(1)}</td>
        <td>${intersection.maxWaitTime.toFixed(1)}</td>
        <td>${intersection.averageQueueLength.toFixed(1)}</td>
        <td>${intersection.maxQueueLength}</td>
        <td><span class="congestion-indicator" style="background-color: ${this.getCongestionColor(intersection.congestionRate)}">${(intersection.congestionRate * 100).toFixed(1)}%</span></td>
        <td>${intersection.totalVehiclesPassed}</td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Get color for congestion rate visualization
   */
  private getCongestionColor(rate: number): string {
    if (rate < 0.3) return '#4CAF50'; // Green
    if (rate < 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  /**
   * Filter table based on search term
   */
  private filterTable(tableId: string, searchTerm: string): void {
    const table = document.getElementById(tableId)!;
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes(searchTerm.toLowerCase())) {
        (row as HTMLElement).style.display = '';
      } else {
        (row as HTMLElement).style.display = 'none';
      }
    });
  }

  /**
   * Sort table by specified column
   */
  private sortTable(tableId: string, sortKey: string): void {
    if (!sortKey) return;

    const table = document.getElementById(tableId)!;
    const tbody = table.querySelector('tbody')!;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const isNumeric = this.isNumericColumn(sortKey);
    
    rows.sort((a, b) => {
      const aValue = this.getCellValue(a, sortKey);
      const bValue = this.getCellValue(b, sortKey);
      
      if (isNumeric) {
        return parseFloat(bValue) - parseFloat(aValue); // Descending for numeric
      } else {
        return aValue.localeCompare(bValue); // Ascending for text
      }
    });
    
    rows.forEach(row => tbody.appendChild(row));
  }

  /**
   * Check if column should be sorted numerically
   */
  private isNumericColumn(sortKey: string): boolean {
    return [
      'averageSpeed', 'vehicleCount', 'throughput', 'congestionRate', 
      'queueLength', 'averageWaitTime', 'totalVehiclesPassed',
      'maxWaitTime', 'averageQueueLength', 'maxQueueLength'
    ].includes(sortKey);
  }

  /**
   * Get cell value for sorting
   */
  private getCellValue(row: Element, sortKey: string): string {
    const headers = Array.from(row.parentElement!.parentElement!.querySelectorAll('th[data-sort]'));
    const index = headers.findIndex(th => th.getAttribute('data-sort') === sortKey);
    
    if (index >= 0) {
      const cell = row.children[index];
      return cell.textContent?.replace(/[^\d.-]/g, '') || '0';
    }
    
    return '0';
  }

  /**
   * Create time-series charts
   */
  private createCharts(): void {
    this.createSpeedChart();
    this.createThroughputChart();
    this.createWaitTimeChart();
    this.createCongestionChart();
  }

  /**
   * Create speed over time chart
   */
  private createSpeedChart(): void {
    const ctx = document.getElementById('speed-chart') as HTMLCanvasElement;
    if (!ctx) return;

    const samples = this.currentBenchmark!.samples;
    const labels = samples.map((_, index) => `${index * 1}s`); // 1-second intervals
    const data = samples.map(sample => sample.averageSpeed);

    const config: ChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Average Speed (m/s)',
          data,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Average Speed Over Time',
            color: '#ffffff'
          },
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    };

    this.charts['speed'] = new Chart(ctx, config);
  }

  /**
   * Create throughput over time chart
   */
  private createThroughputChart(): void {
    const ctx = document.getElementById('throughput-chart') as HTMLCanvasElement;
    if (!ctx) return;

    const samples = this.currentBenchmark!.samples;
    const labels = samples.map((_, index) => `${index * 1}s`);
    const data = samples.map(sample => sample.globalThroughput);

    const config: ChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Global Throughput (veh/min)',
          data,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Global Throughput Over Time',
            color: '#ffffff'
          },
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    };

    this.charts['throughput'] = new Chart(ctx, config);
  }

  /**
   * Create wait time over time chart
   */
  private createWaitTimeChart(): void {
    const ctx = document.getElementById('wait-time-chart') as HTMLCanvasElement;
    if (!ctx) return;

    const samples = this.currentBenchmark!.samples;
    const labels = samples.map((_, index) => `${index * 1}s`);
    const avgWaitData = samples.map(sample => sample.averageWaitTime);
    const maxWaitData = samples.map(sample => sample.maxWaitTime);

    const config: ChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Average Wait Time (s)',
            data: avgWaitData,
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4
          },
          {
            label: 'Max Wait Time (s)',
            data: maxWaitData,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Wait Times Over Time',
            color: '#ffffff'
          },
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    };

    this.charts['waitTime'] = new Chart(ctx, config);
  }

  /**
   * Create congestion over time chart
   */
  private createCongestionChart(): void {
    const ctx = document.getElementById('congestion-chart') as HTMLCanvasElement;
    if (!ctx) return;

    const samples = this.currentBenchmark!.samples;
    const labels = samples.map((_, index) => `${index * 1}s`);
    const data = samples.map(sample => sample.congestionIndex * 100); // Convert to percentage

    const config: ChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Congestion Index (%)',
          data,
          borderColor: '#9C27B0',
          backgroundColor: 'rgba(156, 39, 176, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Congestion Index Over Time',
            color: '#ffffff'
          },
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            min: 0,
            max: 100
          }
        }
      }
    };

    this.charts['congestion'] = new Chart(ctx, config);
  }

  /**
   * Export current benchmark data as CSV
   */
  private exportCSV(): void {
    if (!this.currentBenchmark) return;

    const benchmark = this.currentBenchmark;
    let csv = 'Traffic Simulation Benchmark Results\n\n';
    
    // Summary information
    csv += 'Benchmark Summary\n';
    csv += `Name,${benchmark.name}\n`;
    csv += `Timestamp,${benchmark.timestamp}\n`;
    csv += `Duration,${benchmark.settings?.duration || 'Unknown'} seconds\n`;
    csv += `Traffic Control Model,${benchmark.settings?.trafficControlModel || 'Unknown'}\n`;
    csv += `Vehicle Count,${benchmark.settings?.carsNumber || 'Unknown'}\n\n`;
    
    // Key metrics
    const metrics = benchmark.finalMetrics;
    csv += 'Key Performance Metrics\n';
    csv += 'Metric,Value\n';
    csv += `Average Speed (m/s),${metrics.averageSpeed.toFixed(2)}\n`;
    csv += `Global Throughput (veh/min),${metrics.globalThroughput.toFixed(2)}\n`;
    csv += `Average Wait Time (s),${metrics.averageWaitTime.toFixed(2)}\n`;
    csv += `Max Wait Time (s),${metrics.maxWaitTime.toFixed(2)}\n`;
    csv += `Congestion Index,${metrics.congestionIndex.toFixed(3)}\n`;
    csv += `Total Vehicles,${metrics.totalVehicles}\n`;
    csv += `Completed Trips,${metrics.completedTrips}\n`;
    csv += `Total Stops,${metrics.totalStops}\n\n`;
    
    // Lane metrics
    csv += 'Lane Performance Metrics\n';
    csv += 'Lane ID,Average Speed (m/s),Vehicle Count,Throughput (veh/min),Congestion Rate,Queue Length,Average Wait Time (s),Total Vehicles Passed\n';
    Object.values(metrics.laneMetrics).forEach((lane: LaneDetailedMetrics) => {
      csv += `${lane.laneId},${lane.averageSpeed.toFixed(2)},${lane.vehicleCount},${lane.throughput.toFixed(2)},${lane.congestionRate.toFixed(3)},${lane.queueLength},${lane.averageWaitTime.toFixed(2)},${lane.totalVehiclesPassed}\n`;
    });
    csv += '\n';
    
    // Intersection metrics
    csv += 'Intersection Performance Metrics\n';
    csv += 'Intersection ID,Throughput (veh/min),Average Wait Time (s),Max Wait Time (s),Average Queue Length,Max Queue Length,Congestion Rate,Total Vehicles Passed\n';
    Object.values(metrics.intersectionMetrics).forEach((intersection: IntersectionDetailedMetrics) => {
      csv += `${intersection.intersectionId},${intersection.throughput.toFixed(2)},${intersection.averageWaitTime.toFixed(2)},${intersection.maxWaitTime.toFixed(2)},${intersection.averageQueueLength.toFixed(2)},${intersection.maxQueueLength},${intersection.congestionRate.toFixed(3)},${intersection.totalVehiclesPassed}\n`;
    });
    csv += '\n';
    
    // Time series data
    if (benchmark.samples && benchmark.samples.length > 0) {
      csv += 'Time Series Data\n';
      csv += 'Time (s),Average Speed (m/s),Global Throughput (veh/min),Average Wait Time (s),Max Wait Time (s),Congestion Index,Active Vehicles,Completed Trips\n';
      benchmark.samples.forEach((sample, index) => {
        csv += `${index},${sample.averageSpeed.toFixed(2)},${sample.globalThroughput.toFixed(2)},${sample.averageWaitTime.toFixed(2)},${sample.maxWaitTime.toFixed(2)},${sample.congestionIndex.toFixed(3)},${sample.activeVehicles},${sample.completedTrips}\n`;
      });
    }
    
    // Download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `benchmark-${benchmark.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('CSV exported successfully', 'success');
  }

  /**
   * Export current benchmark data as JSON
   */
  private exportJSON(): void {
    if (!this.currentBenchmark) return;

    const exportData = {
      metadata: {
        exportTimestamp: new Date().toISOString(),
        version: '1.0.0',
        description: 'Traffic Simulation Benchmark Results'
      },
      benchmark: this.currentBenchmark
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `benchmark-${this.currentBenchmark.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('JSON exported successfully', 'success');
  }

  /**
   * Show comparison panel
   */
  private showComparisonPanel(): void {
    const panel = document.getElementById('comparison-panel')!;
    const select = document.getElementById('comparison-benchmark') as HTMLSelectElement;
    
    // Populate comparison options
    select.innerHTML = '<option value="">Select benchmark to compare...</option>';
    this.benchmarkHistory.forEach(benchmark => {
      if (benchmark.id !== this.currentBenchmark?.id) {
        const option = document.createElement('option');
        option.value = benchmark.id;
        option.textContent = `${benchmark.name} (${new Date(benchmark.timestamp).toLocaleDateString()})`;
        select.appendChild(option);
      }
    });
    
    panel.style.display = 'block';
  }

  /**
   * Show comparison between two benchmarks
   */
  private showComparison(compareId: string): void {
    const compareRun = this.benchmarkHistory.find(b => b.id === compareId);
    if (!compareRun || !this.currentBenchmark) return;

    const content = document.getElementById('comparison-content')!;
    const current = this.currentBenchmark.finalMetrics;
    const compare = compareRun.finalMetrics;
    
    content.innerHTML = `
      <div class="comparison-grid">
        <div class="comparison-section">
          <h5>Performance Comparison</h5>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Compare</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderComparisonRow('Average Speed (m/s)', current.averageSpeed, compare.averageSpeed, true)}
              ${this.renderComparisonRow('Global Throughput (veh/min)', current.globalThroughput, compare.globalThroughput, true)}
              ${this.renderComparisonRow('Average Wait Time (s)', current.averageWaitTime, compare.averageWaitTime, false)}
              ${this.renderComparisonRow('Congestion Index', current.congestionIndex, compare.congestionIndex, false)}
              ${this.renderComparisonRow('Completed Trips', current.completedTrips, compare.completedTrips, true)}
              ${this.renderComparisonRow('Total Stops', current.totalStops, compare.totalStops, false)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Render a comparison row for the comparison table
   */
  private renderComparisonRow(label: string, current: number, compare: number, higherIsBetter: boolean): string {
    const diff = current - compare;
    const diffPercent = compare !== 0 ? (diff / compare) * 100 : 0;
    const isPositive = diff > 0;
    const isBetter = higherIsBetter ? isPositive : !isPositive;
    
    const diffClass = diff === 0 ? 'neutral' : (isBetter ? 'positive' : 'negative');
    const diffSymbol = diff > 0 ? '+' : '';
    
    return `
      <tr>
        <td>${label}</td>
        <td>${current.toFixed(2)}</td>
        <td>${compare.toFixed(2)}</td>
        <td class="diff-${diffClass}">
          ${diffSymbol}${diff.toFixed(2)} (${diffSymbol}${diffPercent.toFixed(1)}%)
        </td>
      </tr>
    `;
  }

  /**
   * Show validation panel
   */
  private showValidationPanel(): void {
    const panel = document.getElementById('validation-panel')!;
    const content = document.getElementById('validation-content')!;
    
    if (this.currentBenchmark && this.currentBenchmark.validation) {
      content.innerHTML = this.currentBenchmark.validation;
    } else {
      content.innerHTML = '<div class="validation-message">No validation data available</div>';
    }
    
    panel.style.display = 'block';
  }

  /**
   * Add benchmark to history
   */
  private addToBenchmarkHistory(benchmark: BenchmarkRun): void {
    // Remove existing entry with same ID
    this.benchmarkHistory = this.benchmarkHistory.filter(b => b.id !== benchmark.id);
    
    // Add to beginning of array
    this.benchmarkHistory.unshift(benchmark);
    
    // Keep only last 10 runs
    if (this.benchmarkHistory.length > 10) {
      this.benchmarkHistory = this.benchmarkHistory.slice(0, 10);
    }
    
    // Save to localStorage
    this.saveBenchmarkHistory();
  }

  /**
   * Load benchmark history from localStorage
   */
  private loadBenchmarkHistory(): void {
    try {
      const stored = localStorage.getItem('kpi_benchmark_history');
      if (stored) {
        this.benchmarkHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load benchmark history:', error);
      this.benchmarkHistory = [];
    }
  }

  /**
   * Save benchmark history to localStorage
   */
  private saveBenchmarkHistory(): void {
    try {
      localStorage.setItem('kpi_benchmark_history', JSON.stringify(this.benchmarkHistory));
    } catch (error) {
      console.warn('Failed to save benchmark history:', error);
    }
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '10000';
      document.body.appendChild(container);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.marginBottom = '10px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.transition = 'all 0.3s ease';
    
    container.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Destroy the component and clean up resources
   */
  public destroy(): void {
    // Destroy all charts
    Object.values(this.charts).forEach(chart => {
      chart.destroy();
    });
    this.charts = {};
    
    // Clear container
    this.container.innerHTML = '';
  }
}
