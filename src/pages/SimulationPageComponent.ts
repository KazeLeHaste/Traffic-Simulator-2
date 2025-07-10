import { appState } from '../core/AppState';
import World = require('../model/world');
import Visualizer = require('../visualizer/visualizer');
import _ = require('underscore');
import { kpiCollector } from '../model/kpi-collector';
import { trafficControlStrategyManager } from '../model/traffic-control/TrafficControlStrategyManager';
import { KPIVisualizationComponent, BenchmarkRun } from '../components/KPIVisualizationComponent';
import { BenchmarkConfigurationComponent, BenchmarkConfiguration } from '../components/BenchmarkConfigurationComponent';

/**
 * Simulation page for running traffic simulations
 */
export class SimulationPageComponent {
  private container: HTMLElement;
  private world: any;
  private visualizer: any;
  private layouts: any[] = [];
  private scenarios: any[] = [];
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
  private currentScenario: any = null;

  // GUI control for settings
  private gui: any = null;
  
  // KPI Visualization Component
  private kpiVisualization: KPIVisualizationComponent | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  // Handle window resize event
  private handleResize = (): void => {
    if (this.visualizer) {
      this.visualizer.resize(window.innerWidth, window.innerHeight);
    }
  }

  private async init(): Promise<void> {
    // Apply styles first to prevent theme flicker
    this.addStyles();
    
    await this.loadLayouts();
    await this.loadScenarios();
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

  private async loadLayouts(): Promise<void> {
    try {
      this.layouts = await appState.storage.loadAllLayouts();
    } catch (error) {
      console.error('Failed to load layouts:', error);
      this.layouts = [];
    }
  }
  
  private async loadScenarios(): Promise<void> {
    try {
      this.scenarios = await appState.storage.loadAllScenarios();
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      this.scenarios = [];
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
            
            <!-- Scenario Management Panel -->
            <div class="panel">
              <h3>Scenario Management</h3>
              
              <div class="control-group">
                <button id="save-scenario" class="btn btn-primary btn-block">
                  💾 Save Current Scenario
                </button>
              </div>
              
              <div class="control-group">
                <button id="load-scenario" class="btn btn-info btn-block">
                  📂 Load Scenario
                </button>
              </div>
              
              <div class="scenario-status">
                <small class="text-muted">
                  ${this.scenarios.length > 0 
                    ? `${this.scenarios.length} saved scenario(s) available` 
                    : 'No saved scenarios found.'
                  }
                </small>
                ${this.currentScenario 
                  ? `<div class="current-scenario-info">Current: ${this.currentScenario.name}</div>` 
                  : ''
                }
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
                
                <!-- All metrics and buttons below Congestion Index are removed from the sidebar -->
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
          
          <div class="visualization-area">
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
      
      <!-- Scenario Dialog -->
      <div id="scenario-dialog" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Scenario Management</h2>
            <span class="close-modal" id="close-scenario-dialog">&times;</span>
          </div>
          <div class="modal-body">
            <!-- Tabs -->
            <div class="dialog-tabs">
              <button class="tab-btn active" data-tab="save-tab">Save Scenario</button>
              <button class="tab-btn" data-tab="load-tab">Load Scenario</button>
            </div>
            
            <!-- Save Tab -->
            <div id="save-tab" class="tab-content">
              <div class="form-group">
                <label for="scenario-name">Scenario Name:</label>
                <input type="text" id="scenario-name" class="form-control" placeholder="Enter a name for this scenario">
              </div>
              <div class="form-group">
                <label for="scenario-description">Description (optional):</label>
                <textarea id="scenario-description" class="form-control" placeholder="Add a description"></textarea>
              </div>
              <button id="save-scenario-confirm" class="btn btn-primary">Save Scenario</button>
            </div>
            
            <!-- Load Tab -->
            <div id="load-tab" class="tab-content" style="display: none;">
              <div class="scenarios-list-container">
                <ul id="scenarios-list" class="scenarios-list">
                  <!-- Scenarios will be listed here dynamically -->
                </ul>
              </div>
              <div class="form-actions">
                <button id="load-scenario-confirm" class="btn btn-primary" disabled>Load Selected</button>
                <button id="delete-scenario" class="btn btn-danger" disabled>Delete Selected</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Update the visualization area if needed
    const visualizationArea = this.container.querySelector('.visualizer-area');
    if (visualizationArea) {
      // Any additional setup for the visualization area
    }
  }

  private addEventListeners() {
    // Load layout button
    const loadLayoutButton = document.getElementById('load-layout');
    loadLayoutButton?.addEventListener('click', () => this.showLoadLayoutDialog());
    
    // Save scenario button
    const saveScenarioButton = document.getElementById('save-scenario');
    saveScenarioButton?.addEventListener('click', () => this.showScenarioDialog('save'));
    
    // Load scenario button
    const loadScenarioButton = document.getElementById('load-scenario');
    loadScenarioButton?.addEventListener('click', () => this.showScenarioDialog('load'));

    // Toggle simulation button
    const toggleSimulationButton = document.getElementById('toggle-simulation');
    toggleSimulationButton?.addEventListener('click', () => this.toggleSimulation());

    // Reset simulation button
    const resetSimulationButton = document.getElementById('reset-simulation');
    resetSimulationButton?.addEventListener('click', () => this.resetSimulation());

    // Run benchmark button
    const runBenchmarkButton = document.getElementById('run-benchmark');
    runBenchmarkButton?.addEventListener('click', () => this.runBenchmark());

    // Traffic control model dropdown
    const trafficControlModelSelect = document.getElementById('traffic-control-model') as HTMLSelectElement;
    trafficControlModelSelect?.addEventListener('change', () => {
      this.selectedTrafficControlModel = trafficControlModelSelect.value;
      this.updateTrafficControlModel();
    });

    // Cars range slider
    const carsRangeSlider = document.getElementById('cars-range') as HTMLInputElement;
    carsRangeSlider?.addEventListener('input', () => {
      const value = parseInt(carsRangeSlider.value);
      document.getElementById('cars-value')!.textContent = value.toString();
      if (this.world) {
        this.world.carsNumber = value;
      }
    });

    // Time factor range slider
    const timeFactorRangeSlider = document.getElementById('time-factor-range') as HTMLInputElement;
    timeFactorRangeSlider?.addEventListener('input', () => {
      const value = parseFloat(timeFactorRangeSlider.value);
      document.getElementById('time-factor-value')!.textContent = value.toFixed(1);
      if (this.visualizer) {
        this.visualizer.setTimeFactor(value);
      }
    });

    // Toggle analytics button
    const toggleAnalyticsButton = document.getElementById('toggle-analytics');
    toggleAnalyticsButton?.addEventListener('click', () => {
      const panel = document.getElementById('analytics-panel');
      if (!panel) return;
      
      const isHidden = panel?.style.display === 'none';
      panel!.style.display = isHidden ? 'block' : 'none';
      toggleAnalyticsButton.textContent = isHidden ? 'Hide Analytics' : 'Show Analytics';
    });
    
    // Close scenario dialog button
    const closeScenarioDialogBtn = document.getElementById('close-scenario-dialog');
    closeScenarioDialogBtn?.addEventListener('click', () => {
      const dialog = document.getElementById('scenario-dialog');
      if (dialog) {
        dialog.style.display = 'none';
      }
    });

    // Tab buttons in scenario dialog
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabId = target.getAttribute('data-tab');
        
        // Hide all tab contents and remove active class
        document.querySelectorAll('.tab-content').forEach(content => {
          (content as HTMLElement).style.display = 'none';
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Show selected tab content and add active class
        if (tabId) {
          document.getElementById(tabId)!.style.display = 'block';
          target.classList.add('active');
        }
      });
    });
    
    // Save scenario confirm button
    const saveScenarioConfirmButton = document.getElementById('save-scenario-confirm');
    saveScenarioConfirmButton?.addEventListener('click', () => this.saveScenario());
    
    // Load scenario confirm button
    const loadScenarioConfirmButton = document.getElementById('load-scenario-confirm');
    loadScenarioConfirmButton?.addEventListener('click', (e) => {
      console.log('Load scenario button clicked');
      e.preventDefault();
      this.loadSelectedScenario();
    });
    
    // Delete scenario button
    const deleteScenarioButton = document.getElementById('delete-scenario');
    deleteScenarioButton?.addEventListener('click', () => {
      const selectedItem = document.querySelector('.list-item.selected');
      if (selectedItem) {
        const scenarioId = selectedItem.getAttribute('data-id');
        if (scenarioId) {
          this.deleteScenario(scenarioId);
        }
      } else {
        this.showNotification('No scenario selected', 'warning');
      }
    });
    
    // Add click listener to scenarios list items to enable/disable buttons
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Check if click is on a list item or its children (excluding delete button)
      if (target.closest('.list-item') && !target.classList.contains('btn-delete')) {
        const loadButton = document.getElementById('load-scenario-confirm') as HTMLButtonElement;
        const deleteButton = document.getElementById('delete-scenario') as HTMLButtonElement;
        
        if (loadButton) loadButton.disabled = false;
        if (deleteButton) deleteButton.disabled = false;
      }
    });
    
    // Export metrics buttons
    const exportCSVButton = document.getElementById('export-metrics-csv');
    exportCSVButton?.addEventListener('click', () => {
      kpiCollector.downloadMetricsCSV();
      this.showNotification('CSV exported successfully', 'success');
    });
    
    const exportJSONButton = document.getElementById('export-metrics-json');
    exportJSONButton?.addEventListener('click', () => {
      kpiCollector.downloadMetricsJSON();
      this.showNotification('JSON exported successfully', 'success');
    });
    
    // Validate metrics button (enhanced functionality)
    const validateMetricsButton = document.getElementById('validate-metrics');
    validateMetricsButton?.addEventListener('click', () => {
      // Get validation results from KPI collection accuracy
      const kpiValidationResults = kpiCollector.validateMetrics();
      
      // Get export validation results
      const exportValidation = kpiCollector.validateExportData();
      
      const validationOutput = document.getElementById('validation-output');
      const validationHtmlResults = document.getElementById('validation-html-results');
      
      if (validationOutput && validationHtmlResults) {
        // Combine both validation results
        let combinedResults = `
          <div class="validation-section">
            <h4>📊 KPI Collection Validation</h4>
            ${kpiValidationResults}
          </div>
          
          <div class="validation-section">
            <h4>📤 Export Data Validation</h4>
            <div class="export-validation-summary">
              <p><strong>${exportValidation.summary}</strong></p>
            </div>
            
            ${exportValidation.discrepancies.length > 0 ? `
              <div class="validation-discrepancies">
                <h5>Found Discrepancies:</h5>
                <ul>
                  ${exportValidation.discrepancies.map(d => `<li class="validation-error">${d}</li>`).join('')}
                </ul>
              </div>
            ` : `
              <div class="validation-success">
                <p>✅ All export formats (CSV and JSON) accurately match the UI display data.</p>
                <p>✅ Data integrity verified across all metric categories.</p>
              </div>
            `}
          </div>
        `;
        
        validationHtmlResults.innerHTML = combinedResults;
        validationOutput.style.display = 'block';
      }
      
      const notificationType = exportValidation.isValid ? 'success' : 'warning';
      const notificationMessage = exportValidation.isValid 
        ? 'All validations passed - data is accurate and complete'
        : `Validation completed with ${exportValidation.discrepancies.length} issue(s) found`;
        
      this.showNotification(notificationMessage, notificationType);
    });
    
    // Toggle lane metrics table
    const toggleLaneMetricsButton = document.getElementById('toggle-lane-metrics');
    toggleLaneMetricsButton?.addEventListener('click', () => {
      const container = document.getElementById('lane-metrics-container');
      if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
      }
    });
    
    // Toggle intersection metrics table
    const toggleIntersectionMetricsButton = document.getElementById('toggle-intersection-metrics');
    toggleIntersectionMetricsButton?.addEventListener('click', () => {
      const container = document.getElementById('intersection-metrics-container');
      if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
      }
    });
  }

  // Show the scenario dialog for saving or loading
  private showScenarioDialog(mode: 'save' | 'load'): void {
    const dialog = document.getElementById('scenario-dialog')!;
    dialog.style.display = 'block';
    
    // Set the active tab based on mode
    const saveTab = document.getElementById('save-tab')!;
    const loadTab = document.getElementById('load-tab')!;
    const saveTabBtn = document.querySelector(`.tab-btn[data-tab="save-tab"]`)!;
    const loadTabBtn = document.querySelector(`.tab-btn[data-tab="load-tab"]`)!;
    
    if (mode === 'save') {
      saveTab.style.display = 'block';
      loadTab.style.display = 'none';
      saveTabBtn.classList.add('active');
      loadTabBtn.classList.remove('active');
    } else {
      saveTab.style.display = 'none';
      loadTab.style.display = 'block';
      saveTabBtn.classList.remove('active');
      loadTabBtn.classList.add('active');
      
      // Populate the scenarios list
      this.populateScenariosListUI();
    }
  }
  
  // Populate the scenarios list in the UI
  private populateScenariosListUI(): void {
    const scenariosList = document.getElementById('scenarios-list')!;
    
    // Clear the list
    scenariosList.innerHTML = '';
    
    if (this.scenarios.length === 0) {
      scenariosList.innerHTML = '<div class="list-empty-message">No saved scenarios found.</div>';
      
      // Disable the load/delete buttons since there are no scenarios
      const loadButton = document.getElementById('load-scenario-confirm') as HTMLButtonElement;
      const deleteButton = document.getElementById('delete-scenario') as HTMLButtonElement;
      if (loadButton) loadButton.disabled = true;
      if (deleteButton) deleteButton.disabled = true;
      
      return;
    }
    
    console.log(`Populating scenarios list with ${this.scenarios.length} scenarios`);
    
    // Add each scenario to the list
    this.scenarios.forEach(scenario => {
      console.log(`Adding scenario to list: ${scenario.id} - ${scenario.name}`);
      
      const scenarioItem = document.createElement('div');
      scenarioItem.className = 'list-item';
      scenarioItem.dataset.id = scenario.id;
      
      const date = new Date(scenario.createdAt).toLocaleDateString();
      const time = new Date(scenario.createdAt).toLocaleTimeString();
      
      scenarioItem.innerHTML = `
        <div class="list-item-info">
          <div class="list-item-title">${scenario.name}</div>
          <div class="list-item-meta">Created: ${date} ${time}</div>
        </div>
        <button class="btn-delete" data-id="${scenario.id}">&times;</button>
      `;
      
      // Add click event to select the scenario
      scenarioItem.addEventListener('click', (e) => {
        // Ignore clicks on the delete button
        if ((e.target as HTMLElement).classList.contains('btn-delete')) {
          return;
        }
        
        console.log(`Scenario selected: ${scenario.id} - ${scenario.name}`);
        
        // Remove the 'selected' class from all items
        document.querySelectorAll('.list-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Add the 'selected' class to this item
        scenarioItem.classList.add('selected');
        
        // Enable the load and delete buttons
        const loadButton = document.getElementById('load-scenario-confirm') as HTMLButtonElement;
        const deleteButton = document.getElementById('delete-scenario') as HTMLButtonElement;
        if (loadButton) loadButton.disabled = false;
        if (deleteButton) deleteButton.disabled = false;
      });
      
      // Add double-click event to load the scenario immediately
      scenarioItem.addEventListener('dblclick', (e) => {
        // Ignore double clicks on the delete button
        if ((e.target as HTMLElement).classList.contains('btn-delete')) {
          return;
        }
        
        console.log(`Scenario double-clicked (loading): ${scenario.id} - ${scenario.name}`);
        this.loadScenarioById(scenario.id);
      });
      
      // Add delete button event
      const deleteButton = scenarioItem.querySelector('.btn-delete');
      deleteButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`Delete button clicked for scenario: ${scenario.id}`);
        this.deleteScenario(scenario.id);
      });
      
      scenariosList.appendChild(scenarioItem);
    });
  }
  
  // Save the current scenario
  private async saveScenario(): Promise<void> {
    if (!this.world) {
      this.showNotification('No simulation world to save', 'warning');
      return;
    }
    
    // Get scenario name from input
    const scenarioNameInput = document.getElementById('scenario-name') as HTMLInputElement;
    const scenarioName = scenarioNameInput.value.trim() || `Scenario ${new Date().toLocaleString()}`;
    
    // Get scenario description from input
    const scenarioDescriptionInput = document.getElementById('scenario-description') as HTMLTextAreaElement;
    const scenarioDescription = scenarioDescriptionInput.value.trim();
    
    // Get scenario data from world
    const scenarioData = this.world.saveAsScenario();
    
    // Add description to scenario data
    scenarioData.description = scenarioDescription;
    
    try {
      // Save scenario
      await appState.storage.saveScenario(scenarioData, scenarioName);
      
      // Reload scenarios
      await this.loadScenarios();
      
      // Find the newly saved scenario from the reloaded scenarios list
      const newScenarioId = `scenario_${Date.now()}`;
      // Get most recently saved scenario (should be the last one in the array)
      const savedScenario = this.scenarios.length > 0 ? this.scenarios[this.scenarios.length - 1] : null;
      
      // Update current scenario info
      this.currentScenario = savedScenario || {
        name: scenarioName,
        id: newScenarioId,
        data: scenarioData
      };
      
      // Update scenario status in UI
      const scenarioStatus = document.querySelector('.scenario-status');
      if (scenarioStatus) {
        scenarioStatus.innerHTML = `
          <small class="text-muted">
            ${this.scenarios.length} saved scenario(s) available
          </small>
          <div class="current-scenario-info">Current: ${scenarioName}</div>
        `;
      }
      
      // Close dialog
      document.getElementById('scenario-dialog')!.style.display = 'none';
      
      // Show success notification
      this.showNotification('Scenario saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save scenario:', error);
      this.showNotification('Failed to save scenario', 'error');
    }
  }
  
  // Load a scenario by ID
  private async loadScenarioById(id: string): Promise<void> {
    try {
      console.log(`Attempting to load scenario with ID: ${id}`);
      
      // Debug: List all available scenarios
      console.log('Available scenarios:', this.scenarios);
      
      const scenarioData = await appState.storage.loadScenario(id);
      console.log('Loaded scenario data:', scenarioData);
      
      if (!scenarioData) {
        console.error(`No scenario data found for ID: ${id}`);
        this.showNotification('Scenario not found', 'error');
        return;
      }
      
      // Find the scenario in the scenarios array to get its name
      const scenario = this.scenarios.find(s => s.id === id);
      console.log('Found scenario metadata:', scenario);
      
      if (!scenario) {
        console.error(`Scenario metadata not found for ID: ${id}`);
        this.showNotification('Scenario metadata not found', 'error');
        return;
      }
      
      // Load the scenario
      if (this.world) {
        // Stop simulation if running
        if (this.isRunning) {
          this.toggleSimulation();
        }
        
        // Reset KPI collector
        kpiCollector.reset();
        
        try {
          // Load the scenario into the world
          console.log('Loading scenario into world...');
          this.world.loadScenario(scenarioData);
          console.log('Scenario loaded into world successfully');
          
          // Update UI components
          this.updateUIFromWorld();
          
          // Update current scenario info
          this.currentScenario = scenario;
          
          // Update scenario status in UI
          const scenarioStatus = document.querySelector('.scenario-status');
          if (scenarioStatus) {
            scenarioStatus.innerHTML = `
              <small class="text-muted">
                ${this.scenarios.length} saved scenario(s) available
              </small>
              <div class="current-scenario-info">Current: ${scenario.name}</div>
            `;
          }
          
          // Show success notification
          this.showNotification(`Scenario "${scenario.name}" loaded successfully`, 'success');
          
          // Close dialog if it's open
          const dialog = document.getElementById('scenario-dialog');
          if (dialog && dialog.style.display === 'block') {
            dialog.style.display = 'none';
          }
        } catch (worldError) {
          console.error('Error loading scenario into world:', worldError);
          this.showNotification(`Error loading scenario: ${worldError.message}`, 'error');
        }
      } else {
        console.error('World object is not initialized');
        this.showNotification('Simulation world not initialized', 'error');
      }
    } catch (error) {
      console.error('Failed to load scenario:', error);
      this.showNotification(`Failed to load scenario: ${error.message}`, 'error');
    }
  }
  
  // Load the selected scenario from the list
  private loadSelectedScenario(): void {
    console.log('loadSelectedScenario called');
    
    const selectedItem = document.querySelector('.list-item.selected');
    if (!selectedItem) {
      console.warn('No scenario selected');
      this.showNotification('No scenario selected', 'warning');
      return;
    }
    
    const scenarioId = selectedItem.getAttribute('data-id');
    if (!scenarioId) {
      console.error('Selected item does not have a data-id attribute');
      this.showNotification('Invalid scenario selection', 'error');
      return;
    }
    
    console.log(`Loading selected scenario with ID: ${scenarioId}`);
    this.loadScenarioById(scenarioId);
  }
  
  // Delete a scenario
  private async deleteScenario(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return;
    }
    
    try {
      // Delete the scenario from storage
      await appState.storage.deleteScenario(id);
      
      // Reload scenarios
      this.scenarios = await appState.storage.loadAllScenarios();
      
      // Update the UI
      this.populateScenariosListUI();
      
      // Update scenario status
      const scenarioStatus = document.querySelector('.scenario-status');
      if (scenarioStatus) {
        scenarioStatus.innerHTML = `
          <small class="text-muted">
            ${this.scenarios.length} saved scenario(s) available
          </small>
          ${this.currentScenario && this.currentScenario.id !== id
            ? `<div class="current-scenario-info">Current: ${this.currentScenario.name}</div>` 
            : ''
          }
        `;
      }
      
      // Clear current scenario if it was deleted
      if (this.currentScenario && this.currentScenario.id === id) {
        this.currentScenario = null;
      }
      
      // Reset the buttons
      const loadButton = document.getElementById('load-scenario-confirm') as HTMLButtonElement;
      const deleteButton = document.getElementById('delete-scenario') as HTMLButtonElement;
      if (loadButton) loadButton.disabled = true;
      if (deleteButton) deleteButton.disabled = true;
      
      // Show success notification
      this.showNotification('Scenario deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      this.showNotification('Failed to delete scenario', 'error');
    }
  }
  
  // Update UI components from world state
  private updateUIFromWorld(): void {
    if (!this.world) return;
    
    // Update cars range slider
    const carsRangeSlider = document.getElementById('cars-range') as HTMLInputElement;
    if (carsRangeSlider) {
      carsRangeSlider.value = this.world.carsNumber.toString();
      document.getElementById('cars-value')!.textContent = this.world.carsNumber.toString();
    }
    
    // Update traffic control model dropdown
    const trafficControlModelSelect = document.getElementById('traffic-control-model') as HTMLSelectElement;
    if (trafficControlModelSelect && this.world.activeTrafficControlStrategy) {
      trafficControlModelSelect.value = this.world.activeTrafficControlStrategy;
      this.selectedTrafficControlModel = this.world.activeTrafficControlStrategy;
      this.updateActiveModelIndicator(this.selectedTrafficControlModel);
    }
  }
  
  // Update the active model indicator
  private updateActiveModelIndicator(modelType: string): void {
    const indicator = document.getElementById('active-model-indicator');
    if (!indicator) return;
    
    let modelName = 'Fixed Timing';
    
    switch (modelType) {
      case 'fixed-timing':
        modelName = 'Fixed Timing';
        break;
      case 'adaptive-timing':
        modelName = 'Adaptive Timing';
        break;
      case 'traffic-enforcer':
        modelName = 'Traffic Enforcer';
        break;
    }
    
    indicator.textContent = modelName;
  }

  // Initialize the simulation
  private async initializeSimulation(): Promise<void> {
    try {
      // Create a new world instance
      this.world = new World();
      
      // Initialize visualizer with the canvas element
      // Pass world and canvas ID to visualizer (note: constructor expects world first, then canvasId)
      this.visualizer = new Visualizer(this.world, 'simulation-canvas');
      
      // Set initial cars number
      const carsRangeSlider = document.getElementById('cars-range') as HTMLInputElement;
      if (carsRangeSlider) {
        this.world.carsNumber = parseInt(carsRangeSlider.value);
      }
      
      // Set initial time factor
      const timeFactorRangeSlider = document.getElementById('time-factor-range') as HTMLInputElement;
      if (timeFactorRangeSlider && this.visualizer) {
        this.visualizer.setTimeFactor(parseFloat(timeFactorRangeSlider.value));
      }
      
      // Start with an empty map - don't automatically generate one
      // Users should explicitly load a layout or scenario
      
      // Set initial traffic control strategy
      this.updateTrafficControlModel();
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  }
  
  // Show a notification message
  private showNotification(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    // Create notification element if it doesn't exist
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
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        ${message}
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    // Style the notification
    notification.style.backgroundColor = 
      type === 'success' ? '#43a047' : 
      type === 'warning' ? '#fb8c00' : 
      '#e53935';
    notification.style.color = '#fff';
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.transition = 'all 0.3s ease';
    
    // Add close button event
    const closeButton = notification.querySelector('.notification-close') as HTMLButtonElement;
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = '10px';
    closeButton.onclick = () => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    };
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
  
  // Show the load layout dialog
  private showLoadLayoutDialog(): void {
    // Create dialog if it doesn't exist
    let dialog = document.getElementById('load-layout-dialog');
    
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'load-layout-dialog';
      dialog.className = 'dialog';
      
      dialog.innerHTML = `
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>Load Layout</h3>
            <button class="close-btn">&times;</button>
          </div>
          <div class="dialog-body">
            <div id="layouts-list" class="list-container">
              <div class="list-empty-message">No saved layouts found.</div>
            </div>
            <div class="form-actions">
              <button id="load-layout-confirm" class="btn btn-primary">Load</button>
              <button class="btn btn-secondary close-dialog">Cancel</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      // Add close button events
      const closeButtons = dialog.querySelectorAll('.close-btn, .close-dialog');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          dialog!.style.display = 'none';
        });
      });
      
      // Add load button event
      const loadButton = dialog.querySelector('#load-layout-confirm');
      loadButton?.addEventListener('click', () => {
        const selectedItem = document.querySelector('.list-item.selected');
        if (selectedItem) {
          const layoutId = selectedItem.getAttribute('data-id')!;
          this.loadLayoutById(layoutId);
          dialog!.style.display = 'none';
        } else {
          this.showNotification('No layout selected', 'warning');
        }
      });
    }
    
    // Show dialog
    dialog.style.display = 'block';
    
    // Populate layouts list
    this.populateLayoutsListUI();
  }
  
  // Populate the layouts list in the UI
  private populateLayoutsListUI(): void {
    const layoutsList = document.getElementById('layouts-list')!;
    
    // Clear the list
    layoutsList.innerHTML = '';
    
    if (this.layouts.length === 0) {
      layoutsList.innerHTML = '<div class="list-empty-message">No saved layouts found.</div>';
      return;
    }
    
    // Add each layout to the list
    this.layouts.forEach(layout => {
      const layoutItem = document.createElement('div');
      layoutItem.className = 'list-item';
      layoutItem.dataset.id = layout.id;
      
      const date = new Date(layout.createdAt).toLocaleDateString();
      const time = new Date(layout.createdAt).toLocaleTimeString();
      
      layoutItem.innerHTML = `
        <div class="list-item-info">
          <div class="list-item-title">${layout.name}</div>
          <div class="list-item-meta">Created: ${date} ${time}</div>
        </div>
      `;
      
      // Add click event to select the layout
      layoutItem.addEventListener('click', () => {
        // Remove the 'selected' class from all items
        document.querySelectorAll('.list-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Add the 'selected' class to this item
        layoutItem.classList.add('selected');
      });
      
      layoutsList.appendChild(layoutItem);
    });
  }
  
  // Load a layout by ID
  private async loadLayoutById(id: string, customCarsNumber?: number): Promise<void> {
    try {
      console.log('🔄 Starting loadLayoutById for ID:', id, customCarsNumber ? `with ${customCarsNumber} cars` : '');
      // Find the layout in the layouts array
      const layout = this.layouts.find(l => l.id === id);
      
      if (!layout) {
        console.error('❌ Layout not found with ID:', id);
        this.showNotification('Layout not found', 'error');
        return;
      }
      
      console.log('🔄 Found layout:', layout.name);
      
      // Stop simulation if running
      if (this.isRunning) {
        this.toggleSimulation();
      }
      
      // Reset KPI collector
      kpiCollector.reset();
      
      // Clear the current world
      this.world.clear();
      
      // Load the layout data
      if (layout && layout.data) {
        console.log('🔄 Layout data found, loading into world');
        const worldData = layout.data;
        
        // Set car count first - use customCarsNumber if provided, otherwise default to 100
        this.world.carsNumber = customCarsNumber !== undefined ? customCarsNumber : 100;
        
        // Load into world but preserve car count
        this.world.load(JSON.stringify(worldData), true);
        console.log('✅ Layout loaded into world with car count preserved:', this.world.carsNumber);
        console.log(`🚗 Setting car count to ${this.world.carsNumber}`);
        
        // Update UI components
        const carsRangeSlider = document.getElementById('cars-range') as HTMLInputElement;
        if (carsRangeSlider) {
          carsRangeSlider.value = this.world.carsNumber.toString();
          document.getElementById('cars-value')!.textContent = this.world.carsNumber.toString();
        }
        
        // Show success notification
        this.showNotification(`Layout "${layout.name}" loaded successfully`, 'success');
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
      this.showNotification('Failed to load layout', 'error');
    }
  }
  
  // Toggle simulation running state
  private toggleSimulation(): void {
    // Don't allow toggling during benchmark
    if (this.isBenchmarkRunning) {
      this.showNotification('Cannot toggle simulation during benchmark', 'warning');
      return;
    }
    
    // Check if visualizer exists
    if (!this.visualizer) {
      this.showNotification('Cannot start simulation - visualizer not initialized', 'error');
      return;
    }
    
    const toggleButton = document.getElementById('toggle-simulation')!;
    
    if (this.isRunning) {
      // Stop simulation
      this.isRunning = false;
      
      // Safely call stop method on visualizer
      if (typeof this.visualizer.stop === 'function') {
        this.visualizer.stop();
      }
      
      toggleButton.textContent = '▶️ Start Simulation';
      toggleButton.classList.replace('btn-danger', 'btn-success');
      
      // Clear analytics interval
      if (this.analyticsInterval !== null) {
        clearInterval(this.analyticsInterval);
        this.analyticsInterval = null;
      }
      
      // Stop KPI collection
      kpiCollector.stopRecording();
    } else {
      // Start simulation
      this.isRunning = true;
      
      // Safely call start method on visualizer
      if (typeof this.visualizer.start === 'function') {
        this.visualizer.start();
      }
      
      toggleButton.textContent = '⏸ Pause Simulation';
      toggleButton.classList.replace('btn-success', 'btn-danger');
      
      // Start KPI collection
      kpiCollector.startRecording(this.world.time);
      
      // Set up analytics interval
      this.analyticsInterval = window.setInterval(() => {
        this.updateAnalytics();
      }, 500);
    }
  }
  
  // Stop the simulation
  private stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.visualizer) {
        this.visualizer.stop();
      }
      
      // Clear analytics interval
      if (this.analyticsInterval !== null) {
        clearInterval(this.analyticsInterval);
        this.analyticsInterval = null;
      }
      
      // Stop KPI collection
      kpiCollector.stopRecording();
      
      // Update button state
      const toggleButton = document.getElementById('toggle-simulation');
      if (toggleButton) {
        toggleButton.textContent = '▶️ Start Simulation';
        toggleButton.classList.replace('btn-danger', 'btn-success');
      }
    }
  }
  
  // Reset simulation to initial state
  private resetSimulation(): void {
    // Don't allow reset during benchmark
    if (this.isBenchmarkRunning) {
      this.showNotification('Cannot reset simulation during benchmark', 'warning');
      return;
    }
    
    // Store current car number and time factor
    const currentCarsNumber = this.world.carsNumber;
    let currentTimeFactor = 1.0;
    
    if (this.visualizer && this.visualizer.timeFactor) {
      currentTimeFactor = this.visualizer.timeFactor;
    }
    
    console.log('🔄 Resetting simulation, preserving:', {
      carsNumber: currentCarsNumber,
      timeFactor: currentTimeFactor
    });
    
    // Stop simulation if running
    if (this.isRunning) {
      this.toggleSimulation();
    }
    
    // Reset KPI collector
    kpiCollector.reset();
    
    // Clear all cars
    for (const id in this.world.cars.all()) {
      const car = this.world.cars.all()[id];
      if (car) {
        this.world.removeCar(car);
      }
    }
    
    // Reset time
    this.world.time = 0;
    
    // Restore car number
    this.world.carsNumber = currentCarsNumber;
    
    // Reset traffic lights
    for (const id in this.world.intersections.all()) {
      const intersection = this.world.intersections.all()[id];
      if (intersection) {
        // Reset trafficLightController if it exists
        if (intersection.trafficLightController && typeof intersection.trafficLightController.reset === 'function') {
          intersection.trafficLightController.reset();
        } 
        // Legacy support for controlSignals
        else if (intersection.controlSignals && typeof intersection.controlSignals.reset === 'function') {
          intersection.controlSignals.reset();
        }
      }
    }
    
    // Update analytics
    this.updateAnalytics();
    
    // Show notification
    this.showNotification('Simulation reset', 'success');
  }
  
  // Run a KPI benchmark
  private async runBenchmark(): Promise<void> {
    // Don't start a benchmark if one is already running
    if (this.isBenchmarkRunning) {
      this.showNotification('Benchmark already running', 'warning');
      return;
    }
    
    // Validate that we have necessary settings to run a benchmark
    if (!this.world) {
      this.showNotification('No active simulation world. Please load a layout first.', 'warning');
      return;
    }
    
    // Check if we have a valid traffic control model
    if (!this.selectedTrafficControlModel) {
      this.showNotification('No traffic control model selected.', 'warning');
      return;
    }
    
    // Get the current layout info
    let currentLayoutName = "Current Layout";
    const currentLayoutId = this.world.layoutId;
    
    // If we have a layout ID, try to get its name
    if (currentLayoutId) {
      const layout = this.layouts.find(l => l.id === currentLayoutId);
      if (layout && layout.name) {
        currentLayoutName = layout.name;
      }
    }
    
    // Get current traffic control model name
    let trafficControlModelName = this.selectedTrafficControlModel;
    try {
      trafficControlStrategyManager.selectStrategy(this.selectedTrafficControlModel);
      const strategy = trafficControlStrategyManager.createStrategy();
      if (strategy && strategy.displayName) {
        trafficControlModelName = strategy.displayName;
      }
    } catch (error) {
      console.error('Error getting traffic control model name:', error);
    }
    
    // Get current simulation settings for display in the dialog
    const currentTimeFactor = parseFloat((document.getElementById('time-factor-range') as HTMLInputElement).value);
    
    // Prepare current settings for configuration modal (now just showing existing settings)
    const currentSettings = {
      layoutId: currentLayoutId,
      layoutName: currentLayoutName,
      duration: this.benchmarkDuration,
      carsNumber: this.world.carsNumber,
      timeFactor: currentTimeFactor,
      trafficControlModel: this.selectedTrafficControlModel,
      trafficControlModelName: trafficControlModelName
    };
    
    console.log('📊 Current settings for benchmark dialog:', currentSettings);
    
    // Show the simplified benchmark configuration modal (just duration)
    const config = await BenchmarkConfigurationComponent.show(this.container, currentSettings);
    
    // If user cancelled, exit
    if (!config) {
      console.log('📊 Benchmark cancelled by user');
      return;
    }
    
    console.log('📊 Benchmark configuration received:', config);
    
    // We'll use current settings but with the configured duration
    const benchmarkDuration = config.simulationDuration;
    console.log(`� Using current settings with ${benchmarkDuration} seconds duration`);
    
    // Reset simulation first (preserves car count and time factor)
    this.resetSimulation();
    
    // Make sure we are using the current traffic control model
    this.updateTrafficControlModel();
    
    // Update the car count slider display if needed
    const carsDisplay = document.getElementById('cars-value');
    if (carsDisplay) {
      carsDisplay.textContent = this.world.carsNumber.toString();
    }
    
    const carsRange = document.getElementById('cars-range') as HTMLInputElement;
    if (carsRange) {
      carsRange.value = this.world.carsNumber.toString();
    }
    
    // Make sure the visualizer has the correct time factor
    const timeFactorRange = document.getElementById('time-factor-range') as HTMLInputElement;
    const timeFactorValue = document.getElementById('time-factor-value');
    
    if (this.visualizer && timeFactorRange) {
      const timeFactor = parseFloat(timeFactorRange.value);
      console.log(`🕒 Using time factor: ${timeFactor}`);
      
      // Make sure visualizer exists
      if (this.visualizer) {
        // Set directly and via method if available
        this.visualizer.timeFactor = timeFactor; // Direct property set
        
        // Also call the method if it exists
        if (typeof this.visualizer.setTimeFactor === 'function') {
          this.visualizer.setTimeFactor(timeFactor);
        }
      } else {
        console.warn('Cannot set time factor - visualizer not initialized');
      }
      
      // Update the display
      if (timeFactorValue) {
        timeFactorValue.textContent = timeFactor.toFixed(1);
      }
    }
    
    // Ensure cars are correctly initialized
    if (this.world) {
      console.log(`🔄 Forcing world update with ${this.world.carsNumber} cars`);
      // Use the forceRefreshCars method to immediately adjust the car count
      this.world.forceRefreshCars();
    }
    
    // Store benchmark settings
    this.benchmarkDuration = config.simulationDuration;
    
    // Find the layout name for the current layout (using existing variables)
    let settingsLayoutName = currentLayoutName;
    const settingsLayoutId = currentLayoutId;
    
    // Store all current settings for the benchmark
    this.benchmarkSettings = {
      layoutId: settingsLayoutId,
      layoutName: settingsLayoutName,
      duration: config.simulationDuration,
      carsNumber: this.world.carsNumber,
      timeFactor: this.visualizer ? this.visualizer.timeFactor : 1.0,
      trafficControlModel: this.selectedTrafficControlModel,
      startTime: new Date().toISOString()
    };
    
    // Show notification
    this.showNotification(`Starting ${config.simulationDuration} second benchmark...`, 'success');
    
    // Start simulation
    this.isBenchmarkRunning = true;
    this.benchmarkStartTime = this.world.time;
    this.benchmarkIntervalSamples = [];
    
    // Update benchmark button
    const benchmarkButton = document.getElementById('run-benchmark')! as HTMLButtonElement;
    benchmarkButton.textContent = '⏱️ Benchmark Running...';
    benchmarkButton.classList.add('btn-warning');
    benchmarkButton.disabled = true;
    
    // Start simulation if not already running
    if (!this.isRunning) {
      // Check if visualizer exists
      if (!this.visualizer) {
        this.showNotification('Cannot start benchmark - visualizer not initialized', 'error');
        this.endBenchmark();
        return;
      }
      
      // We can't use toggleSimulation because it blocks during benchmark
      // So instead we'll directly start the simulation
      this.isRunning = true;
      
      // Safely call start method on visualizer
      if (typeof this.visualizer.start === 'function') {
        this.visualizer.start();
      }
      
      const toggleButton = document.getElementById('toggle-simulation')!;
      toggleButton.textContent = '⏸ Pause Simulation';
      toggleButton.classList.replace('btn-success', 'btn-danger');
      
      // Start KPI collection
      kpiCollector.startRecording();
      
      console.log('🚀 Simulation started for benchmark');
    }
    
    // Set interval to collect samples
    const sampleInterval = window.setInterval(() => {
      // Collect a sample every second
      this.benchmarkIntervalSamples.push(kpiCollector.getMetrics(this.world.time));
    }, 1000);
    
    // Set timeout to end benchmark
    const timeFactor = this.visualizer?.timeFactor || 1.0;
    this.benchmarkTimer = window.setTimeout(() => {
      clearInterval(sampleInterval);
      this.endBenchmark();
    }, config.simulationDuration * 1000 / timeFactor);
  }
  
  // End the benchmark and collect results
  private endBenchmark(): void {
    // Stop benchmark
    this.isBenchmarkRunning = false;
    
    // Stop simulation
    if (this.isRunning) {
      // We can't use toggleSimulation because it blocks during benchmark
      // So instead we'll directly stop the simulation
      this.isRunning = false;
      
      // Safely stop the visualizer
      if (this.visualizer && typeof this.visualizer.stop === 'function') {
        this.visualizer.stop();
      }
      
      const toggleButton = document.getElementById('toggle-simulation');
      if (toggleButton) {
        toggleButton.textContent = '▶️ Start Simulation';
        toggleButton.classList.replace('btn-danger', 'btn-success');
      }
      
      // Stop KPI collection
      kpiCollector.stopRecording();
      
      console.log('🛑 Simulation stopped at end of benchmark');
    }
    
    // Get final metrics
    const finalMetrics = kpiCollector.getMetrics(this.world.time);
    
    // Build benchmark results
    this.benchmarkResults = {
      settings: this.benchmarkSettings,
      finalMetrics: finalMetrics,
      samples: this.benchmarkIntervalSamples,
      endTime: new Date().toISOString(),
      duration: this.world.time - this.benchmarkStartTime,
      validation: kpiCollector.validateMetrics()
    };
    
    // Update benchmark button
    const benchmarkButton = document.getElementById('run-benchmark')! as HTMLButtonElement;
    benchmarkButton.textContent = '📊 Run KPI Benchmark';
    benchmarkButton.classList.remove('btn-warning');
    benchmarkButton.disabled = false;
    
    // Show results dialog
    this.showBenchmarkResults();
    
    // Show notification
    this.showNotification('Benchmark completed', 'success');
  }
  
  // Show benchmark results dialog
  private showBenchmarkResults(): void {
    // Remove any existing benchmark results dialogs first
    const existingDialogs = document.querySelectorAll('.benchmark-dialog, .fullscreen-modal');
    existingDialogs.forEach(dialog => {
      if (dialog.parentElement) {
        dialog.parentElement.removeChild(dialog);
      }
    });
    
    // Also remove any old containers
    const existingContainers = document.getElementById('kpi-fullscreen-container');
    if (existingContainers && existingContainers.parentElement) {
      existingContainers.parentElement.removeChild(existingContainers);
    }
    
    // Create a direct fullscreen container for KPI visualization
    const kpiContainer = document.createElement('div');
    kpiContainer.id = 'kpi-fullscreen-container';
    document.body.appendChild(kpiContainer);
    
    // Create benchmark run data for the KPI visualization component
    const benchmarkRun: BenchmarkRun = {
      id: `benchmark_${Date.now()}`,
      name: `Benchmark ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      timestamp: this.benchmarkResults.endTime,
      finalMetrics: this.benchmarkResults.finalMetrics,
      samples: this.benchmarkResults.samples,
      settings: this.benchmarkResults.settings,
      validation: this.benchmarkResults.validation
    };
    
    // Clean up any existing KPI visualization
    if (this.kpiVisualization) {
      this.kpiVisualization.destroy();
      this.kpiVisualization = null;
    }
    
    // Initialize new KPI visualization component directly in fullscreen mode
    this.kpiVisualization = new KPIVisualizationComponent(kpiContainer);
    this.kpiVisualization.displayBenchmarkResults(benchmarkRun);
    
    // Listen for close events
    document.addEventListener('kpi-dialog-closed', () => {
      if (kpiContainer && kpiContainer.parentElement) {
        kpiContainer.parentElement.removeChild(kpiContainer);
      }
      this.kpiVisualization = null;
    }, { once: true });
  }
  
  // Populate benchmark results UI
  private populateBenchmarkResultsUI(): void {
    const summaryContainer = document.getElementById('benchmark-summary')!;
    const metricsContainer = document.getElementById('benchmark-metrics')!;
    const validationContainer = document.getElementById('benchmark-validation')!;
    
    // Format date for display
    const startDate = new Date(this.benchmarkResults.settings.startTime);
    const endDate = new Date(this.benchmarkResults.endTime);
    
    // Summary
    summaryContainer.innerHTML = `
      <div class="metrics-table">
        <div class="metrics-row">
          <div class="metrics-label">Duration:</div>
          <div class="metrics-value">${this.benchmarkResults.duration.toFixed(1)} simulation seconds</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Vehicles:</div>
          <div class="metrics-value">${this.benchmarkResults.settings.carsNumber}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Traffic Control:</div>
          <div class="metrics-value">${this.getTrafficControlName(this.benchmarkResults.settings.trafficControlModel)}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Time Factor:</div>
          <div class="metrics-value">${this.benchmarkResults.settings.timeFactor}x</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Started:</div>
          <div class="metrics-value">${startDate.toLocaleString()}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Ended:</div>
          <div class="metrics-value">${endDate.toLocaleString()}</div>
        </div>
      </div>
    `;
    
    // Metrics
    const metrics = this.benchmarkResults.finalMetrics;
    metricsContainer.innerHTML = `
      <div class="metrics-table">
        <div class="metrics-row">
          <div class="metrics-label">Average Speed:</div>
          <div class="metrics-value">${metrics.averageSpeed.toFixed(2)} m/s</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Average Wait Time:</div>
          <div class="metrics-value">${metrics.averageWaitTime.toFixed(1)} s</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Maximum Wait Time:</div>
          <div class="metrics-value">${metrics.maxWaitTime.toFixed(1)} s</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Total Stops:</div>
          <div class="metrics-value">${metrics.totalStops}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Stopped Vehicles:</div>
          <div class="metrics-value">${metrics.stoppedVehicles}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Completed Trips:</div>
          <div class="metrics-value">${metrics.completedTrips}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Global Throughput:</div>
          <div class="metrics-value">${metrics.globalThroughput.toFixed(2)} vehicles/min</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Congestion Index:</div>
          <div class="metrics-value">${metrics.congestionIndex.toFixed(3)}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Intersections:</div>
          <div class="metrics-value">${this.analytics.totalIntersections}</div>
        </div>
        <div class="metrics-row">
          <div class="metrics-label">Roads:</div>
          <div class="metrics-value">${this.analytics.totalRoads}</div>
        </div>
      </div>
    `;
    
    // Validation
    validationContainer.innerHTML = `
      <div class="validation-formatted">
        ${this.benchmarkResults.validation}
      </div>
    `;
  }
  
  // Get human-readable traffic control model name
  private getTrafficControlName(modelType: string): string {
    switch (modelType) {
      case 'fixed-timing': return 'Fixed Timing';
      case 'adaptive-timing': return 'Adaptive Timing';
      case 'traffic-enforcer': return 'Traffic Enforcer';
      default: return modelType;
    }
  }
  
  // Update traffic control model
  private updateTrafficControlModel(): void {
    if (!this.world) return;
    
    console.log(`🚦 Applying traffic control model: ${this.selectedTrafficControlModel}`);
    
    try {
      // Apply selected strategy
      this.world.applyTrafficControlStrategy(this.selectedTrafficControlModel);
      
      // Ensure each intersection has its model correctly set
      for (const id in this.world.intersections.all()) {
        const intersection = this.world.intersections.all()[id];
        if (intersection && intersection.trafficLightController) {
          if (typeof intersection.trafficLightController.setStrategy === 'function') {
            // Use the new API
            intersection.trafficLightController.setStrategy(this.selectedTrafficControlModel);
          }
        }
      }
    } catch (error) {
      console.error('Error applying traffic control model:', error);
    }
    
    // Update indicator
    this.updateActiveModelIndicator(this.selectedTrafficControlModel);
  }
  
  // Update analytics display
  private updateAnalytics(): void {
    if (!this.world) return;
    
    // Collect basic stats
    this.analytics = {
      totalCars: Object.keys(this.world.cars.all() || {}).length,
      averageSpeed: this.world.instantSpeed,
      totalIntersections: Object.keys(this.world.intersections.all() || {}).length,
      totalRoads: Object.keys(this.world.roads.all() || {}).length,
      simulationTime: this.world.time
    };
    
    // Update UI
    document.getElementById('active-cars')!.textContent = this.analytics.totalCars.toString();
    document.getElementById('simulation-time')!.textContent = this.analytics.simulationTime.toFixed(1) + 's';
    
    // Get KPI metrics
    const kpiMetrics = kpiCollector.getMetrics(this.world.time);
    
    // Update KPI UI
    document.getElementById('total-vehicles')!.textContent = kpiMetrics.totalVehicles.toString();
    document.getElementById('completed-trips')!.textContent = kpiMetrics.completedTrips.toString();
    document.getElementById('average-speed')!.textContent = kpiMetrics.averageSpeed.toFixed(2) + ' m/s';
    document.getElementById('avg-wait-time')!.textContent = kpiMetrics.averageWaitTime.toFixed(1) + 's';
    document.getElementById('max-wait-time')!.textContent = kpiMetrics.maxWaitTime.toFixed(1) + 's';
    document.getElementById('total-stops')!.textContent = kpiMetrics.totalStops.toString();
    document.getElementById('stopped-vehicles')!.textContent = kpiMetrics.stoppedVehicles.toString();
    document.getElementById('global-throughput')!.textContent = kpiMetrics.globalThroughput.toFixed(2) + ' veh/min';
    document.getElementById('congestion-index')!.textContent = kpiMetrics.congestionIndex.toFixed(2);
  }
  
  // Save benchmark results
  private async saveBenchmarkResults(): Promise<void> {
    try {
      if (!this.benchmarkResults) {
        this.showNotification('No benchmark results to save', 'warning');
        return;
      }
      
      // Save as analytics
      await appState.storage.saveAnalytics({
        type: 'benchmark',
        data: this.benchmarkResults
      });
      
      // Show success notification
      this.showNotification('Benchmark results saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save benchmark results:', error);
      this.showNotification('Failed to save benchmark results', 'error');
    }
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
          intersections: this.world.intersections.length,
          roads: this.world.roads.length
        },
        settings: {
          carsNumber: this.world.carsNumber,
          trafficControlModel: this.selectedTrafficControlModel
        }
      };
      
      // Save to storage
      await appState.storage.saveAnalytics(analyticsData);
      
      // Show success message
      this.showNotification('Analytics saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save analytics:', error);
      this.showNotification('Failed to save analytics', 'error');
    }
  }

  // Adds necessary styles for the UI
  private addStyles(): void {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .simulation-page {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .page-header {
        padding: 1rem;
        background-color: #2c2c2c;
        color: #fff;
      }
      
      .page-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .page-header p {
        margin: 0.5rem 0 0;
        color: #aaa;
      }
      
      .simulation-content {
        display: flex;
        flex: 1;
        min-height: 0;
      }
      
      .sidebar {
        width: 300px;
        background-color: #1e1e1e;
        padding: 1rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .visualization-area {
        flex: 1;
        position: relative;
        overflow: hidden;
        background-color: #333;
      }
      
      #simulation-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      
      .panel {
        background-color: #252525;
        border-radius: 6px;
        padding: 1rem;
      }
      
      .panel h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 16px;
        color: #eee;
        border-bottom: 1px solid #444;
        padding-bottom: 8px;
      }
      
      .control-group {
        margin-bottom: 15px;
      }
      
      .control-group label {
        display: block;
        margin-bottom: 5px;
        color: #ccc;
        font-size: 13px;
      }
      
      .text-muted {
        color: #888;
      }
      
      .btn {
        display: inline-block;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        user-select: none;
        padding: 0.375rem 0.75rem;
        font-size: 0.9rem;
        line-height: 1.5;
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
      .btn-danger { background-color: #e74c3c; color: white; border: 1px solid #e74c3c; }
      .btn-danger:hover { background-color: #d62c1a; }
      
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
      
      /* Scenario Dialog Styles */
      .dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .dialog-content {
        background-color: #333;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        color: #fff;
      }
      
      .dialog-header {
        padding: 15px;
        border-bottom: 1px solid #444;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .dialog-header h3 {
        margin: 0;
        font-size: 18px;
      }
      
      .dialog-body {
        padding: 15px;
        max-height: 70vh;
        overflow-y: auto;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: #ccc;
        font-size: 24px;
        cursor: pointer;
      }
      
      .close-btn:hover {
        color: #fff;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #ccc;
      }
      
      .form-control {
        width: 100%;
        padding: 8px 10px;
        background-color: #222;
        border: 1px solid #555;
        border-radius: 4px;
        color: #fff;
      }
      
      textarea.form-control {
        min-height: 100px;
        resize: vertical;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      
      /* Tab styles */
      .tab-control {
        display: flex;
        border-bottom: 1px solid #444;
        margin-bottom: 15px;
      }
      
      .tab-btn {
        padding: 8px 15px;
        background-color: transparent;
        border: none;
        color: #ccc;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      
      .tab-btn.active {
        color: #fff;
        border-bottom-color: #007bff;
      }
      
      .tab-content {
        padding: 10px 0;
      }
      
      .list-container {
        max-height: 300px;
        overflow-y: auto;
        background-color: #222;
        border-radius: 4px;
        border: 1px solid #444;
      }
      
      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #333;
        cursor: pointer;
      }
      
      .list-item:last-child {
        border-bottom: none;
      }
      
      .list-item.selected {
        background-color: #2a5885;
      }
      
      .list-item:hover {
        background-color: #2a2a2a;
      }
      
      .list-item-title {
        font-weight: bold;
        color: #fff;
        margin-bottom: 3px;
      }
      
      .list-item-meta {
        font-size: 12px;
        color: #aaa;
      }
      
      .list-empty-message {
        padding: 15px;
        text-align: center;
        color: #888;
      }
      
      .btn-delete {
        background: none;
        border: none;
        color: #f55;
        font-size: 18px;
        cursor: pointer;
      }
      
      .current-scenario-info {
        font-size: 12px;
        padding: 5px 0;
        color: #33ee33;
      }
      
      /* Benchmark Results styles */
      .metrics-table {
        width: 100%;
        margin-bottom: 20px;
      }
      
      .metrics-row {
        display: flex;
        border-bottom: 1px solid #444;
        padding: 6px 0;
      }
      
      .metrics-row:last-child {
        border-bottom: none;
      }
      
      .metrics-label {
        width: 40%;
        color: #aaa;
        font-size: 14px;
      }
      
      .metrics-value {
        width: 60%;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Clean up resources when component is destroyed
  destroy(): void {
    console.log('🧹 Simulation: Destroying page and cleaning up resources...');
    
    // Stop the simulation if running
    if (this.isRunning) {
      this.stop();
    }
    
    // Clean up KPI visualization
    if (this.kpiVisualization) {
      this.kpiVisualization.destroy();
      this.kpiVisualization = null;
    }
    
    // Clean up world
    if (this.world) {
      this.world.clear();
      this.world = null;
    }
    
    // Clean up visualizer
    if (this.visualizer) {
      if (typeof this.visualizer.destroy === 'function') {
        this.visualizer.destroy();
      }
      this.visualizer = null;
    }
    
    // Clean up GUI
    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    console.log('✅ Simulation: Page destroyed and cleaned up');
  }
}
