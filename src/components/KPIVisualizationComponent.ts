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
import { 
  SimulationMetrics, 
  LaneDetailedMetrics, 
  IntersectionDetailedMetrics,
  EmissionMetrics,
  UtilizationMetrics,
  DensityMetrics,
  LevelOfServiceMetrics,
  QueueMetrics
} from '../model/kpi-collector';
import { sessionAnalyticsStorage } from '../lib/storage/SessionAnalyticsStorage';

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
  private isAddedToAnalytics: boolean = false;

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
    
    // Check if this benchmark is already in analytics
    this.isAddedToAnalytics = sessionAnalyticsStorage.isBenchmarkInAnalytics(benchmarkData.id);
    
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

    // Clean up any existing fullscreen modals first
    const existingModals = document.querySelectorAll('.fullscreen-modal');
    existingModals.forEach(modal => {
      modal.parentElement?.removeChild(modal);
    });
    
    // Hide any existing benchmark dialogs
    const existingDialogs = document.querySelectorAll('.benchmark-dialog');
    existingDialogs.forEach(dialog => {
      (dialog as HTMLElement).style.display = 'none';
    });

    // Create fullscreen modal container
    this.container.innerHTML = `
      <div class="fullscreen-modal">
        <div class="fullscreen-modal-content">
          <!-- Fullscreen Header -->
          <div class="fullscreen-modal-header">
            <h3>KPI Benchmark Results</h3>
            <div class="kpi-controls">
              <button id="add-to-analytics-btn" class="btn ${this.isAddedToAnalytics ? 'btn-success' : 'btn-primary'} btn-sm" ${this.isAddedToAnalytics ? 'disabled' : ''}>
                ${this.isAddedToAnalytics ? '✅ Added to Analytics' : '📈 Add to Analytics'}
              </button>
              <button id="export-csv-btn" class="btn btn-success btn-sm">📄 Export CSV</button>
              <button id="export-json-btn" class="btn btn-info btn-sm">📋 Export JSON</button>
              <button id="validate-data-btn" class="btn btn-secondary btn-sm">✓ Validate Data</button>
              <button id="close-fullscreen-btn" class="fullscreen-modal-close">Close</button>
            </div>
          </div>
          
          <!-- Fullscreen Body -->
          <div class="fullscreen-modal-body">
            <div class="kpi-visualization"

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
          <!-- Enhanced KPI Summary Table -->
          <div class="table-section">
            <h4>Enhanced KPI Summary</h4>
            <div class="table-wrapper">
              <table id="enhanced-kpi-table" class="interactive-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

          <!-- Emissions and Fuel Table -->
          <div class="table-section">
            <h4>Emissions and Fuel Consumption</h4>
            <div class="table-wrapper">
              <table id="emissions-table" class="interactive-table">
                <thead>
                  <tr>
                    <th>Emission Type</th>
                    <th>Total</th>
                    <th>Per Vehicle Average</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

          <!-- Level of Service Table -->
          <div class="table-section">
            <h4>Level of Service (LOS) Assessment</h4>
            <div class="table-controls">
              <input type="text" id="los-search" placeholder="Search segments..." class="form-control">
              <select id="los-filter" class="form-control">
                <option value="">All LOS Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="D">Grade D</option>
                <option value="E">Grade E</option>
                <option value="F">Grade F</option>
              </select>
            </div>
            <div class="table-wrapper">
              <table id="los-table" class="interactive-table">
                <thead>
                  <tr>
                    <th data-sort="segmentId">Segment ID</th>
                    <th data-sort="los">LOS Grade</th>
                    <th data-sort="averageDelay">Avg Delay (s)</th>
                    <th data-sort="qualityScore">Quality Score</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

          <!-- Intersection Utilization Table -->
          <div class="table-section">
            <h4>Intersection Utilization Rates</h4>
            <div class="table-wrapper">
              <table id="utilization-table" class="interactive-table">
                <thead>
                  <tr>
                    <th data-sort="intersectionId">Intersection ID</th>
                    <th data-sort="utilizationRate">Utilization Rate (%)</th>
                    <th data-sort="activeTime">Active Time (s)</th>
                    <th data-sort="idleTime">Idle Time (s)</th>
                    <th data-sort="peakUtilization">Peak Utilization (%)</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

          <!-- Vehicle Density Table -->
          <div class="table-section">
            <h4>Vehicle Density Metrics</h4>
            <div class="table-wrapper">
              <table id="density-table" class="interactive-table">
                <thead>
                  <tr>
                    <th data-sort="roadId">Road ID</th>
                    <th data-sort="averageDensity">Avg Density (veh/km)</th>
                    <th data-sort="maxDensity">Max Density (veh/km)</th>
                    <th data-sort="timeAboveThreshold">Time Above Threshold (%)</th>
                    <th data-sort="congestionThreshold">Congestion Threshold</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

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
          </div>
        </div>
      </div>
    `;

    // Clear any existing charts before creating new ones
    Object.values(this.charts).forEach(chart => {
      chart.destroy();
    });
    this.charts = {};

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
        <div class="summary-card">
          <div class="card-value">${metrics.averageVehicleDelay.toFixed(1)}</div>
          <div class="card-label">Avg Vehicle Delay (s)</div>
          <div class="card-change ${this.getChangeClass('delay')}">${this.getChangeText('delay')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.averageTravelTime.toFixed(1)}</div>
          <div class="card-label">Avg Travel Time (s)</div>
          <div class="card-change ${this.getChangeClass('travelTime')}">${this.getChangeText('travelTime')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.averageStopFrequency.toFixed(1)}</div>
          <div class="card-label">Avg Stop Frequency</div>
          <div class="card-change ${this.getChangeClass('stops')}">${this.getChangeText('stops')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.totalEmissions.co2Emissions.toFixed(2)}</div>
          <div class="card-label">Total CO₂ (kg)</div>
          <div class="card-change ${this.getChangeClass('emissions')}">${this.getChangeText('emissions')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.totalEmissions.fuelConsumption.toFixed(2)}</div>
          <div class="card-label">Total Fuel (L)</div>
          <div class="card-change ${this.getChangeClass('fuel')}">${this.getChangeText('fuel')}</div>
        </div>
        <div class="summary-card">
          <div class="card-value">${metrics.queueMetrics.globalMaxQueueLength}</div>
          <div class="card-label">Max Queue Length</div>
          <div class="card-change ${this.getChangeClass('queue')}">${this.getChangeText('queue')}</div>
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
    // Close fullscreen button
    document.getElementById('close-fullscreen-btn')?.addEventListener('click', () => this.closeFullscreen());
    
    // Add to analytics button
    document.getElementById('add-to-analytics-btn')?.addEventListener('click', () => this.addToAnalytics());
    
    // Export buttons
    document.getElementById('export-csv-btn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('export-json-btn')?.addEventListener('click', () => this.exportJSON());
    document.getElementById('validate-data-btn')?.addEventListener('click', () => this.showValidationPanel());

    // Table search and sort
    document.getElementById('lane-search')?.addEventListener('input', (e) => 
      this.filterTable('lane-metrics-table', (e.target as HTMLInputElement).value));
    document.getElementById('intersection-search')?.addEventListener('input', (e) => 
      this.filterTable('intersection-metrics-table', (e.target as HTMLInputElement).value));
    document.getElementById('los-search')?.addEventListener('input', (e) => 
      this.filterTable('los-table', (e.target as HTMLInputElement).value));
    
    document.getElementById('lane-sort')?.addEventListener('change', (e) => 
      this.sortTable('lane-metrics-table', (e.target as HTMLSelectElement).value));
    document.getElementById('intersection-sort')?.addEventListener('change', (e) => 
      this.sortTable('intersection-metrics-table', (e.target as HTMLSelectElement).value));
    document.getElementById('los-filter')?.addEventListener('change', (e) => 
      this.filterTableByValue('los-table', 1, (e.target as HTMLSelectElement).value));

    // Table header sorting for all tables
    const sortableTables = [
      'enhanced-kpi-table', 'emissions-table', 'los-table', 
      'utilization-table', 'density-table', 'lane-metrics-table', 'intersection-metrics-table'
    ];
    
    sortableTables.forEach(tableId => {
      document.querySelectorAll(`#${tableId} th[data-sort]`).forEach(th => {
        th.addEventListener('click', () => {
          const sortKey = th.getAttribute('data-sort')!;
          this.sortTable(tableId, sortKey);
        });
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
    this.populateEnhancedKPITable();
    this.populateEmissionsTable();
    this.populateLevelOfServiceTable();
    this.populateUtilizationTable();
    this.populateDensityTable();
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
   * Populate enhanced KPI summary table
   */
  private populateEnhancedKPITable(): void {
    const tbody = document.querySelector('#enhanced-kpi-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    const kpiData = [
      { metric: 'Average Vehicle Delay', value: metrics.averageVehicleDelay.toFixed(2), unit: 'seconds', description: 'Average time vehicles spend delayed due to traffic conditions' },
      { metric: 'Average Travel Time', value: metrics.averageTravelTime.toFixed(2), unit: 'seconds', description: 'Average complete journey time from origin to destination' },
      { metric: 'Average Stop Frequency', value: metrics.averageStopFrequency.toFixed(2), unit: 'stops/vehicle', description: 'Average number of stops made by each vehicle during its journey' },
      { metric: 'Global Max Queue Length', value: metrics.queueMetrics.globalMaxQueueLength.toString(), unit: 'vehicles', description: 'Maximum queue length observed across all intersections and lanes' },
      { metric: 'Global Average Queue Length', value: metrics.queueMetrics.globalAverageQueueLength.toFixed(2), unit: 'vehicles', description: 'Average queue length across all intersections and lanes' },
      { metric: 'Total Queue Time', value: (metrics.queueMetrics.totalQueueTime / 60).toFixed(2), unit: 'vehicle-minutes', description: 'Total time all vehicles spent waiting in queues' }
    ];
    
    kpiData.forEach(kpi => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${kpi.metric}</strong></td>
        <td>${kpi.value}</td>
        <td>${kpi.unit}</td>
        <td>${kpi.description}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  /**
   * Populate emissions and fuel consumption table
   */
  private populateEmissionsTable(): void {
    const tbody = document.querySelector('#emissions-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    const emissionData = [
      { 
        type: 'CO₂ Emissions', 
        total: metrics.totalEmissions.co2Emissions.toFixed(3), 
        average: metrics.averageEmissionsPerVehicle.co2Emissions.toFixed(3), 
        unit: 'kg' 
      },
      { 
        type: 'Fuel Consumption', 
        total: metrics.totalEmissions.fuelConsumption.toFixed(3), 
        average: metrics.averageEmissionsPerVehicle.fuelConsumption.toFixed(3), 
        unit: 'liters' 
      },
      { 
        type: 'NOx Emissions', 
        total: metrics.totalEmissions.noxEmissions.toFixed(3), 
        average: metrics.averageEmissionsPerVehicle.noxEmissions.toFixed(3), 
        unit: 'kg' 
      },
      { 
        type: 'PM Emissions', 
        total: metrics.totalEmissions.pmEmissions.toFixed(3), 
        average: metrics.averageEmissionsPerVehicle.pmEmissions.toFixed(3), 
        unit: 'kg' 
      },
      { 
        type: 'Total Environmental Impact', 
        total: metrics.totalEmissions.totalEmissions.toFixed(3), 
        average: metrics.averageEmissionsPerVehicle.totalEmissions.toFixed(3), 
        unit: 'impact units' 
      }
    ];
    
    emissionData.forEach(emission => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${emission.type}</strong></td>
        <td>${emission.total}</td>
        <td>${emission.average}</td>
        <td>${emission.unit}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  /**
   * Populate Level of Service table
   */
  private populateLevelOfServiceTable(): void {
    const tbody = document.querySelector('#los-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    Object.entries(metrics.levelOfService).forEach(([segmentId, los]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${segmentId}</td>
        <td><span class="los-grade los-${los.los}">${los.los}</span></td>
        <td>${los.averageDelay.toFixed(2)}</td>
        <td>${los.qualityScore}</td>
        <td>${los.description}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  /**
   * Populate intersection utilization table
   */
  private populateUtilizationTable(): void {
    const tbody = document.querySelector('#utilization-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    Object.entries(metrics.intersectionUtilizationRate).forEach(([intersectionId, util]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${intersectionId}</td>
        <td><span class="utilization-indicator" style="background-color: ${this.getUtilizationColor(util.utilizationRate)}">${util.utilizationRate.toFixed(1)}%</span></td>
        <td>${util.activeTime.toFixed(1)}</td>
        <td>${util.idleTime.toFixed(1)}</td>
        <td>${util.peakUtilization.toFixed(1)}%</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  /**
   * Populate vehicle density table
   */
  private populateDensityTable(): void {
    const tbody = document.querySelector('#density-table tbody')!;
    const metrics = this.currentBenchmark!.finalMetrics;
    
    tbody.innerHTML = '';
    
    Object.entries(metrics.vehicleDensity).forEach(([roadId, density]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${roadId}</td>
        <td>${density.averageDensity.toFixed(2)}</td>
        <td>${density.maxDensity.toFixed(2)}</td>
        <td><span class="density-indicator" style="background-color: ${this.getDensityColor(density.timeAboveThreshold)}">${(density.timeAboveThreshold * 100).toFixed(1)}%</span></td>
        <td>${density.congestionThreshold}</td>
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
   * Get color for utilization rate visualization
   */
  private getUtilizationColor(rate: number): string {
    if (rate < 30) return '#FFC107'; // Yellow - low utilization
    if (rate < 70) return '#4CAF50'; // Green - good utilization
    if (rate < 90) return '#FF9800'; // Orange - high utilization
    return '#F44336'; // Red - overutilization
  }
  
  /**
   * Get color for density visualization
   */
  private getDensityColor(timeAboveThreshold: number): string {
    if (timeAboveThreshold < 0.2) return '#4CAF50'; // Green - rarely congested
    if (timeAboveThreshold < 0.5) return '#FF9800'; // Orange - sometimes congested
    return '#F44336'; // Red - frequently congested
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
   * Filter table by value in specific column
   */
  private filterTableByValue(tableId: string, columnIndex: number, filterValue: string): void {
    if (!filterValue) {
      // Show all rows if no filter
      this.filterTable(tableId, '');
      return;
    }
    
    const table = document.getElementById(tableId)!;
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const cell = row.children[columnIndex];
      const cellValue = cell?.textContent?.trim() || '';
      
      if (cellValue === filterValue) {
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
      'maxWaitTime', 'averageQueueLength', 'maxQueueLength',
      'utilizationRate', 'activeTime', 'idleTime', 'peakUtilization',
      'averageDensity', 'maxDensity', 'timeAboveThreshold', 'congestionThreshold',
      'averageDelay', 'qualityScore', 'value'
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
   * Add current benchmark to session analytics
   */
  private addToAnalytics(): void {
    if (!this.currentBenchmark || this.isAddedToAnalytics) {
      return;
    }

    try {
      const analyticsEntry = sessionAnalyticsStorage.addBenchmarkToAnalytics(this.currentBenchmark);
      this.isAddedToAnalytics = true;
      
      console.log('📈 [Analytics] Benchmark added to analytics:', {
        analyticsId: analyticsEntry.analyticsId,
        benchmarkName: analyticsEntry.name,
        sessionId: analyticsEntry.sessionId
      });

      // Update the button state
      const addToAnalyticsBtn = document.getElementById('add-to-analytics-btn') as HTMLButtonElement;
      if (addToAnalyticsBtn) {
        addToAnalyticsBtn.disabled = true;
        addToAnalyticsBtn.className = 'btn btn-success btn-sm';
        addToAnalyticsBtn.innerHTML = '✅ Added to Analytics';
      }

      // Show success notification
      this.showToast('Benchmark added to Analytics successfully!', 'success');

      // Show navigation option
      setTimeout(() => {
        if (confirm('Benchmark added to Analytics! Would you like to view the Analytics page now?')) {
          // Navigate to analytics page
          if ((window as any).router) {
            (window as any).router.navigate('/analytics');
          } else {
            // Fallback: try to navigate directly
            window.location.href = '/analytics';
          }
        }
      }, 500);

    } catch (error) {
      console.error('📈 [Analytics] Failed to add benchmark to analytics:', error);
      this.showToast('Failed to add benchmark to Analytics', 'error');
    }
  }

  /**
   * Close the fullscreen KPI benchmark results dialog
   */
  private closeFullscreen(): void {
    // Destroy all charts to prevent memory leaks
    Object.values(this.charts).forEach(chart => {
      chart.destroy();
    });
    
    // Clear the charts collection
    this.charts = {};
    
    // Remove the KPI visualization from the DOM
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Notify any parent components that might need to know the dialog was closed
    const closeEvent = new CustomEvent('kpi-dialog-closed');
    document.dispatchEvent(closeEvent);
    
    // Find and remove any fullscreen modals
    const existingModals = document.querySelectorAll('.fullscreen-modal');
    existingModals.forEach(modal => {
      modal.parentElement?.removeChild(modal);
    });
    
    // Remove any benchmark dialogs
    const benchmarkDialogs = document.querySelectorAll('.benchmark-dialog');
    benchmarkDialogs.forEach(dialog => {
      dialog.parentElement?.removeChild(dialog);
    });
    
    // Also remove by ID to ensure complete cleanup
    const dialogById = document.getElementById('benchmark-results-dialog');
    if (dialogById && dialogById.parentElement) {
      dialogById.parentElement.removeChild(dialogById);
    }
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
