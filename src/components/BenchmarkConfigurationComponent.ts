/**
 * BenchmarkConfigurationComponent - Creates and manages a modal window for configuring benchmark duration
 * 
 * This component provides:
 * - A modal window for configuring benchmark simulation duration
 * - All other settings are taken from the current simulation state
 */

import { trafficControlStrategyManager } from '../model/traffic-control/TrafficControlStrategyManager';

export interface BenchmarkConfiguration {
  simulationDuration: number;
}

export class BenchmarkConfigurationComponent {
  private container: HTMLElement;
  private callback: (config: BenchmarkConfiguration | null) => void;
  private currentSettings: any;
  
  /**
   * Constructor for the benchmark configuration component
   * @param container - The HTML element to append the configuration modal to
   * @param currentSettings - Current simulation settings
   * @param callback - Callback function called when configuration is complete
   */
  constructor(container: HTMLElement, currentSettings: any, callback: (config: BenchmarkConfiguration | null) => void) {
    this.container = container;
    this.currentSettings = currentSettings;
    this.callback = callback;
    
    console.log('📊 BenchmarkConfigurationComponent initialized with current settings:', currentSettings);
    
    // Create modal
    this.createModal(currentSettings);
  }
  
  /**
   * Create the modal window with only simulation duration input
   * @param currentSettings - Current simulation settings
   */
  private createModal(currentSettings: any): void {
    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'benchmark-config-modal';
    modalContainer.className = 'dialog benchmark-config-dialog';
    
    // Set the HTML content for the modal - simplified to only show duration
    modalContainer.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>📊 KPI Benchmark Duration</h3>
          <button class="close-btn" style="font-size: 24px;">&times;</button>
        </div>
        <div class="dialog-body">
          <p>The benchmark will use your current simulation settings:</p>
          <ul class="current-settings-list">
            <li><strong>Layout:</strong> ${currentSettings.layoutName || 'Current Layout'}</li>
            <li><strong>Traffic Control:</strong> ${currentSettings.trafficControlModelName || currentSettings.trafficControlModel}</li>
            <li><strong>Cars:</strong> ${currentSettings.carsNumber}</li>
            <li><strong>Time Factor:</strong> ${currentSettings.timeFactor}x</li>
          </ul>
          
          <div class="form-group">
            <label for="benchmark-duration">Simulation Duration (seconds):</label>
            <input type="number" id="benchmark-duration" class="form-control" min="10" max="600" value="${currentSettings.duration || 60}">
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
   * Start the benchmark with the configured duration
   */
  private startBenchmark(): void {
    // Get simulation duration from input
    const simulationDuration = parseInt((document.getElementById('benchmark-duration') as HTMLInputElement).value);
    
    if (isNaN(simulationDuration) || simulationDuration < 10 || simulationDuration > 600) {
      alert('Please enter a valid simulation duration between 10 and 600 seconds');
      return;
    }
    
    console.log('📊 Starting benchmark with duration:', simulationDuration);
    
    // Create the configuration object - now with just the duration
    const config: BenchmarkConfiguration = {
      simulationDuration
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
   * @param currentSettings - Current simulation settings
   * @returns Promise resolving to the selected configuration or null if cancelled
   */
  public static show(container: HTMLElement, currentSettings: any): Promise<BenchmarkConfiguration | null> {
    return new Promise((resolve) => {
      new BenchmarkConfigurationComponent(container, currentSettings, resolve);
    });
  }
}
