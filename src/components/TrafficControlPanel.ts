/**
 * TrafficControlPanel
 * 
 * A UI component for managing traffic control strategies.
 * This can be integrated into the simulation UI to allow users to
 * change traffic control strategies for intersections.
 */

import { trafficControlStrategyManager } from '../model/traffic-control/TrafficControlStrategyManager';
import { ITrafficControlStrategy } from '../model/traffic-control/ITrafficControlStrategy';
import Intersection = require('../model/intersection');

export class TrafficControlPanel {
  private container: HTMLElement | null = null;
  private selectedIntersection: Intersection | null = null;
  
  /**
   * Initialize the traffic control panel
   */
  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error('TrafficControlPanel: Container element not found:', containerId);
      return;
    }
    
    this.render();
  }
  
  /**
   * Set the currently selected intersection
   */
  public setSelectedIntersection(intersection: Intersection | null): void {
    this.selectedIntersection = intersection;
    this.updateStrategyInfo();
  }
  
  /**
   * Render the traffic control panel
   */
  private render(): void {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="traffic-control-panel">
        <h3>Traffic Control</h3>
        
        <div class="no-intersection-selected" id="no-intersection-selected">
          <p>Select an intersection to configure its traffic control strategy</p>
        </div>
        
        <div class="intersection-control" id="intersection-control" style="display: none;">
          <div class="intersection-info">
            <h4>Intersection: <span id="intersection-id">-</span></h4>
          </div>
          
          <div class="strategy-selector">
            <label for="strategy-select">Strategy:</label>
            <select id="strategy-select"></select>
            <button id="apply-strategy-btn">Apply</button>
          </div>
          
          <div class="strategy-info" id="strategy-info">
            <h4>Current Strategy: <span id="current-strategy">-</span></h4>
            <p id="strategy-description">-</p>
          </div>
          
          <div class="strategy-config" id="strategy-config">
            <!-- Configuration options will be dynamically added here -->
          </div>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
    this.populateStrategySelect();
  }
  
  /**
   * Set up event listeners for UI components
   */
  private setupEventListeners(): void {
    const applyBtn = document.getElementById('apply-strategy-btn');
    const strategySelect = document.getElementById('strategy-select');
    
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applySelectedStrategy();
      });
    }
    
    if (strategySelect) {
      strategySelect.addEventListener('change', () => {
        this.updateStrategyInfo();
      });
    }
  }
  
  /**
   * Populate the strategy selection dropdown
   */
  private populateStrategySelect(): void {
    const strategySelect = document.getElementById('strategy-select');
    if (!strategySelect) return;
    
    // Clear existing options
    strategySelect.innerHTML = '';
    
    // Get available strategies
    const strategies = trafficControlStrategyManager.getAvailableStrategyTypes();
    
    // Add each strategy as an option
    strategies.forEach(strategyType => {
      // Create a temporary strategy instance to get its display name
      trafficControlStrategyManager.selectStrategy(strategyType);
      const strategy = trafficControlStrategyManager.createStrategy();
      
      const option = document.createElement('option');
      option.value = strategyType;
      option.textContent = strategy.displayName;
      strategySelect.appendChild(option);
    });
    
    // Reset to default strategy
    trafficControlStrategyManager.selectStrategy('fixed-timing');
  }
  
  /**
   * Apply the selected strategy to the current intersection
   */
  private applySelectedStrategy(): void {
    if (!this.selectedIntersection) {
      alert('Please select an intersection first');
      return;
    }
    
    const strategySelect = document.getElementById('strategy-select') as HTMLSelectElement;
    if (!strategySelect) return;
    
    const selectedStrategy = strategySelect.value;
    
    // Apply the strategy if the intersection has the required method
    if ((this.selectedIntersection as any).setTrafficControlStrategy) {
      (this.selectedIntersection as any).setTrafficControlStrategy(selectedStrategy);
    } 
    // Or use the adapter approach for backward compatibility
    else if (this.selectedIntersection.controlSignals && 
             (this.selectedIntersection.controlSignals as any).getController) {
      const controller = (this.selectedIntersection.controlSignals as any).getController();
      if (controller && controller.setStrategy) {
        controller.setStrategy(selectedStrategy);
      }
    }
    
    this.updateStrategyInfo();
  }
  
  /**
   * Update the strategy information display
   */
  private updateStrategyInfo(): void {
    const intersectionControlDiv = document.getElementById('intersection-control');
    const noIntersectionDiv = document.getElementById('no-intersection-selected');
    const intersectionIdSpan = document.getElementById('intersection-id');
    const currentStrategySpan = document.getElementById('current-strategy');
    const strategyDescSpan = document.getElementById('strategy-description');
    const strategySelect = document.getElementById('strategy-select') as HTMLSelectElement;
    
    // Show/hide appropriate sections based on intersection selection
    if (!this.selectedIntersection) {
      if (noIntersectionDiv) noIntersectionDiv.style.display = 'block';
      if (intersectionControlDiv) intersectionControlDiv.style.display = 'none';
      return;
    }
    
    if (noIntersectionDiv) noIntersectionDiv.style.display = 'none';
    if (intersectionControlDiv) intersectionControlDiv.style.display = 'block';
    
    // Update intersection ID
    if (intersectionIdSpan) {
      intersectionIdSpan.textContent = this.selectedIntersection.id;
    }
    
    // Update strategy info if we can get the controller
    if (this.selectedIntersection.controlSignals && 
        (this.selectedIntersection.controlSignals as any).getController) {
      
      const controller = (this.selectedIntersection.controlSignals as any).getController();
      if (controller && controller.getStrategy) {
        const strategy = controller.getStrategy();
        
        if (currentStrategySpan) {
          currentStrategySpan.textContent = strategy.displayName;
        }
        
        if (strategyDescSpan) {
          strategyDescSpan.textContent = strategy.description;
        }
        
        if (strategySelect) {
          strategySelect.value = strategy.strategyType;
        }
        
        // Update configuration options display
        this.updateConfigOptions(strategy);
      }
    }
  }
  
  /**
   * Update the configuration options UI for the current strategy
   */
  private updateConfigOptions(strategy: ITrafficControlStrategy): void {
    const configDiv = document.getElementById('strategy-config');
    if (!configDiv) return;
    
    // Clear existing content
    configDiv.innerHTML = '';
    
    // Get configuration options
    const options = strategy.getConfigOptions();
    if (!options || Object.keys(options).length === 0) {
      configDiv.innerHTML = '<p>No configurable options available</p>';
      return;
    }
    
    // Create form for options
    const form = document.createElement('form');
    form.className = 'strategy-config-form';
    
    // Create header
    const header = document.createElement('h4');
    header.textContent = 'Configuration Options';
    form.appendChild(header);
    
    // Add input field for each option
    for (const [key, value] of Object.entries(options)) {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      const label = document.createElement('label');
      label.textContent = this.formatOptionName(key);
      label.setAttribute('for', `option-${key}`);
      
      const input = document.createElement('input');
      input.id = `option-${key}`;
      input.name = key;
      input.value = String(value);
      input.type = typeof value === 'number' ? 'number' : 'text';
      
      if (typeof value === 'number') {
        input.step = '0.1';
      }
      
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      form.appendChild(formGroup);
    }
    
    // Add update button
    const updateBtn = document.createElement('button');
    updateBtn.type = 'button';
    updateBtn.textContent = 'Update Configuration';
    updateBtn.addEventListener('click', () => {
      this.saveConfigOptions(form);
    });
    
    form.appendChild(updateBtn);
    configDiv.appendChild(form);
  }
  
  /**
   * Save the configuration options from the form
   */
  private saveConfigOptions(form: HTMLFormElement): void {
    if (!this.selectedIntersection) return;
    
    const formData = new FormData(form);
    const options: Record<string, any> = {};
    
    // Collect form values
    formData.forEach((value, key) => {
      // Convert to number if it looks like a number
      const numValue = parseFloat(value as string);
      options[key] = !isNaN(numValue) ? numValue : value;
    });
    
    // Apply configuration if we can get the controller
    if (this.selectedIntersection.controlSignals && 
        (this.selectedIntersection.controlSignals as any).getController) {
      
      const controller = (this.selectedIntersection.controlSignals as any).getController();
      if (controller && controller.getStrategy) {
        const strategy = controller.getStrategy();
        strategy.updateConfig(options);
      }
    }
  }
  
  /**
   * Format option name for display (convert camelCase to Title Case)
   */
  private formatOptionName(name: string): string {
    // Convert camelCase to spaces
    const withSpaces = name.replace(/([A-Z])/g, ' $1');
    // Capitalize first letter and trim
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
  }
}
