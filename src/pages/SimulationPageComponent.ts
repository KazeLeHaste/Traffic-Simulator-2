import { appState } from '../core/AppState';
import World = require('../model/world');
import Visualizer = require('../visualizer/visualizer');
import _ = require('underscore');
import { kpiCollector } from '../model/kpi-collector';
import { trafficControlStrategyManager } from '../model/traffic-control/TrafficControlStrategyManager';

/**
 * Simulation page for running traffic simulations
 */
export class SimulationPageComponent {
  private container: HTMLElement;
  private world: any;
  private visualizer: any;
  private layouts: any[] = [];
  private isRunning: boolean = false;
  private analytics: any = {
    totalCars: 0,
    averageSpeed: 0,
    totalIntersections: 0,
    totalRoads: 0,
    simulationTime: 0
  };
  private analyticsInterval: number | null = null;
  private selectedTrafficControlModel: string = 'fixed-timing'; // Default model
  
  // Benchmark related properties
  private isBenchmarkRunning: boolean = false;
  private benchmarkDuration: number = 60; // Default: 60 simulation seconds
  private benchmarkTimer: number | null = null;
  private benchmarkStartTime: number = 0;
  private benchmarkResults: any = {};
  private benchmarkIntervalSamples: any[] = [];
  private benchmarkSettings: any = {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private async init() {
    // Apply styles first to prevent theme flicker
    this.addStyles();
    
    await this.loadLayouts();
    this.render();
    
    // Add event listeners with a small delay to ensure DOM is fully rendered
    setTimeout(() => this.addEventListeners(), 100);
    
    await this.initializeSimulation();
    
    // Check if there's a selected layout to load (from home page)
    if (appState.selectedLayoutId) {
      const layoutId = appState.selectedLayoutId;
      // Clear the selected layout so it doesn't reload on next navigation
      appState.selectedLayoutId = null;
      // Load the selected layout
      await this.loadLayoutById(layoutId);
    }
  }

  private async loadLayouts() {
    try {
      this.layouts = await appState.storage.loadAllLayouts();
    } catch (error) {
      console.error('Failed to load layouts:', error);
      this.layouts = [];
    }
  }

  private render() {
    this.container.innerHTML = `
      <div class="simulation-page">
        <div class="page-header">
          <h2>Traffic Simulation</h2>
          <p>Run and analyze traffic simulations on your road networks.</p>
        </div>
        
        <div class="simulation-content">
          <div class="sidebar">
            <!-- Layout Selection -->
            <div class="panel">
              <h3>Layout Selection</h3>
              <button id="load-layout" class="btn btn-primary btn-block">
                📁 Load Layout
              </button>
              
              <div class="layout-status">
                <small class="text-muted">
                  ${this.layouts.length > 0 
                    ? `${this.layouts.length} saved layout(s) available` 
                    : 'No saved layouts found. Create one in the Builder first.'
                  }
                </small>
              </div>
            </div>
            
            <!-- Simulation Controls -->
            <div class="panel">
              <h3>Simulation Controls</h3>
              
              <div class="control-group">
                <button id="toggle-simulation" class="btn btn-success btn-block">
                  ▶️ Start Simulation
                </button>
              </div>
              
              <div class="control-group">
                <button id="reset-simulation" class="btn btn-info btn-block">
                  🔄 Reset Simulation
                </button>
              </div>
              
              <div class="control-group">
                <button id="run-benchmark" class="btn btn-primary btn-block">
                  📊 Run KPI Benchmark
                </button>
              </div>
              
              <div class="control-group">
                <label for="traffic-control-model">Traffic Control Model:</label>
                <div class="model-status">
                  <span class="active-model-indicator" id="active-model-indicator">Fixed Timing</span>
                </div>
                <select id="traffic-control-model" class="form-control">
                  <option value="fixed-timing">Fixed Timing</option>
                  <option value="adaptive-timing">Adaptive Timing</option>
                  <option value="traffic-enforcer">Traffic Enforcer</option>
                  <option value="all-red-flashing">All Red Flashing</option>
                </select>
              </div>
              
              <div class="control-group">
                <label for="cars-range">Number of Cars: <span id="cars-value">100</span></label>
                <input type="range" id="cars-range" min="0" max="200" value="100" class="slider">
              </div>
              
              <div class="control-group">
                <label for="time-factor-range">Time Factor: <span id="time-factor-value">1.0</span>x</label>
                <input type="range" id="time-factor-range" min="0.1" max="5" step="0.1" value="1" class="slider">
              </div>
            </div>
            
            <!-- Analytics Panel -->
            <div class="panel">
              <h3>Analytics</h3>
              <button id="toggle-analytics" class="btn btn-info btn-block">
                Show Analytics
              </button>
              
              <div id="analytics-panel" class="analytics" style="display: none;">
                <div class="analytics-section">
                  <h4>Simulation Stats</h4>
                  
                  <div class="metric">
                    <span class="label">Active Cars:</span>
                    <span class="value" id="active-cars">0</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Total Vehicles:</span>
                    <span class="value" id="total-vehicles">0</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Completed Trips:</span>
                    <span class="value" id="completed-trips">0</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Simulation Time:</span>
                    <span class="value" id="simulation-time">0.0s</span>
                  </div>
                </div>
                
                <div class="analytics-section">
                  <h4>Performance Metrics</h4>
                  
                  <div class="metric">
                    <span class="label">Average Speed:</span>
                    <span class="value" id="average-speed">0.00 m/s</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Avg Wait Time:</span>
                    <span class="value" id="avg-wait-time">0.0s</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Max Wait Time:</span>
                    <span class="value" id="max-wait-time">0.0s</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Total Stops:</span>
                    <span class="value" id="total-stops">0</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Stopped Vehicles:</span>
                    <span class="value" id="stopped-vehicles">0</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Global Throughput:</span>
                    <span class="value" id="global-throughput">0.00 veh/min</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Congestion Index:</span>
                    <span class="value" id="congestion-index">0.00</span>
                  </div>
                </div>
                
                <div class="analytics-section">
                  <h4>Network Stats</h4>
                  
                  <div class="metric">
                    <span class="label">Intersections:</span>
                    <span class="value" id="total-intersections">0</span>
                  </div>
                  
                  <div class="metric">
                    <span class="label">Roads:</span>
                    <span class="value" id="total-roads">0</span>
                  </div>
                </div>
                
                <div class="analytics-section">
                  <h4>Lane Metrics</h4>
                  <button id="toggle-lane-metrics" class="btn btn-sm">Show/Hide Lane Metrics</button>
                  
                  <div id="lane-metrics-container" class="metrics-table-container" style="display: none;">
                    <table class="metrics-table">
                      <thead>
                        <tr>
                          <th>Lane ID</th>
                          <th>Avg Speed</th>
                          <th>Vehicles</th>
                          <th>Congestion</th>
                          <th>Throughput</th>
                          <th>Total Passed</th>
                          <th>Queue Length</th>
                        </tr>
                      </thead>
                      <tbody id="lane-metrics-body">
                        <!-- Lanes will be populated here -->
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div class="analytics-section">
                  <h4>Intersection Metrics</h4>
                  <button id="toggle-intersection-metrics" class="btn btn-sm">Show/Hide Intersection Metrics</button>
                  
                  <div id="intersection-metrics-container" class="metrics-table-container" style="display: none;">
                    <table class="metrics-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Throughput</th>
                          <th>Avg Wait</th>
                          <th>Max Wait</th>
                          <th>Avg Queue</th>
                          <th>Total Passed</th>
                          <th>Congestion</th>
                        </tr>
                      </thead>
                      <tbody id="intersection-metrics-body">
                        <!-- Intersections will be populated here -->
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div class="analytics-actions">
                  <button id="export-metrics" class="btn btn-sm btn-success">Export CSV</button>
                  <button id="validate-metrics" class="btn btn-sm btn-info">Validate Metrics</button>
                </div>
                
                <!-- Developer Tools Section -->
                <div class="analytics-section analytics-dev-tools">
                  <h4>Developer Tools</h4>
                  <button id="validate-kpis" class="btn btn-sm btn-secondary btn-block">
                    🔍 Validate KPI Collection
                  </button>
                  <div class="validation-output" id="validation-output" style="display: none;">
                    <div id="validation-html-results" class="validation-formatted"></div>
                    <h4>Debug Log Output:</h4>
                    <pre id="validation-results">No validation results yet.</pre>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Instructions -->
            <div class="panel">
              <h3>Instructions</h3>
              <ul class="instructions">
                <li>Select a saved layout or use the current one</li>
                <li>Adjust the number of cars and simulation speed</li>
                <li>Click Start to begin the simulation</li>
                <li>Monitor real-time analytics</li>
                <li>Save analytics for later analysis</li>
              </ul>
            </div>
          </div>
          
          <div class="visualizer-area">
            <canvas id="simulation-canvas"></canvas>
          </div>
        </div>
      </div>
      
      <!-- KPI Benchmark Modal (hidden by default) -->
      <div id="benchmark-modal" class="modal" style="display: none;">
        <div class="modal-content benchmark-modal-content">
          <div class="modal-header">
            <span class="close">&times;</span>
            <h2>KPI Benchmark Configuration</h2>
          </div>
          <div class="modal-body">
            <div class="benchmark-settings">
              <div class="form-group">
                <label for="benchmark-layout">Layout:</label>
                <select id="benchmark-layout" class="form-control">
                  <option value="">Current Layout</option>
                  <!-- Layout options will be populated dynamically -->
                </select>
                <small class="setting-description">Select a layout to use for the benchmark (or use current layout)</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-duration">Simulation Duration (seconds):</label>
                <input type="number" id="benchmark-duration" class="form-control" min="10" max="300" value="60">
                <small class="setting-description">How long the simulation should run (in simulation seconds)</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-model">Traffic Control Model:</label>
                <select id="benchmark-model" class="form-control">
                  <option value="fixed-timing">Fixed Timing</option>
                  <option value="adaptive-timing">Adaptive Timing</option>
                  <option value="traffic-enforcer">Traffic Enforcer</option>
                  <option value="all-red-flashing">All Red Flashing</option>
                </select>
                <small class="setting-description">Traffic control model to test during benchmark</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-cars">Number of Vehicles:</label>
                <input type="number" id="benchmark-cars" class="form-control" min="10" max="200" value="100">
                <small class="setting-description">Number of vehicles to simulate</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-time-factor">Time Factor:</label>
                <input type="number" id="benchmark-time-factor" class="form-control" min="0.1" max="5" step="0.1" value="2">
                <small class="setting-description">Speed of simulation (higher = faster)</small>
              </div>
              
              <div class="benchmark-options">
                <div class="option">
                  <input type="checkbox" id="benchmark-repeat" checked>
                  <label for="benchmark-repeat">Collect continuous data</label>
                </div>
                <div class="option">
                  <input type="checkbox" id="benchmark-export" checked>
                  <label for="benchmark-export">Export results after completion</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-benchmark">Cancel</button>
            <button class="btn btn-primary" id="start-benchmark">Start Benchmark</button>
          </div>
        </div>
      </div>
      
      <!-- Benchmark Results Modal (hidden by default) -->
      <div id="benchmark-results-modal" class="modal" style="display: none;">
        <div class="modal-content benchmark-results-content">
          <div class="modal-header">
            <span class="close">&times;</span>
            <h2>KPI Benchmark Results</h2>
          </div>
          <div class="modal-body">
            <div id="benchmark-summary" class="benchmark-summary">
              <!-- Summary info will be added here dynamically -->
            </div>
            <div id="benchmark-metrics" class="benchmark-metrics">
              <!-- Metrics will be added here dynamically -->
            </div>
            <div id="benchmark-charts" class="benchmark-charts">
              <!-- Charts will be added here dynamically -->
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="close-benchmark-results">Close</button>
            <button class="btn btn-success" id="export-benchmark-results">Export Results (CSV)</button>
          </div>
        </div>
      </div>
    `;
  }

  private addEventListeners() {
    // Console log to ensure this runs
    console.log('Setting up SimulationPage event listeners');
    
    // Simulation toggle
    document.getElementById('toggle-simulation')?.addEventListener('click', () => this.toggleSimulation());
    
    // Reset simulation
    document.getElementById('reset-simulation')?.addEventListener('click', () => this.resetSimulation());
    
    // Run KPI Benchmark
    document.getElementById('run-benchmark')?.addEventListener('click', () => this.showBenchmarkModal());
    
    // Toggle analytics panel
    document.getElementById('toggle-analytics')?.addEventListener('click', () => {
      const panel = document.getElementById('analytics-panel');
      const btn = document.getElementById('toggle-analytics');
      
      const isHidden = panel?.style.display === 'none';
      panel!.style.display = isHidden ? 'block' : 'none';
      btn!.textContent = isHidden ? 'Hide Analytics' : 'Show Analytics';
    });
    
    // Toggle lane metrics
    document.getElementById('toggle-lane-metrics')?.addEventListener('click', () => {
      const container = document.getElementById('lane-metrics-container');
      if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
      }
    });
    
    // Toggle intersection metrics
    document.getElementById('toggle-intersection-metrics')?.addEventListener('click', () => {
      const container = document.getElementById('intersection-metrics-container');
      if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
      }
    });
    
    // Car count slider
    document.getElementById('cars-range')?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('cars-value')!.textContent = value;
    });
    
    // Traffic control model selector
    document.getElementById('traffic-control-model')?.addEventListener('change', (e) => {
      const selectedModel = (e.target as HTMLSelectElement).value;
      this.selectedTrafficControlModel = selectedModel;
      
      // Update the indicator
      const indicator = document.getElementById('active-model-indicator');
      if (indicator) {
        indicator.textContent = this.getReadableModelName(selectedModel);
      }
      
      // Apply to all intersections in the world
      this.applyTrafficControlModelToAllIntersections();
      
      // Show notification
      this.showNotification(`Traffic control model changed to ${this.getReadableModelName(selectedModel)}`, 'info');
      
      console.log('🚦 Traffic control model changed to:', selectedModel);
    });
    
    // Time factor slider
    document.getElementById('time-factor-range')?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('time-factor-value')!.textContent = value;
      
      // Update the visualizer time factor in real-time if it exists
      if (this.visualizer) {
        this.visualizer.timeFactor = parseFloat(value);
      }
    });
    
    // Export metrics as CSV
    document.getElementById('export-metrics')?.addEventListener('click', () => {
      if (!this.world) {
        this.showNotification('No simulation data to export', 'warning');
        return;
      }
      
      try {
        kpiCollector.downloadMetricsCSV();
        this.showNotification('Metrics exported as CSV', 'success');
      } catch (error) {
        console.error('Failed to export metrics as CSV:', error);
        this.showNotification('Failed to export metrics', 'error');
      }
    });
    
    // Validate metrics
    document.getElementById('validate-metrics')?.addEventListener('click', () => {
      if (!this.world) {
        this.showNotification('No simulation data to validate', 'warning');
        return;
      }
      
      try {
        // Run validation and get HTML report
        const validationHtml = kpiCollector.validateMetrics();
        
        // Create modal for displaying validation results
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <div class="modal-header">
              <span class="close">&times;</span>
              <h2>KPI Validation Results</h2>
            </div>
            <div class="modal-body">
              ${validationHtml}
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close modal
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
          });
        }
        
        // Show modal
        modal.style.display = 'block';
        
        this.showNotification('KPI validation complete', 'info');
      } catch (error) {
        console.error('Failed to validate KPIs:', error);
        this.showNotification('Failed to validate KPIs', 'error');
      }
    });
    
    // Load layout button
    document.getElementById('load-layout')?.addEventListener('click', () => this.showLayoutSelector());
  }

  private async initializeSimulation() {
    console.log('🌍 Initializing world for simulation...');
    
    try {
      this.world = new World();

      // Start with completely empty world for simulation - user loads layouts manually
      this.world.clear();
      this.world.carsNumber = 0;
      
      // Ensure no cars are spawned initially
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      console.log('🌍 World initialized with:', {
        intersections: Object.keys(this.world.intersections?.all() || {}).length,
        roads: Object.keys(this.world.roads?.all() || {}).length,
        cars: this.world.carsNumber,
        actualCars: this.world.cars?.length || 0
      });
      
      // Set up the initial traffic control model UI
      this.setupTrafficControlModelUI();
      
      // Initialize visualizer only when DOM is fully ready
      // Use requestAnimationFrame for better timing with DOM rendering
      requestAnimationFrame(() => {
        if (document.getElementById('simulation-canvas')) {
          this.initializeVisualizer();
        } else {
          console.error('❌ Canvas element not ready, trying again in 100ms');
          // Fallback to setTimeout if element isn't ready yet
          setTimeout(() => this.initializeVisualizer(), 100);
        }
      });
      
    } catch (error) {
      console.error('🚨 Failed to initialize simulation world:', error);
    }
  }

  private destroyVisualizer(): void {
    console.log('🎨 [SIM DEBUG] Destroying visualizer...');
    try {
      if (this.visualizer) {
        // Stop any running animation
        if (this.visualizer.running) {
          this.visualizer.running = false;
        }
        
        // Call the visualizer's destroy method to clean up resources
        if (typeof this.visualizer.destroy === 'function') {
          this.visualizer.destroy();
        }
        
        // Clear visualizer reference
        this.visualizer = null;
        
        console.log('🎨 [SIM DEBUG] Visualizer destroyed successfully');
      } else {
        console.log('🎨 [SIM DEBUG] No visualizer to destroy');
      }
    } catch (error) {
      console.error('🎨 [SIM ERROR] Error destroying visualizer:', error);
    }
  }

  private initializeVisualizer() {
    const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas not found in DOM during simulation initialization');
      return;
    }

    console.log('🎨 Initializing simulation visualizer...');

    // Destroy existing visualizer to prevent conflicts
    if (this.visualizer) {
      console.log('🎨 Destroying existing visualizer before creating new one');
      this.destroyVisualizer();
    }

    // Set canvas size based on container
    const visualizerArea = canvas.parentElement;
    if (visualizerArea) {
      const rect = visualizerArea.getBoundingClientRect();
      const targetWidth = Math.max(rect.width, 600);
      const targetHeight = Math.max(rect.height, 400);
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Apply CSS for proper display
      canvas.style.cssText = `
        width: 100% !important;
        height: 100% !important;
        display: block !important;
        background: #2d2d2d !important;
        border: 1px solid #404040;
      `;
    }

    try {
      // Verify canvas exists one more time and that it has a valid parent element
      const canvas = document.getElementById('simulation-canvas');
      const parent = canvas?.parentElement;
      
      if (!canvas || !parent) {
        console.error('❌ Canvas or parent container not found before visualizer creation');
        return;
      }
      
      // Create visualizer in SIMULATION MODE
      this.visualizer = new Visualizer(this.world, 'simulation-canvas');
      
      // SIMULATION MODE: Start with no cars and no simulation running
      this.world.carsNumber = 0;
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      // Set to simulation mode but don't start simulation automatically
      this.visualizer.isBuilderMode = false;
      
      // Start the visualizer for rendering but not simulation
      this.visualizer.start();
      
      // Ensure simulation is NOT running initially
      this.visualizer.running = false;
      this.isRunning = false;
      
      // Start analytics updates
      this.startAnalyticsUpdates();
      
      // Force initial draw after a short delay
      setTimeout(() => {
        if (this.visualizer && this.visualizer.drawSingleFrame) {
          this.visualizer.drawSingleFrame();
        }
      }, 200);
      
      console.log('✅ Simulation visualizer initialized successfully (not running)');
    } catch (error) {
      console.error('❌ Error initializing simulation visualizer:', error);
    }
    
    // Add window resize handler for responsive canvas
    this.addResizeHandler();
  }

  private addResizeHandler() {
    const resizeCanvas = () => {
      const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('⚠️ Canvas not found during resize operation');
        return;
      }
      
      const visualizerArea = canvas.parentElement;
      if (!visualizerArea) {
        console.warn('⚠️ Canvas parent element not found during resize');
        return;
      }
      
      // Get the current dimensions of the container
      const rect = visualizerArea.getBoundingClientRect();
      const targetWidth = Math.max(rect.width || 800, 400);
      const targetHeight = Math.max(rect.height || 600, 300);
      
      // Update canvas dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      console.log('🎨 Simulation: Canvas resized to:', targetWidth, 'x', targetHeight);
      
      // Redraw after resize using requestAnimationFrame for better timing
      if (this.visualizer && this.visualizer.drawSingleFrame) {
        requestAnimationFrame(() => {
          this.visualizer.drawSingleFrame();
        });
      }
    };
    
    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    });
  }

  private async loadSelectedLayout() {
    const select = document.getElementById('layout-select') as HTMLSelectElement;
    const layoutId = select?.value;
    if (!layoutId) return;
    const layout = this.layouts.find(l => l.id === layoutId);
    if (layout && this.world) {
      try {
        this.world.load(JSON.stringify(layout.data));
        this.world.carsNumber = parseInt((document.getElementById('cars-range') as HTMLInputElement)?.value || '100');
        this.updateAnalytics();
        this.showNotification('Layout loaded successfully!');
        // Always re-initialize the visualizer after loading a layout
        this.initializeVisualizer();
        // Restart visualizer if running
        if (this.isRunning) {
          this.visualizer?.stop();
          this.visualizer?.start();
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
        this.showNotification('Failed to load layout!', 'error');
      }
    }
  }

  private toggleSimulation() {
    console.log('🎮 [SIM] Toggle simulation called');
    
    if (!this.visualizer || !this.world) {
      console.error('🎮 [SIM ERROR] Visualizer or world not available');
      return;
    }

    const button = document.getElementById('toggle-simulation');
    
    if (this.isRunning) {
      console.log('🎮 [SIM] Stopping simulation');
      
      // Stop simulation (pause)
      this.visualizer.running = false;
      this.isRunning = false;
      
      // Stop KPI collection
      kpiCollector.stopRecording();
      
      if (button) {
        button.innerHTML = '▶️ Start Simulation';
        button.className = 'btn btn-success btn-block';
      }
      
      console.log('🎮 [SIM] Simulation stopped');
    } else {
      console.log('🎮 [SIM] Starting simulation');
      
      // Start simulation 
      // Ensure visualizer is in simulation mode (not builder mode)
      this.visualizer.isBuilderMode = false;
      
      // Make sure we have the right number of cars
      const carsRange = document.getElementById('cars-range') as HTMLInputElement;
      let targetCarCount = 100; // Default
      
      if (carsRange) {
        targetCarCount = parseInt(carsRange.value || '100');
      }
      
      console.log('🎮 [SIM] Setting car count to', targetCarCount);
      this.world.carsNumber = targetCarCount;
      
      // Reset all cars to ensure a clean start
      console.log('🎮 [SIM] Clearing existing cars');
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      // Reset KPI collector and start recording
      kpiCollector.reset();
      kpiCollector.startRecording(this.world.time);
      
      // Force refresh cars to spawn them with proper state
      console.log('🎮 [SIM] Refreshing cars');
      // Use refreshCars instead of manually adding each car
      this.world.refreshCars();
      
      console.log('🎮 [SIM] Car count after refresh:', Object.keys(this.world.cars?.all() || {}).length);
      
      // Set proper time factor from slider
      const timeFactorSlider = document.getElementById('time-factor-range') as HTMLInputElement;
      if (timeFactorSlider && this.visualizer) {
        const factor = parseFloat(timeFactorSlider.value || '1.0');
        console.log('🎮 [SIM] Setting time factor to', factor);
        this.visualizer.timeFactor = factor;
      }
      
      // Start the animation loop
      console.log('🎮 [SIM] Setting visualizer.running = true');
      this.visualizer.running = true;
      this.isRunning = true;
      
      if (button) {
        button.innerHTML = '⏸️ Pause Simulation';
        button.className = 'btn btn-warning btn-block';
      }
      
      console.log('🎮 [SIM] Simulation started');
    }
  }

  private resetSimulation() {
    console.log('🔄 [SIM DEBUG] Reset simulation requested');
    
    try {
      if (!this.world || !this.visualizer) {
        console.error('🔄 [SIM ERROR] Cannot reset - world or visualizer is not available');
        return;
      }

      // Store simulation state we want to preserve
      const wasRunning = this.isRunning;
      let carCount = 100; // Default
      const carSlider = document.getElementById('cars-range') as HTMLInputElement;
      if (carSlider) {
        carCount = parseInt(carSlider.value || '100');
      }
      
      // Stop simulation if running
      if (wasRunning) {
        this.visualizer.running = false;
        this.isRunning = false;
      }
      
      // Save current layout data
      let currentLayoutData: string | null = null;
      try {
        // Get the current layout as a serialized string before clearing
        const layoutData = {
          intersections: this.world.intersections.all(),
          roads: this.world.roads.all(),
        };
        currentLayoutData = JSON.stringify(layoutData);
      } catch (err) {
        console.error('🔄 [SIM ERROR] Failed to save layout data:', err);
      }
      
      // Reset world time and clear vehicles
      console.log('🔄 [SIM DEBUG] Resetting world time and clearing vehicles');
      this.world.time = 0;
      this.world.carsNumber = 0; // Temporarily set to 0 to prevent auto-spawning
      
      // Clear KPIs
      kpiCollector.reset();
      
      // Clear cars
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      // 1. Stop the simulation and animation loop
      console.log('🔄 [SIM DEBUG] Stopping simulation and animation');
      this.visualizer.running = false;
      this.isRunning = false;
      
      // 2. Properly clean up visualizer (stop all animation loops)
      console.log('🔄 [SIM DEBUG] Destroying visualizer');
      if (typeof this.visualizer.destroy === 'function') {
        this.visualizer.destroy();
      } else if (typeof this.visualizer.stop === 'function') {
        this.visualizer.stop();
      }
      
      // Clear references
      this.visualizer = null;
  
      // 3. Properly clean up world
      console.log('🔄 [SIM DEBUG] Clearing world');
      this.world.clear();
      
      // 4. Reload the layout (if we have saved state)
      if (currentLayoutData) {
        console.log('🔄 [SIM DEBUG] Reloading saved layout');
        try {
          this.world.load(currentLayoutData);
          console.log('🔄 [SIM DEBUG] Layout reloaded successfully');
        } catch (reloadErr) {
          console.error('🔄 [SIM ERROR] Failed to reload layout:', reloadErr);
        }
      }
      
      // 5. Set car count but don't spawn them yet
      this.world.carsNumber = carCount;
      console.log('🔄 [SIM DEBUG] Set cars number to:', this.world.carsNumber);
      this.world.time = 0;
  
      // 6. Re-initialize the visualizer with the cleaned world
      console.log('🔄 [SIM DEBUG] Re-initializing visualizer');
      this.initializeVisualizer();
      
      // 7. Now that visualizer is ready, spawn cars
      console.log('🔄 [SIM DEBUG] Spawning cars');
      this.world.refreshCars();
      
      // 7b. Apply the selected traffic control model to all intersections
      console.log('🔄 [SIM DEBUG] Applying traffic control model:', this.selectedTrafficControlModel);
      this.applyTrafficControlModelToAllIntersections();
  
      // 8. Update analytics and notify user
      this.updateAnalytics();
      this.showNotification('Simulation reset successfully!');
  
      // 9. If it was previously running, restart it
      if (wasRunning) {
        console.log('🔄 [SIM DEBUG] Restarting simulation');
        setTimeout(() => {
          if (this.visualizer) {
            this.visualizer.running = true;
            this.isRunning = true;
            
            // Update UI
            const toggleBtn = document.getElementById('toggle-simulation');
            if (toggleBtn) {
              toggleBtn.textContent = '⏸️ Pause Simulation';
              toggleBtn.className = 'btn btn-warning btn-block';
            }
          }
        }, 500);
      }
    } catch (resetError) {
      console.error('🔄 [SIM ERROR] Reset simulation failed:', resetError);
      console.error('🔄 [SIM ERROR] Stack trace:', resetError.stack);
      
      // Emergency recovery - force page reload if reset catastrophically fails
      this.showNotification('Reset failed. Refreshing page...', 'error');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  private startAnalyticsUpdates() {
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }

    this.analyticsInterval = window.setInterval(() => {
      this.updateAnalytics();
    }, 1000);
  }

  private updateAnalytics() {
    if (!this.world) return;

    // Get raw data from world
    const worldStats = {
      totalCars: Object.keys(this.world.cars?.all() || {}).length,
      averageSpeed: this.world.instantSpeed || 0,
      totalIntersections: Object.keys(this.world.intersections?.all() || {}).length,
      totalRoads: Object.keys(this.world.roads?.all() || {}).length,
      simulationTime: this.world.time || 0
    };
    
    // Get KPI metrics from collector
    const kpiMetrics = kpiCollector.getMetrics(this.world.time);
    
    // Combine data for our analytics
    this.analytics = {
      ...worldStats,
      ...kpiMetrics
    };

    // Update UI elements - Basic simulation stats
    const activeCarsEl = document.getElementById('active-cars');
    const totalVehiclesEl = document.getElementById('total-vehicles');
    const completedTripsEl = document.getElementById('completed-trips');
    const simulationTimeEl = document.getElementById('simulation-time');

    if (activeCarsEl) activeCarsEl.textContent = kpiMetrics.activeVehicles.toString();
    if (totalVehiclesEl) totalVehiclesEl.textContent = kpiMetrics.totalVehicles.toString();
    if (completedTripsEl) completedTripsEl.textContent = kpiMetrics.completedTrips.toString();
    if (simulationTimeEl) simulationTimeEl.textContent = kpiMetrics.simulationTime.toFixed(1) + 's';
    
    // Update UI elements - Performance metrics
    const averageSpeedEl = document.getElementById('average-speed');
    const avgWaitTimeEl = document.getElementById('avg-wait-time');
    const maxWaitTimeEl = document.getElementById('max-wait-time');
    const totalStopsEl = document.getElementById('total-stops');
    const stoppedVehiclesEl = document.getElementById('stopped-vehicles');
    
    if (averageSpeedEl) averageSpeedEl.textContent = kpiMetrics.averageSpeed.toFixed(2) + ' m/s';
    if (avgWaitTimeEl) avgWaitTimeEl.textContent = kpiMetrics.averageWaitTime.toFixed(1) + 's';
    if (maxWaitTimeEl) maxWaitTimeEl.textContent = kpiMetrics.maxWaitTime.toFixed(1) + 's';
    if (totalStopsEl) totalStopsEl.textContent = kpiMetrics.totalStops.toString();
    if (stoppedVehiclesEl) stoppedVehiclesEl.textContent = kpiMetrics.stoppedVehicles.toString();
    
    // Update UI elements - Network stats
    const totalIntersectionsEl = document.getElementById('total-intersections');
    const totalRoadsEl = document.getElementById('total-roads');
    
    if (totalIntersectionsEl) totalIntersectionsEl.textContent = worldStats.totalIntersections.toString();
    if (totalRoadsEl) totalRoadsEl.textContent = worldStats.totalRoads.toString();
    
    // Update advanced metrics
    const globalThroughputEl = document.getElementById('global-throughput');
    const congestionIndexEl = document.getElementById('congestion-index');
    
    if (globalThroughputEl) globalThroughputEl.textContent = kpiMetrics.globalThroughput.toFixed(2) + ' veh/min';
    if (congestionIndexEl) {
      congestionIndexEl.textContent = kpiMetrics.congestionIndex.toFixed(2);
      
      // Add color coding based on congestion level
      if (kpiMetrics.congestionIndex > 0.75) {
        congestionIndexEl.classList.add('critical');
        congestionIndexEl.classList.remove('warning', 'good');
      } else if (kpiMetrics.congestionIndex > 0.5) {
        congestionIndexEl.classList.add('warning');
        congestionIndexEl.classList.remove('critical', 'good');
      } else {
        congestionIndexEl.classList.add('good');
        congestionIndexEl.classList.remove('critical', 'warning');
      }
    }
    
    // Update Lane Metrics Table if it exists
    this.updateLaneMetricsTable(kpiMetrics);
    
    // Update Intersection Metrics Table if it exists
    this.updateIntersectionMetricsTable(kpiMetrics);
  }
  
  /**
   * Updates the lane metrics table with current KPI data
   */
  private updateLaneMetricsTable(kpiMetrics: any) {
    const laneTableBody = document.getElementById('lane-metrics-body');
    if (!laneTableBody) return;
    
    // Clear existing rows
    laneTableBody.innerHTML = '';
    
    // Add a row for each lane
    Object.values(kpiMetrics.laneMetrics).forEach((lane: any) => {
      const row = document.createElement('tr');
      
      // Format lane ID to be more readable
      const shortLaneId = lane.laneId.replace('lane', '');
      
      // Build the row with lane metrics
      row.innerHTML = `
        <td>${shortLaneId}</td>
        <td>${lane.averageSpeed.toFixed(2)} m/s</td>
        <td>${lane.vehicleCount}</td>
        <td>${lane.congestionRate.toFixed(2)}</td>
        <td>${lane.throughput.toFixed(2)} veh/min</td>
        <td>${lane.totalVehiclesPassed}</td>
        <td>${lane.queueLength}</td>
      `;
      
      // Add color coding based on congestion level
      if (lane.congestionRate > 0.75) {
        row.classList.add('congested-row');
      } else if (lane.congestionRate > 0.5) {
        row.classList.add('moderate-row');
      }
      
      laneTableBody.appendChild(row);
    });
  }
  
  /**
   * Updates the intersection metrics table with current KPI data
   */
  private updateIntersectionMetricsTable(kpiMetrics: any) {
    const intersectionTableBody = document.getElementById('intersection-metrics-body');
    if (!intersectionTableBody) return;
    
    // Clear existing rows
    intersectionTableBody.innerHTML = '';
    
    // Add a row for each intersection
    Object.values(kpiMetrics.intersectionMetrics).forEach((intersection: any) => {
      const row = document.createElement('tr');
      
      // Format intersection ID to be more readable
      const shortIntersectionId = intersection.intersectionId.replace('intersection', '');
      
      // Build the row with intersection metrics
      row.innerHTML = `
        <td>${shortIntersectionId}</td>
        <td>${intersection.throughput.toFixed(2)} veh/min</td>
        <td>${intersection.averageWaitTime.toFixed(2)}s</td>
        <td>${intersection.maxWaitTime.toFixed(2)}s</td>
        <td>${intersection.averageQueueLength.toFixed(1)}</td>
        <td>${intersection.totalVehiclesPassed}</td>
        <td>${intersection.congestionRate.toFixed(2)}</td>
      `;
      
      // Add color coding based on congestion level
      if (intersection.congestionRate > 0.75) {
        row.classList.add('congested-row');
      } else if (intersection.congestionRate > 0.5) {
        row.classList.add('moderate-row');
      }
      
      intersectionTableBody.appendChild(row);
    });
  }
  
  /**
   * Shows a notification message to the user
   * @param message Message to display
   * @param type Optional type ('info', 'success', 'warning', 'error')
   * @param duration Time in ms to show the notification
   */
  private showNotification(message: string, type: string = 'info', duration: number = 3000): void {
    // Check if a notification container exists, if not create it
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.top = '20px';
      notificationContainer.style.right = '20px';
      notificationContainer.style.zIndex = '9999';
      document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.style.backgroundColor = this.getNotificationColor(type);
    notification.style.color = '#fff';
    notification.style.padding = '10px 15px';
    notification.style.margin = '5px 0';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }
  
  private getNotificationColor(type: string): string {
    switch (type) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#2196f3'; // info
    }
  }
  
  /**
   * Adds CSS styles required for the simulation page
   */
  private addStyles(): void {
    // Avoid duplicate style elements
    if (document.getElementById('simulation-page-styles')) {
      return;
    }
    
    // Force dark theme styles to be applied
    document.body.classList.add('dark-theme');
    
    const styleElement = document.createElement('style');
    styleElement.id = 'simulation-page-styles';
    styleElement.innerHTML = `
      .simulation-page {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .page-header {
        padding: 15px;
        background-color: #2d2d2d;
        border-bottom: 1px solid #404040;
      }
      
      .page-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 24px;
      }
      
      .simulation-content {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      
      .sidebar {
        width: 280px;
        overflow-y: auto;
        background-color: #2d2d2d;
        border-right: 1px solid #404040;
        padding: 10px;
      }
      
      .panel {
        background-color: #333333;
        border: 1px solid #404040;
        border-radius: 4px;
        margin-bottom: 15px;
        padding: 10px;
      }
      
      .panel h3 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
        border-bottom: 1px solid #404040;
        padding-bottom: 5px;
        color: #ffffff;
      }
      
      .visualizer-area {
        flex: 1;
        overflow: hidden;
        position: relative;
        background: #1a1a1a;
      }
      
      .visualizer-area canvas {
        width: 100%;
        height: 100%;
        background: #1a1a1a;
      }
      
      .control-group {
        margin-bottom: 10px;
      }
      
      .btn {
        display: inline-block;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: 4px;
      }
      
      .btn-block {
        display: block;
        width: 100%;
      }
      
      .btn-primary { background-color: #375a7f; color: white; border: 1px solid #375a7f; }
      .btn-primary:hover { background-color: #2e4c6d; }
      .btn-success { background-color: #00bc8c; color: white; border: 1px solid #00bc8c; }
      .btn-success:hover { background-color: #00a085; }
      .btn-info { background-color: #3498db; color: white; border: 1px solid #3498db; }
      .btn-info:hover { background-color: #2980b9; }
      .btn-warning { background-color: #f39c12; color: #212529; border: 1px solid #f39c12; }
      .btn-warning:hover { background-color: #e67e22; }
      .btn-secondary { background-color: #444444; color: white; border: 1px solid #666666; }
      .btn-secondary:hover { background-color: #555555; }
      
      .slider {
        width: 100%;
      }
      
      .analytics {
        margin-top: 15px;
        padding: 10px;
        background-color: #2a2a2a;
        border-radius: 5px;
      }
      
      .analytics-section {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #444;
      }
      
      .analytics-section:last-child {
        border-bottom: none;
        margin-bottom: 5px;
      }
      
      .analytics-section h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #aaa;
      }
      
      .metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 13px;
      }
      
      .label {
        color: #ddd;
      }
      
      .value {
        font-weight: 500;
        color: #fff;
      }
      
      .analytics-actions {
        display: flex;
        gap: 8px;
        margin-top: 15px;
      }
      
      .analytics-actions .btn {
        flex: 1;
        font-size: 12px;
        padding: 8px;
      }
      
      .instructions {
        padding-left: 20px;
        margin-top: 0;
      }
      
      .instructions li {
        margin-bottom: 5px;
      }
      
      .analytics-dev-tools {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px dashed #555;
      }
      
      .validation-output {
        margin-top: 10px;
        padding: 10px;
        background: #222;
        border-radius: 4px;
        border: 1px solid #444;
        max-height: 500px;
        overflow-y: auto;
      }
      
      .validation-output pre {
        margin: 0;
        font-family: monospace;
        font-size: 11px;
        white-space: pre-wrap;
        color: #ccc;
      }
      
      .validation-formatted {
        margin-bottom: 20px;
      }
      
      .validation-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        font-size: 13px;
      }
      
      .validation-table th {
        background-color: #007bff;
        color: white;
        text-align: left;
        padding: 8px;
      }
      
      .validation-table td {
        padding: 6px 8px;
        border-bottom: 1px solid #444;
      }
      
      .validation-table tr:nth-child(even) {
        background-color: #2a2a2a;
      }
      
      .validation-error {
        background-color: #500 !important;
        color: #f88;
        font-weight: bold;
      }
      
      .validation-success {
        background-color: #052 !important;
        color: #8f8;
        font-weight: bold;
      }
      
      .active-model-indicator {
        display: inline-block;
        font-weight: bold;
        padding: 3px 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        background-color: #333;
        border: 1px solid #555;
        color: #33ee33;
      }
      
      .model-status {
        margin-bottom: 5px;
        text-align: center;
      }
      
      #traffic-control-model {
        width: 100%;
        padding: 6px;
        background-color: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  /**
   * Saves current simulation analytics data
   */
  private async saveAnalytics(): Promise<void> {
    try {
      if (!this.world) {
        this.showNotification('No simulation data to save', 'warning');
        return;
      }
      
      // Generate filename based on time
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `traffic-sim-analytics-${timestamp}.json`;
      
      // Get KPI metrics
      const kpiMetrics = kpiCollector.getMetrics(this.world.time);
      
      // Create and save analytics data
      const analyticsData = {
        timestamp: new Date().toISOString(),
        metrics: {
          ...this.analytics,
          kpi: kpiMetrics
        },
        layout: {
          roads: Object.keys(this.world.roads?.all() || {}).length,
          intersections: Object.keys(this.world.intersections?.all() || {}).length
        },
        simulation: {
          time: this.world.time || 0,
          carCount: Object.keys(this.world.cars?.all() || {}).length,
          activeVehicles: kpiMetrics.activeVehicles,
          completedTrips: kpiMetrics.completedTrips,
          averageSpeed: kpiMetrics.averageSpeed,
          averageWaitTime: kpiMetrics.averageWaitTime,
          totalStops: kpiMetrics.totalStops
        }
      };
      
      // Create a blob from the data
      const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
      
      // Create download link and trigger it
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showNotification('Analytics saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save analytics:', error);
      this.showNotification('Failed to save analytics', 'error');
    }
  }
  
  /**
   * Shows a dialog to load a saved layout
   */
  private async showLoadDialog(): Promise<void> {
    try {
      if (this.layouts.length === 0) {
        this.showNotification('No saved layouts found. Create one in the Builder first!', 'warning');
        return;
      }
      
      // Create load dialog
      const dialog = document.createElement('div');
      dialog.className = 'modal-overlay';
      dialog.innerHTML = `
        <div class="modal-dialog modal-large">
          <div class="modal-header">
            <h3>Load Layout</h3>
            <button class="close-btn" id="close-load-dialog">×</button>
          </div>
          <div class="modal-body">
            <p>Select a layout to load for simulation:</p>
            <div class="layout-grid">
              ${this.layouts.map(layout => `
                <div class="layout-card" data-layout-id="${layout.id}">
                  <div class="layout-info">
                    <h4>${layout.name || 'Unnamed Layout'}</h4>
                    <small>Created: ${new Date(layout.createdAt).toLocaleString()}</small>
                  </div>
                  <div class="layout-actions">
                    <button class="btn btn-primary load-layout-btn" data-layout-id="${layout.id}">Load</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-load">Cancel</button>
          </div>
        </div>
      `;
      
      // Add CSS for the dialog
      const styleElement = document.createElement('style');
      if (!document.getElementById('modal-dialog-styles')) {
        styleElement.id = 'modal-dialog-styles';
        styleElement.textContent = `
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .modal-dialog {
            background-color: #2d2d2d;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            border: 1px solid #404040;
          }
          
          .modal-large {
            max-width: 800px;
          }
          
          .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #404040;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .modal-header h3 {
            margin: 0;
            color: #ffffff;
          }
          
          .close-btn {
            background: transparent;
            border: none;
            color: #b0b0b0;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
          }
          
          .close-btn:hover {
            color: #ffffff;
          }
          
          .modal-body {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(90vh - 140px);
          }
          
          .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #404040;
            text-align: right;
          }
          
          .layout-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .layout-card {
            border: 1px solid #404040;
            background-color: #333333;
            border-radius: 5px;
            padding: 15px;
            transition: all 0.2s ease;
          }
          
          .layout-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border-color: #007bff;
          }
          
          .layout-info h4 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #ffffff;
          }
          
          .layout-info small {
            color: #b0b0b0;
            display: block;
            margin-bottom: 15px;
          }
          
          .layout-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }
        `;
        document.head.appendChild(styleElement);
      }
      
      document.body.appendChild(dialog);
      
      // Event listeners
      const cancelLoad = document.getElementById('cancel-load');
      const closeLoad = document.getElementById('close-load-dialog');
      
      const closeDialog = () => {
        if (dialog && dialog.parentNode) {
          document.body.removeChild(dialog);
        }
      };
      
      // Load layout buttons
      dialog.querySelectorAll('.load-layout-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const layoutId = (e.target as HTMLElement).getAttribute('data-layout-id');
          if (layoutId) {
            closeDialog();
            await this.loadLayoutById(layoutId);
          }
        });
      });
      
      cancelLoad?.addEventListener('click', closeDialog);
      closeLoad?.addEventListener('click', closeDialog);
      
    } catch (error) {
      console.error('Error showing load dialog:', error);
      this.showNotification('Failed to show load dialog', 'error');
    }
  }
  
  /**
   * Loads a layout by ID
   */
  private async loadLayoutById(layoutId: string): Promise<void> {
    try {
      console.log('🔄 [SIM DEBUG] Starting loadLayoutById for ID:', layoutId);
      
      // Show loading state
      this.showNotification(`Loading layout...`, 'info');
      
      // Find layout from previously loaded layouts
      const layout = this.layouts.find(l => l.id === layoutId);
      console.log('🔄 [SIM DEBUG] Layout found:', layout ? layout.name : 'Not found');
      
      if (!layout) {
        this.showNotification(`Layout not found (ID: ${layoutId})`, 'error');
        return;
      }
      
      console.log('🔄 [SIM DEBUG] Layout data:', layout.data);
      
      // Stop current simulation if running
      const wasRunning = this.isRunning;
      if (wasRunning) {
        this.toggleSimulation(); // This will stop it
      }
      
      // Reset the simulation
      await this.resetSimulation();
      
      // Load the layout into world
      if (this.world) {
        // Stringify the layout data because World.load expects a string
        this.world.load(JSON.stringify(layout.data));
        
        // Apply selected traffic control model
        this.applyTrafficControlModelToAllIntersections();
        
        // Update analytics
        this.updateAnalytics();
        
        // Show success message
        this.showNotification(`Layout "${layout.name || 'Unnamed'}" loaded successfully`, 'success');
        
        // Restart if it was running
        if (wasRunning) {
          setTimeout(() => this.toggleSimulation(), 500); // This will start it again
        }
      }
    } catch (error) {
      console.error('Error loading layout:', error);
      this.showNotification('Failed to load layout', 'error');
    }
  }

  /**
   * Show layout selection dialog
   */
  private async showLayoutSelector(): Promise<void> {
    try {
      // Refresh layouts first
      await this.loadLayouts();
      
      if (this.layouts.length === 0) {
        this.showNotification('No layouts available. Create one in the Builder first.', 'warning');
        return;
      }
      
      // Create modal dialog for layout selection
      const modal = document.createElement('div');
      modal.className = 'modal layout-selector-modal';
      
      // Build HTML for layout selection
      let layoutOptionsHtml = '';
      this.layouts.forEach(layout => {
        layoutOptionsHtml += `
          <div class="layout-option" data-layout-id="${layout.id}">
            <h4>${layout.name || 'Untitled Layout'}</h4>
            <p class="layout-meta">
              ${layout.description || 'No description'}<br>
              <small>Created: ${new Date(layout.created).toLocaleString()}</small>
            </p>
            <button class="btn btn-sm btn-primary load-layout-btn" data-layout-id="${layout.id}">
              Load Layout
            </button>
          </div>
        `;
      });
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <span class="close">&times;</span>
            <h2>Select a Layout</h2>
          </div>
          <div class="modal-body">
            <div class="layout-options">
              ${layoutOptionsHtml}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary close-modal-btn">Cancel</button>
          </div>
        </div>
      `;
      
      // Add modal to document
      document.body.appendChild(modal);
      
      // Add event listeners to load buttons
      const loadButtons = modal.querySelectorAll('.load-layout-btn');
      loadButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const layoutId = (button as HTMLElement).getAttribute('data-layout-id');
          if (layoutId) {
            document.body.removeChild(modal);
            await this.loadLayoutById(layoutId);
          }
        });
      });
      
      // Add event listener to close buttons
      const closeButton = modal.querySelector('.close');
      const cancelButton = modal.querySelector('.close-modal-btn');
      
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      }
      
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      }
      
      // Show modal
      modal.style.display = 'block';
      
    } catch (error) {
      console.error('❌ Failed to show layout selector:', error);
      this.showNotification('Failed to show layout selection dialog', 'error');
    }
  }

  /**
   * Clean up resources when component is destroyed
   */
  public destroy() {
    console.log('🧹 Simulation: Destroying page and cleaning up canvas...');
    
    if (this.visualizer) {
      if (this.visualizer.destroy) {
        this.visualizer.destroy();
      } else {
        this.visualizer.stop();
      }
      this.visualizer = null;
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }
    if (this.world) {
      this.world = null;
    }
    
    // Remove the canvas element to prevent duplicates
    const canvas = document.getElementById('simulation-canvas');
    if (canvas) {
      console.log('🗑️ Simulation: Removing canvas element');
      canvas.remove();
    }
    
    // Clear the container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    console.log('✅ Simulation: Page destroyed and cleaned up');
  }

  // Public interface methods for app integration
  public getContainer() {
    return this.container;
  }

  public show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  public hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Applies the selected traffic control model to all intersections
   */
  private applyTrafficControlModelToAllIntersections(): void {
    if (!this.world || !this.world.intersections) {
      console.warn('Cannot apply traffic control model: World or intersections not initialized');
      return;
    }
    
    // Set the global strategy in the manager
    trafficControlStrategyManager.selectStrategy(this.selectedTrafficControlModel);
    
    // Apply to all intersections
    const intersections = this.world.intersections.all();
    let appliedCount = 0;
    
    for (const id in intersections) {
      const intersection = intersections[id];
      if (intersection && intersection.trafficLightController) {
        if (intersection.setTrafficControlStrategy(this.selectedTrafficControlModel)) {
          appliedCount++;
        }
      }
    }
    
    console.log(`Applied ${this.getReadableModelName(this.selectedTrafficControlModel)} traffic control model to ${appliedCount} intersections`);
  }
  
  /**
   * Get a human-readable name for the traffic control model
   */
  private getReadableModelName(modelId: string): string {
    switch (modelId) {
      case 'fixed-timing': return 'Fixed Timing';
      case 'adaptive-timing': return 'Adaptive Timing';
      case 'traffic-enforcer': return 'Traffic Enforcer';
      case 'all-red-flashing': return 'All Red Flashing';
      default: return modelId;
    }
  }
  
  /**
   * Set up the traffic control model UI to match the current selected model
   */
  private setupTrafficControlModelUI(): void {
    // Set the select element to match the current model
    const selectElement = document.getElementById('traffic-control-model') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = this.selectedTrafficControlModel;
    }
    
    // Update the indicator to show the current model
    const indicator = document.getElementById('active-model-indicator');
    if (indicator) {
      indicator.textContent = this.getReadableModelName(this.selectedTrafficControlModel);
    }
  }
  
  /**
   * Shows the KPI benchmark configuration modal
   */
  private showBenchmarkModal(): void {
    // Create the benchmark modal dynamically if it doesn't exist
    let modal = document.getElementById('benchmark-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'benchmark-modal';
      modal.className = 'modal';
      modal.style.display = 'none';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content benchmark-modal-content">
          <div class="modal-header">
            <span class="close">&times;</span>
            <h2>KPI Benchmark Configuration</h2>
          </div>
          <div class="modal-body">
            <div class="benchmark-settings">
              <div class="form-group">
                <label for="benchmark-layout">Layout:</label>
                <select id="benchmark-layout" class="form-control">
                  <option value="">Current Layout</option>
                  <!-- Layout options will be populated dynamically -->
                </select>
                <small class="setting-description">Select a layout to use for the benchmark (or use current layout)</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-duration">Simulation Duration (seconds):</label>
                <input type="number" id="benchmark-duration" class="form-control" min="10" max="300" value="60">
                <small class="setting-description">How long the simulation should run (in simulation seconds)</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-model">Traffic Control Model:</label>
                <select id="benchmark-model" class="form-control">
                  <option value="fixed-timing">Fixed Timing</option>
                  <option value="adaptive-timing">Adaptive Timing</option>
                  <option value="traffic-enforcer">Traffic Enforcer</option>
                  <option value="all-red-flashing">All Red Flashing</option>
                </select>
                <small class="setting-description">Traffic control model to test during benchmark</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-cars">Number of Vehicles:</label>
                <input type="number" id="benchmark-cars" class="form-control" min="10" max="200" value="100">
                <small class="setting-description">Number of vehicles to simulate</small>
              </div>
              
              <div class="form-group">
                <label for="benchmark-time-factor">Time Factor:</label>
                <input type="number" id="benchmark-time-factor" class="form-control" min="0.1" max="5" step="0.1" value="2">
                <small class="setting-description">Speed of simulation (higher = faster)</small>
              </div>
              
              <div class="benchmark-options">
                <div class="option">
                  <input type="checkbox" id="benchmark-repeat" checked>
                  <label for="benchmark-repeat">Collect continuous data</label>
                </div>
                <div class="option">
                  <input type="checkbox" id="benchmark-export" checked>
                  <label for="benchmark-export">Export results after completion</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-benchmark">Cancel</button>
            <button class="btn btn-primary" id="start-benchmark">Start Benchmark</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
    
    // Add CSS for the benchmark modal
    this.addBenchmarkModalStyles();
    
    // Populate layout options
    this.populateLayoutOptions();
    
    // Set current values
    const modelSelect = document.getElementById('benchmark-model') as HTMLSelectElement;
    if (modelSelect) {
      modelSelect.value = this.selectedTrafficControlModel;
    }
    
    const carsInput = document.getElementById('benchmark-cars') as HTMLInputElement;
    if (carsInput) {
      const currentCars = (document.getElementById('cars-range') as HTMLInputElement)?.value || '100';
      carsInput.value = currentCars;
    }
    
    const timeFactorInput = document.getElementById('benchmark-time-factor') as HTMLInputElement;
    if (timeFactorInput) {
      const currentTimeFactor = (document.getElementById('time-factor-range') as HTMLInputElement)?.value || '1';
      timeFactorInput.value = currentTimeFactor;
    }
    
    // Add event listeners to modal
    const closeBtn = modal.querySelector('.close') as HTMLElement;
    const cancelBtn = document.getElementById('cancel-benchmark');
    const startBtn = document.getElementById('start-benchmark');
    
    // Close modal function
    const closeModal = () => {
      modal!.style.display = 'none';
      
      // Remove event listeners to prevent memory leaks
      if (closeBtn) closeBtn.removeEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.removeEventListener('click', closeModal);
      if (startBtn) startBtn.removeEventListener('click', startBenchmark);
    };
    
    // Start benchmark function
    const startBenchmark = () => {
      // Collect settings from form
      this.collectBenchmarkSettings();
      
      // Close the modal
      closeModal();
      
      // Start the benchmark
      this.startBenchmark();
    };
    
    // Attach events
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (startBtn) startBtn.addEventListener('click', startBenchmark);
    
    // Show modal
    modal.style.display = 'block';
  }
  
  /**
   * Collects benchmark settings from the configuration form
   */
  private collectBenchmarkSettings(): void {
    // Get values from form elements
    const layoutId = (document.getElementById('benchmark-layout') as HTMLSelectElement)?.value;
    const duration = (document.getElementById('benchmark-duration') as HTMLInputElement)?.value;
    const model = (document.getElementById('benchmark-model') as HTMLSelectElement)?.value;
    const cars = (document.getElementById('benchmark-cars') as HTMLInputElement)?.value;
    const timeFactor = (document.getElementById('benchmark-time-factor') as HTMLInputElement)?.value;
    const collectData = (document.getElementById('benchmark-repeat') as HTMLInputElement)?.checked;
    const exportResults = (document.getElementById('benchmark-export') as HTMLInputElement)?.checked;
    
    // Store settings
    this.benchmarkSettings = {
      layoutId: layoutId || '', // Empty string means use current layout
      duration: parseInt(duration || '60'),
      model: model || 'fixed-timing',
      cars: parseInt(cars || '100'),
      timeFactor: parseFloat(timeFactor || '2'),
      collectData: collectData !== false, // Default to true if undefined
      exportResults: exportResults !== false // Default to true if undefined
    };
    
    console.log('📊 [BENCHMARK] Settings collected:', this.benchmarkSettings);
    
    // Update class properties
    this.benchmarkDuration = this.benchmarkSettings.duration;
  }
  
  /**
   * Starts the benchmark process
   */
  private async startBenchmark(): Promise<void> {
    if (this.isBenchmarkRunning) {
      console.warn('📊 [BENCHMARK] Benchmark already running');
      return;
    }
    
    try {
      console.log('📊 [BENCHMARK] Starting benchmark...');
      
      // Set flag
      this.isBenchmarkRunning = true;
      
      // Show notification
      this.showNotification(`Starting KPI benchmark for ${this.benchmarkSettings.duration} seconds using ${this.getReadableModelName(this.benchmarkSettings.model)} control...`, 'info', 5000);
      
      // 1. Reset simulation
      console.log('📊 [BENCHMARK] Resetting simulation');
      await this.resetSimulation();
      
      // Small delay to ensure reset is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2. Apply benchmark settings
      console.log('📊 [BENCHMARK] Applying settings');
      
      // Load selected layout if specified
      if (this.benchmarkSettings.layoutId) {
        console.log('📊 [BENCHMARK] Loading layout:', this.benchmarkSettings.layoutId);
        
        try {
          // Find layout from the layouts array
          const layoutToLoad = this.layouts.find(l => l.id === this.benchmarkSettings.layoutId);
          
          if (layoutToLoad) {
            this.showNotification(`Loading layout: ${layoutToLoad.name || 'Unnamed'}...`, 'info');
            
            // Load the layout
            if (this.world) {
              this.world.load(JSON.stringify(layoutToLoad.data));
              console.log('📊 [BENCHMARK] Layout loaded successfully');
            }
          } else {
            console.warn('📊 [BENCHMARK] Selected layout not found');
          }
        } catch (error) {
          console.error('📊 [BENCHMARK] Error loading layout:', error);
          this.showNotification('Error loading layout for benchmark', 'error');
        }
      } else {
        console.log('📊 [BENCHMARK] Using current layout');
      }
      
      // Set car count
      if (this.world) {
        this.world.carsNumber = this.benchmarkSettings.cars;
        
        // Update car slider to match
        const carSlider = document.getElementById('cars-value');
        const carRange = document.getElementById('cars-range') as HTMLInputElement;
        if (carSlider) carSlider.textContent = this.benchmarkSettings.cars.toString();
        if (carRange) carRange.value = this.benchmarkSettings.cars.toString();
      }
      
      // Set traffic control model
      this.selectedTrafficControlModel = this.benchmarkSettings.model;
      this.applyTrafficControlModelToAllIntersections();
      this.setupTrafficControlModelUI();
      
      // Set time factor
      if (this.visualizer) {
        this.visualizer.timeFactor = this.benchmarkSettings.timeFactor;
        
        // Update time factor UI
        const timeFactorValue = document.getElementById('time-factor-value');
        const timeFactorRange = document.getElementById('time-factor-range') as HTMLInputElement;
        if (timeFactorValue) timeFactorValue.textContent = this.benchmarkSettings.timeFactor.toString();
        if (timeFactorRange) timeFactorRange.value = this.benchmarkSettings.timeFactor.toString();
      }
      
      // 3. Clear benchmark data
      this.benchmarkResults = {};
      this.benchmarkIntervalSamples = [];
      
      // 4. Start KPI collection
      console.log('📊 [BENCHMARK] Starting KPI collection');
      kpiCollector.reset();
      kpiCollector.startRecording(0);
      
      // 5. Start simulation
      console.log('📊 [BENCHMARK] Starting simulation run');
      this.benchmarkStartTime = this.world?.time || 0;
      
      // If simulation is already running, don't toggle again
      if (!this.isRunning) {
        this.toggleSimulation();
      }
      
      // 6. Set up timer to collect data at intervals and end the benchmark
      this.startBenchmarkTimer();
      
    } catch (error) {
      console.error('📊 [BENCHMARK ERROR]', error);
      this.isBenchmarkRunning = false;
      this.showNotification('Failed to start benchmark', 'error');
    }
  }
  
  /**
   * Starts the benchmark timer to collect data and end the benchmark
   */
  private startBenchmarkTimer(): void {
    // Clear any existing timer
    if (this.benchmarkTimer) {
      clearInterval(this.benchmarkTimer);
    }
    
    console.log('📊 [BENCHMARK] Starting timer for', this.benchmarkDuration, 'seconds');
    
    // Sample rate in ms (collect data every 5 seconds of simulation time)
    const sampleIntervalSim = 2; // simulation seconds
    let lastSampleTime = this.benchmarkStartTime;
    
    // Real-world interval for checking (more frequent)
    const checkInterval = 200; // ms
    
    // Set the timer
    this.benchmarkTimer = window.setInterval(() => {
      if (!this.world || !this.isRunning) {
        console.warn('📊 [BENCHMARK] World or simulation not running');
        this.endBenchmark('cancelled');
        return;
      }
      
      // Current simulation time
      const currentTime = this.world.time;
      
      // Calculate elapsed time in simulation seconds
      const elapsedTime = currentTime - this.benchmarkStartTime;
      
      // Calculate progress (0-100%)
      const progress = Math.min(100, (elapsedTime / this.benchmarkDuration) * 100);
      
      // Check if it's time to collect a data sample
      if (this.benchmarkSettings.collectData && currentTime - lastSampleTime >= sampleIntervalSim) {
        // Collect data sample
        this.collectBenchmarkSample(elapsedTime);
        lastSampleTime = currentTime;
      }
      
      // Check if benchmark is complete
      if (elapsedTime >= this.benchmarkDuration) {
        console.log('📊 [BENCHMARK] Duration reached, ending benchmark');
        this.endBenchmark('completed');
      }
    }, checkInterval);
  }
  
  /**
   * Collects a data sample for the benchmark
   */
  private collectBenchmarkSample(elapsedTime: number): void {
    if (!this.world) return;
    
    // Get metrics
    const metrics = kpiCollector.getMetrics(this.world.time);
    
    // Store sample with timestamp
    this.benchmarkIntervalSamples.push({
      time: elapsedTime,
      metrics: { ...metrics }
    });
    
    console.log('📊 [BENCHMARK] Sample collected at time', elapsedTime.toFixed(1));
  }
  
  /**
   * Ends the benchmark and shows results
   */
  private endBenchmark(status: 'completed' | 'cancelled'): void {
    // Clear timer
    if (this.benchmarkTimer) {
      clearInterval(this.benchmarkTimer);
      this.benchmarkTimer = null;
    }
    
    // If cancelled, just clean up
    if (status === 'cancelled') {
      console.log('📊 [BENCHMARK] Benchmark cancelled');
      this.isBenchmarkRunning = false;
      this.showNotification('Benchmark cancelled', 'warning');
      return;
    }
    
    console.log('📊 [BENCHMARK] Benchmark completed, processing results');
    
    try {
      // Pause simulation
      if (this.isRunning) {
        this.toggleSimulation();
      }
      
      // Get final metrics
      const finalMetrics = kpiCollector.getMetrics(this.world?.time || 0);
      
      // Store results
      this.benchmarkResults = {
        settings: { ...this.benchmarkSettings },
        duration: this.world?.time - this.benchmarkStartTime || 0,
        samples: this.benchmarkIntervalSamples,
        metrics: finalMetrics,
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 [BENCHMARK] Results processed:', this.benchmarkResults);
      
      // Show notification
      this.showNotification('Benchmark completed successfully!', 'success');
      
      // Show results
      this.showBenchmarkResults();
      
      // Export if configured
      if (this.benchmarkSettings.exportResults) {
        this.exportBenchmarkResults();
      }
    } catch (error) {
      console.error('📊 [BENCHMARK] Error processing results:', error);
      this.showNotification('Error processing benchmark results', 'error');
    } finally {
      // Reset benchmark state
      this.isBenchmarkRunning = false;
    }
  }
  
  /**
   * Shows the benchmark results in a modal
   */
  private showBenchmarkResults(): void {
    // Create results modal if it doesn't exist
    let resultsModal = document.getElementById('benchmark-results-modal');
    
    if (!resultsModal) {
      resultsModal = document.createElement('div');
      resultsModal.id = 'benchmark-results-modal';
      resultsModal.className = 'modal';
      
      resultsModal.innerHTML = `
        <div class="modal-content benchmark-results-content">
          <div class="modal-header">
            <span class="close">&times;</span>
            <h2>KPI Benchmark Results</h2>
          </div>
          <div class="modal-body">
            <div id="benchmark-summary" class="benchmark-summary">
              <!-- Summary info will be added here dynamically -->
            </div>
            <div id="benchmark-metrics" class="benchmark-metrics">
              <!-- Metrics will be added here dynamically -->
            </div>
            <div id="benchmark-charts" class="benchmark-charts">
              <!-- Charts will be added here dynamically -->
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="close-benchmark-results">Close</button>
            <button class="btn btn-success" id="export-benchmark-results">Export Results (CSV)</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(resultsModal);
    }
    
    // Add CSS for the results modal
    this.addBenchmarkModalStyles();
    
    // Populate the results
    this.populateBenchmarkResults();
    
    // Add event listeners
    const closeBtn = resultsModal.querySelector('.close');
    const closeResultsBtn = document.getElementById('close-benchmark-results');
    const exportResultsBtn = document.getElementById('export-benchmark-results');
    
    const closeModal = () => {
      resultsModal!.style.display = 'none';
      
      // Remove event listeners
      if (closeBtn) closeBtn.removeEventListener('click', closeModal);
      if (closeResultsBtn) closeResultsBtn.removeEventListener('click', closeModal);
      if (exportResultsBtn) exportResultsBtn.removeEventListener('click', this.exportBenchmarkResults);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeResultsBtn) closeResultsBtn.addEventListener('click', closeModal);
    if (exportResultsBtn) exportResultsBtn.addEventListener('click', () => this.exportBenchmarkResults());
    
    // Show the modal
    resultsModal.style.display = 'block';
  }
  
  /**
   * Populates the benchmark results in the results modal
   */
  private populateBenchmarkResults(): void {
    const summaryContainer = document.getElementById('benchmark-summary');
    const metricsContainer = document.getElementById('benchmark-metrics');
    
    if (!summaryContainer || !metricsContainer || !this.benchmarkResults?.metrics) {
      console.error('📊 [BENCHMARK] Cannot display results: Missing elements or data');
      return;
    }
    
    const metrics = this.benchmarkResults.metrics;
    const settings = this.benchmarkResults.settings;
    const duration = this.benchmarkResults.duration;
    
    // Format the summary section
    let layoutName = 'Current Layout';
    if (settings.layoutId) {
      const layout = this.layouts.find(l => l.id === settings.layoutId);
      if (layout) {
        layoutName = layout.name || `Layout ${layout.id}`;
      }
    }
    
    summaryContainer.innerHTML = `
      <h3>Benchmark Summary</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Layout</div>
          <div class="summary-value">${layoutName}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Control Model</div>
          <div class="summary-value">${this.getReadableModelName(settings.model)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Duration</div>
          <div class="summary-value">${duration.toFixed(1)} sec</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Vehicles</div>
          <div class="summary-value">${settings.cars}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Time Factor</div>
          <div class="summary-value">${settings.timeFactor}x</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Timestamp</div>
          <div class="summary-value">${new Date(this.benchmarkResults.timestamp).toLocaleString()}</div>
        </div>
      </div>
    `;
    
    // Format the metrics section
    metricsContainer.innerHTML = `
      <h3>Performance Metrics</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-title">Traffic Flow</div>
          <div class="metric-value">${metrics.globalThroughput.toFixed(2)}</div>
          <div class="metric-unit">vehicles/min</div>
        </div>
        <div class="metric-card ${metrics.congestionIndex > 0.7 ? 'critical' : metrics.congestionIndex > 0.5 ? 'warning' : 'good'}">
          <div class="metric-title">Congestion Index</div>
          <div class="metric-value">${metrics.congestionIndex.toFixed(2)}</div>
          <div class="metric-unit">ratio</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Average Speed</div>
          <div class="metric-value">${metrics.averageSpeed.toFixed(2)}</div>
          <div class="metric-unit">m/s</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Average Wait</div>
          <div class="metric-value">${metrics.averageWaitTime.toFixed(1)}</div>
          <div class="metric-unit">seconds</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Completed Trips</div>
          <div class="metric-value">${metrics.completedTrips}</div>
          <div class="metric-unit">vehicles</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Stopped Vehicles</div>
          <div class="metric-value">${metrics.stoppedVehicles}</div>
          <div class="metric-unit">count</div>
        </div>
      </div>
      
      <h3>Network Performance</h3>
      <table class="results-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Intersections</td>
            <td>${metrics.totalIntersections}</td>
          </tr>
          <tr>
            <td>Total Roads</td>
            <td>${metrics.totalRoads}</td>
          </tr>
          <tr>
            <td>Active Vehicles</td>
            <td>${metrics.activeVehicles}</td>
          </tr>
          <tr>
            <td>Total Vehicles</td>
            <td>${metrics.totalVehicles}</td>
          </tr>
          <tr>
            <td>Total Stops</td>
            <td>${metrics.totalStops}</td>
          </tr>
          <tr>
            <td>Maximum Wait Time</td>
            <td>${metrics.maxWaitTime.toFixed(1)}s</td>
          </tr>
        </tbody>
      </table>
    `;
  }
  
  /**
   * Exports benchmark results as a CSV file
   */
  private exportBenchmarkResults(): void {
    if (!this.benchmarkResults || !this.benchmarkResults.metrics) {
      console.error('📊 [BENCHMARK] No results to export');
      this.showNotification('No benchmark results to export', 'warning');
      return;
    }
    
    try {
      const metrics = this.benchmarkResults.metrics;
      const settings = this.benchmarkResults.settings;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `traffic-benchmark-${timestamp}.csv`;
      
      // Get layout name
      let layoutName = 'Current Layout';
      if (settings.layoutId) {
        const layout = this.layouts.find(l => l.id === settings.layoutId);
        if (layout) {
          layoutName = layout.name || `Layout ${layout.id}`;
        }
      }
      
      // Create CSV content
      let csvContent = 'Parameter,Value\n';
      
      // Add settings
      csvContent += [
        ['Layout', layoutName],
        ['Control Model', this.getReadableModelName(settings.model)],
        ['Duration (sec)', this.benchmarkResults.duration.toFixed(1)],
        ['Vehicles', settings.cars],
        ['Time Factor', settings.timeFactor],
        ['Timestamp', new Date(this.benchmarkResults.timestamp).toLocaleString()],
        ['', ''], // Empty row for separation
        ['Metric', 'Value'], // Header for metrics section
        ['Global Throughput (veh/min)', metrics.globalThroughput.toFixed(2)],
        ['Congestion Index', metrics.congestionIndex.toFixed(2)],
        ['Average Speed (m/s)', metrics.averageSpeed.toFixed(2)],
        ['Average Wait Time (sec)', metrics.averageWaitTime.toFixed(1)],
        ['Maximum Wait Time (sec)', metrics.maxWaitTime.toFixed(1)],
        ['Completed Trips', metrics.completedTrips],
        ['Stopped Vehicles', metrics.stoppedVehicles],
        ['Total Stops', metrics.totalStops],
        ['Total Intersections', metrics.totalIntersections],
        ['Total Roads', metrics.totalRoads],
        ['Active Vehicles', metrics.activeVehicles],
        ['Total Vehicles', metrics.totalVehicles]
      ].map(row => `"${row[0]}","${row[1]}"`).join('\n');
      
      // If we have samples, add them
      if (this.benchmarkIntervalSamples && this.benchmarkIntervalSamples.length > 0) {
        csvContent += '\n\n"Time (sec)","Active Vehicles","Average Speed","Congestion Index","Throughput"\n';
        
        csvContent += this.benchmarkIntervalSamples.map(sample => {
          const sampleMetrics = sample.metrics;
          return [
            sample.time.toFixed(1),
            sampleMetrics.activeVehicles,
            sampleMetrics.averageSpeed.toFixed(2),
            sampleMetrics.congestionIndex.toFixed(2),
            sampleMetrics.globalThroughput.toFixed(2)
          ].join(',');
        }).join('\n');
      }
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showNotification('Benchmark results exported as CSV', 'success');
      
    } catch (error) {
      console.error('📊 [BENCHMARK] Error exporting results:', error);
      this.showNotification('Error exporting benchmark results', 'error');
    }
  }
  
  /**
   * Populates the layout selection dropdown in the benchmark modal
   */
  private populateLayoutOptions(): void {
    const layoutSelect = document.getElementById('benchmark-layout') as HTMLSelectElement;
    if (!layoutSelect) return;
    
    // Clear existing options except the first one (Current Layout)
    while (layoutSelect.options.length > 1) {
      layoutSelect.remove(1);
    }
    
    // Add options for each layout
    this.layouts.forEach(layout => {
      const option = document.createElement('option');
      option.value = layout.id;
      option.textContent = layout.name || `Layout ${layout.id}`;
      layoutSelect.appendChild(option);
    });
  }
  
  /**
   * Adds CSS styles for the benchmark modals
   */
  private addBenchmarkModalStyles(): void {
    if (document.getElementById('benchmark-modal-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'benchmark-modal-styles';
    styleElement.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.7);
      }
      
      .modal-content {
        background-color: #2d2d2d;
        margin: 5% auto;
        padding: 0;
        border: 1px solid #404040;
        width: 80%;
        max-width: 800px;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        border-radius: 5px;
      }
      
      .benchmark-modal-content {
        max-width: 600px;
      }
      
      .benchmark-results-content {
        max-width: 800px;
      }
      
      .modal-header {
        padding: 15px;
        background-color: #375a7f;
        color: white;
        border-bottom: 1px solid #222;
        border-radius: 5px 5px 0 0;
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 20px;
      }
      
      .modal-body {
        padding: 15px;
        max-height: 70vh;
        overflow-y: auto;
      }
      
      .modal-footer {
        padding: 15px;
        background-color: #333;
        border-top: 1px solid #404040;
        text-align: right;
        border-radius: 0 0 5px 5px;
      }
      
      .close {
        color: white;
        float: right;
        font-size: 28px;
        font-weight: bold;
        line-height: 20px;
      }
      
      .close:hover,
      .close:focus {
        color: #aaa;
        text-decoration: none;
        cursor: pointer;
      }
      
      .benchmark-settings {
        padding: 10px;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #ddd;
        font-weight: 500;
      }
      
      .form-control {
        width: 100%;
        padding: 8px;
        border: 1px solid #444;
        background-color: #333;
        color: #fff;
        border-radius: 3px;
      }
      
      .setting-description {
        font-size: 12px;
        color: #aaa;
        margin-top: 5px;
        display: block;
      }
      
      .benchmark-options {
        margin-top: 20px;
        border-top: 1px solid #444;
        padding-top: 15px;
      }
      
      .option {
        margin-bottom: 10px;
      }
      
      .benchmark-summary {
        background-color: #333;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 15px;
        margin-top: 10px;
      }
      
      .summary-item {
        background-color: #2a2a2a;
        padding: 10px;
        border-radius: 3px;
        border: 1px solid #444;
      }
      
      .summary-label {
        font-size: 12px;
        color: #aaa;
        margin-bottom: 5px;
      }
      
      .summary-value {
        font-size: 16px;
        font-weight: 500;
        color: #fff;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .metric-card {
        background-color: #2a2a2a;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        border: 1px solid #444;
      }
      
      .metric-card.good {
        border-color: #00bc8c;
        background-color: rgba(0, 188, 140, 0.2);
      }
      
      .metric-card.warning {
        border-color: #f39c12;
        background-color: rgba(243, 156, 18, 0.2);
      }
      
      .metric-card.critical {
        border-color: #e74c3c;
        background-color: rgba(231, 76, 60, 0.2);
      }
      
      .metric-title {
        font-size: 12px;
        color: #aaa;
        margin-bottom: 5px;
      }
      
      .metric-value {
        font-size: 22px;
        font-weight: 700;
        color: #fff;
      }
      
      .metric-unit {
        font-size: 12px;
        color: #888;
        margin-top: 5px;
      }
      
      .results-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        margin-bottom: 20px;
      }
      
      .results-table th {
        background-color: #375a7f;
        color: white;
        text-align: left;
        padding: 8px 12px;
      }
      
      .results-table td {
        padding: 8px 12px;
        border-bottom: 1px solid #444;
      }
      
      .results-table tr:nth-child(even) {
        background-color: #2a2a2a;
      }
      
      .benchmark-charts {
        margin-top: 30px;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
}
