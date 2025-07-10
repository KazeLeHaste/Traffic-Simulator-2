/**
 * BenchmarkConfigurationComponent - Creates and manages a modal window f        <div class="dialog-header">
          <h3>📊 KPI Benchmark Configuration</h3>
          <button class="close-btn" style="font-size: 24px;">&times;</button>
        </div>onfiguring benchmarks
 * 
 * This component provides:
 * - A modal window for configuring benchmark parameters
 * - Layout selection
 * - Traffic control model selection
 * - Simulation duration configuration
 * - Number of cars configuration
 * - Time factor configuration
 */

import { trafficControlStrategyManager } from '../model/traffic-control/TrafficControlStrategyManager';

export interface BenchmarkConfiguration {
  layoutId: string;
  trafficControlModel: string;
  simulationDuration: number;
  carsNumber: number;
  timeFactor: number;
}

export class BenchmarkConfigurationComponent {
  private container: HTMLElement;
  private callback: (config: BenchmarkConfiguration | null) => void;
  private layouts: any[] = [];
  
  /**
   * Constructor for the benchmark configuration component
   * @param container - The HTML element to append the configuration modal to
   * @param layouts - Array of available layouts
   * @param currentSettings - Current simulation settings
   * @param callback - Callback function called when configuration is complete
   */
  constructor(container: HTMLElement, layouts: any[], currentSettings: any, callback: (config: BenchmarkConfiguration | null) => void) {
    this.container = container;
    this.layouts = layouts;
    this.callback = callback;
    
    console.log('📊 BenchmarkConfigurationComponent initialized with:', {
      layoutsCount: layouts.length,
      layouts: layouts.map(l => ({ id: l.id, name: l.name })),
      currentSettings
    });
    
    // Create modal
    this.createModal(currentSettings);
  }
  
  /**
   * Create the modal window with benchmark configuration options
   * @param currentSettings - Current simulation settings
   */
  private createModal(currentSettings: any): void {
    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'benchmark-config-modal';
    modalContainer.className = 'dialog benchmark-config-dialog';
    
    const availableStrategyTypes = trafficControlStrategyManager.getAvailableStrategyTypes();
    const trafficControlModels: { id: string, name: string }[] = [];
    
    // Create a temporary strategy instance to get display names
    for (const strategyType of availableStrategyTypes) {
      trafficControlStrategyManager.selectStrategy(strategyType);
      const strategy = trafficControlStrategyManager.createStrategy();
      trafficControlModels.push({
        id: strategyType,
        name: strategy.displayName
      });
    }
    
    // Reset to default strategy
    trafficControlStrategyManager.selectStrategy('fixed-timing');
    
    // Set the HTML content for the modal
    modalContainer.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>� KPI Benchmark Configuration</h3>
          <button class="close-btn" style="font-size: 24px;">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="benchmark-layout">Layout:</label>
            <select id="benchmark-layout" class="form-control">
              ${this.layouts.length > 0 
                ? this.layouts.map(layout => 
                    `<option value="${layout.id}" ${currentSettings.layoutId === layout.id ? 'selected' : ''}>${layout.name || 'Unnamed Layout'}</option>`
                  ).join('') 
                : '<option value="default">Default Layout</option>'}
            </select>
            ${this.layouts.length === 0 ? '<small class="form-text text-warning">No custom layouts available. Using default layout.</small>' : ''}
          </div>
          
          <div class="form-group">
            <label for="benchmark-traffic-control">Traffic Control Model:</label>
            <select id="benchmark-traffic-control" class="form-control">
              ${trafficControlModels.map(model => 
                `<option value="${model.id}" ${currentSettings.trafficControlModel === model.id ? 'selected' : ''}>${model.name}</option>`
              ).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="benchmark-duration">Simulation Duration (seconds):</label>
            <input type="number" id="benchmark-duration" class="form-control" min="10" max="600" value="${currentSettings.duration || 60}">
          </div>
          
          <div class="form-group">
            <label for="benchmark-cars">Number of Cars:</label>
            <input type="number" id="benchmark-cars" class="form-control" min="5" max="1000" value="${currentSettings.carsNumber || 50}">
          </div>
          
          <div class="form-group">
            <label for="benchmark-time-factor">Time Factor:</label>
            <input type="number" id="benchmark-time-factor" class="form-control" min="0.1" max="10" step="0.1" value="${currentSettings.timeFactor || 1.0}">
            <small class="form-text text-muted">Higher values make the simulation run faster</small>
          </div>
        </div>
        <div class="dialog-footer">
          <button id="cancel-benchmark" class="btn btn-secondary">Cancel</button>
          <button id="start-benchmark" class="btn btn-primary">Start Benchmark</button>
        </div>
      </div>
    `;
    
    // Append the modal to the container
    this.container.appendChild(modalContainer);
    
    // Add event listeners
    modalContainer.querySelector('.close-btn')?.addEventListener('click', () => this.close());
    modalContainer.querySelector('#cancel-benchmark')?.addEventListener('click', () => this.close());
    modalContainer.querySelector('#start-benchmark')?.addEventListener('click', () => this.startBenchmark());
    
    // Prevent clicks on the modal content from closing the modal
    modalContainer.querySelector('.dialog-content')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Close the modal when clicking outside the content
    modalContainer.addEventListener('click', () => this.close());
  }
  
  /**
   * Close the modal and call the callback with null
   */
  private close(): void {
    const modal = document.getElementById('benchmark-config-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    this.callback(null);
  }
  
  /**
   * Start the benchmark with the configured settings
   */
  private startBenchmark(): void {
    // Get configuration values from inputs
    const layoutSelect = document.getElementById('benchmark-layout') as HTMLSelectElement;
    const layoutId = layoutSelect.value;
    const trafficControlModel = (document.getElementById('benchmark-traffic-control') as HTMLSelectElement).value;
    const simulationDuration = parseInt((document.getElementById('benchmark-duration') as HTMLInputElement).value);
    const carsNumber = parseInt((document.getElementById('benchmark-cars') as HTMLInputElement).value);
    const timeFactor = parseFloat((document.getElementById('benchmark-time-factor') as HTMLInputElement).value);
    
    // Debug log the layout state
    console.log('Layout validation check:', { 
      layoutId, 
      layoutSelectValue: layoutSelect.value,
      selectedIndex: layoutSelect.selectedIndex,
      options: Array.from(layoutSelect.options).map(o => ({ value: o.value, text: o.text }))
    });
    
    // Skip layout validation entirely - the select box will always have something selected
    // We'll let the SimulationPageComponent handle layout loading
    
    if (isNaN(simulationDuration) || simulationDuration < 10 || simulationDuration > 600) {
      alert('Please enter a valid simulation duration between 10 and 600 seconds');
      return;
    }
    
    if (isNaN(carsNumber) || carsNumber < 5 || carsNumber > 1000) {
      alert('Please enter a valid number of cars between 5 and 1000');
      return;
    }
    
    if (isNaN(timeFactor) || timeFactor < 0.1 || timeFactor > 10) {
      alert('Please enter a valid time factor between 0.1 and 10');
      return;
    }
    
    const selectedLayoutName = layoutSelect.selectedIndex >= 0 
      ? layoutSelect.options[layoutSelect.selectedIndex].text 
      : 'Unknown';
      
    console.log('📊 Starting benchmark with configuration:', {
      layoutId,
      layoutName: selectedLayoutName,
      selectedIndex: layoutSelect.selectedIndex,
      availableLayouts: this.layouts.map(l => `${l.id}: ${l.name || 'Unnamed'}`),
      trafficControlModel,
      simulationDuration,
      carsNumber,
      timeFactor
    });
    
    // Ensure layout ID is valid
    const finalLayoutId = layoutId || (this.layouts.length > 0 ? this.layouts[0].id : 'default');
    
    // Create the configuration object
    const config: BenchmarkConfiguration = {
      layoutId: finalLayoutId,
      trafficControlModel,
      simulationDuration,
      carsNumber,
      timeFactor
    };
    
    // Close the modal
    const modal = document.getElementById('benchmark-config-modal');
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    
    // Call the callback with the configuration
    this.callback(config);
  }
  
  /**
   * Show the benchmark configuration modal
   * @param container - Container element to attach the modal to
   * @param layouts - Available layouts for selection
   * @param currentSettings - Current simulation settings
   * @returns Promise resolving to the selected configuration or null if cancelled
   */
  public static show(container: HTMLElement, layouts: any[], currentSettings: any): Promise<BenchmarkConfiguration | null> {
    return new Promise((resolve) => {
      new BenchmarkConfigurationComponent(container, layouts, currentSettings, resolve);
    });
  }
}
