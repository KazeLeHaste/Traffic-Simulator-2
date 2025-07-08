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
          
          <div class="strategy-analytics" id="strategy-analytics">
            <h4>Performance Analytics</h4>
            <div id="analytics-content">
              <p>No analytics available</p>
            </div>
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
    form.id = 'strategy-config-form';
    
    // Create header
    const header = document.createElement('h4');
    
    // Generate specific UI for adaptive strategy
    if (strategy.strategyType === 'adaptive-timing') {
      return this.createAdaptiveStrategyUI(strategy, configDiv, options);
    }
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
   * Create specialized UI for adaptive strategy configuration
   */
  private createAdaptiveStrategyUI(strategy: ITrafficControlStrategy, container: HTMLElement, options: Record<string, any>): void {
    // Create a more user-friendly form for adaptive strategy
    container.innerHTML = `
      <h4>Adaptive Timing Configuration</h4>
      <form id="adaptive-config-form" class="strategy-config-form">
        <div class="config-section">
          <h5>Timing Parameters</h5>
          <div class="form-group">
            <label for="minPhaseDuration">Minimum Phase Duration (seconds):</label>
            <input type="range" id="minPhaseDuration" name="minPhaseDuration" 
                  min="5" max="30" step="1" value="${options.minPhaseDuration || 10}">
            <span class="range-value">${options.minPhaseDuration || 10}</span>
          </div>
          
          <div class="form-group">
            <label for="maxPhaseDuration">Maximum Phase Duration (seconds):</label>
            <input type="range" id="maxPhaseDuration" name="maxPhaseDuration" 
                  min="30" max="120" step="5" value="${options.maxPhaseDuration || 60}">
            <span class="range-value">${options.maxPhaseDuration || 60}</span>
          </div>
          
          <div class="form-group">
            <label for="baseDuration">Base Duration (seconds):</label>
            <input type="range" id="baseDuration" name="baseDuration" 
                  min="10" max="60" step="5" value="${options.baseDuration || 30}">
            <span class="range-value">${options.baseDuration || 30}</span>
          </div>
        </div>
        
        <div class="config-section">
          <h5>Adaptation Parameters</h5>
          <div class="form-group">
            <label for="trafficSensitivity">Traffic Sensitivity:</label>
            <input type="range" id="trafficSensitivity" name="trafficSensitivity" 
                  min="0" max="1" step="0.1" value="${options.trafficSensitivity || 0.5}">
            <span class="range-value">${options.trafficSensitivity || 0.5}</span>
          </div>
          
          <div class="form-group">
            <label for="queueWeight">Queue Length Weight:</label>
            <input type="range" id="queueWeight" name="queueWeight" 
                  min="0.1" max="2" step="0.1" value="${options.queueWeight || 1.0}">
            <span class="range-value">${options.queueWeight || 1.0}</span>
          </div>
          
          <div class="form-group">
            <label for="waitTimeWeight">Wait Time Weight:</label>
            <input type="range" id="waitTimeWeight" name="waitTimeWeight" 
                  min="0.1" max="2" step="0.1" value="${options.waitTimeWeight || 1.0}">
            <span class="range-value">${options.waitTimeWeight || 1.0}</span>
          </div>
          
          <div class="form-group">
            <label for="flowRateWeight">Flow Rate Weight:</label>
            <input type="range" id="flowRateWeight" name="flowRateWeight" 
                  min="0.1" max="2" step="0.1" value="${options.flowRateWeight || 0.5}">
            <span class="range-value">${options.flowRateWeight || 0.5}</span>
          </div>
          
          <div class="form-group">
            <label for="trendWeight">Trend Analysis Weight:</label>
            <input type="range" id="trendWeight" name="trendWeight" 
                  min="0" max="1" step="0.1" value="${options.trendWeight || 0.3}">
            <span class="range-value">${options.trendWeight || 0.3}</span>
          </div>
          
          <div class="form-group checkbox">
            <label for="prioritizeLeftTurns">
              <input type="checkbox" id="prioritizeLeftTurns" name="prioritizeLeftTurns" 
                    ${options.prioritizeLeftTurns ? 'checked' : ''}>
              Prioritize Left Turns When Congested
            </label>
          </div>
          
          <div class="form-group checkbox">
            <label for="enableLogging">
              <input type="checkbox" id="enableLogging" name="enableLogging" 
                    ${options.enableLogging ? 'checked' : ''}>
              Enable Detailed Logging (Console)
            </label>
          </div>
          
          <div class="form-group">
            <label for="fairnessWeight">Fairness Weight:</label>
            <input type="range" id="fairnessWeight" name="fairnessWeight" 
                  min="0" max="1" step="0.1" value="${options.fairnessWeight !== undefined ? options.fairnessWeight : 0.5}">
            <span class="range-value">${options.fairnessWeight !== undefined ? options.fairnessWeight : 0.5}</span>
          </div>
          
          <div class="form-group checkbox">
            <label for="emergencyMode">
              <input type="checkbox" id="emergencyMode" name="emergencyMode" 
                    ${options.emergencyMode ? 'checked' : ''}>
              Enable Emergency Mode for Critical Congestion
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" id="apply-config-btn" class="btn">Apply Configuration</button>
          <button type="button" id="reset-config-btn" class="btn secondary">Reset to Defaults</button>
        </div>
      </form>
    `;
    
    // Add analytics display if available
    this.updateAnalytics(strategy);
    
    // Set up event listeners for the sliders
    document.querySelectorAll('#adaptive-config-form input[type="range"]').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const valueDisplay = target.nextElementSibling as HTMLElement;
        if (valueDisplay) {
          valueDisplay.textContent = target.value;
        }
      });
    });
    
    // Set up apply button
    const applyBtn = document.getElementById('apply-config-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyAdaptiveConfig(strategy);
      });
    }
    
    // Set up reset button
    const resetBtn = document.getElementById('reset-config-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetAdaptiveConfig(strategy);
      });
    }
  }
  
  /**
   * Apply adaptive strategy configuration
   */
  private applyAdaptiveConfig(strategy: ITrafficControlStrategy): void {
    const form = document.getElementById('adaptive-config-form') as HTMLFormElement;
    if (!form) return;
    
    const config: Record<string, any> = {};
    
    // Get all numeric inputs
    const numericInputs = ['minPhaseDuration', 'maxPhaseDuration', 'baseDuration', 
      'trafficSensitivity', 'queueWeight', 'waitTimeWeight', 'flowRateWeight', 'trendWeight',
      'fairnessWeight'];
    
    numericInputs.forEach(name => {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      if (input) {
        config[name] = parseFloat(input.value);
      }
    });
    
    // Get boolean inputs
    const booleanInputs = ['prioritizeLeftTurns', 'enableLogging', 'emergencyMode'];
    booleanInputs.forEach(name => {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      if (input) {
        config[name] = input.checked;
      }
    });
    
    // Apply configuration
    strategy.updateConfig(config);
    
    // Show confirmation
    alert('Adaptive strategy configuration updated');
    
    // Update analytics
    this.updateAnalytics(strategy);
  }
  
  /**
   * Reset adaptive strategy configuration to defaults
   */
  private resetAdaptiveConfig(strategy: ITrafficControlStrategy): void {
    const defaultConfig = {
      minPhaseDuration: 10,
      maxPhaseDuration: 60,
      baseDuration: 30,
      trafficSensitivity: 0.5,
      queueWeight: 1.0,
      waitTimeWeight: 1.0,
      flowRateWeight: 0.5,
      trendWeight: 0.3,
      fairnessWeight: 0.5,
      prioritizeLeftTurns: true,
      enableLogging: false,
      emergencyMode: false
    };
    
    // Apply defaults
    strategy.updateConfig(defaultConfig);
    
    // Update UI
    this.updateConfigOptions(strategy);
    
    // Show confirmation
    alert('Adaptive strategy configuration reset to defaults');
  }
  
  /**
   * Update analytics display
   */
  private updateAnalytics(strategy: ITrafficControlStrategy): void {
    const analyticsDiv = document.getElementById('analytics-content');
    if (!analyticsDiv) return;
    
    if (strategy.strategyType === 'adaptive-timing' && (strategy as any).getPerformanceAnalytics) {
      try {
        const analytics = (strategy as any).getPerformanceAnalytics();
        
        analyticsDiv.innerHTML = `
          <table class="analytics-table">
            <tr>
              <td>Average Phase Duration:</td>
              <td>${analytics.phaseDurationAvg.toFixed(2)}s</td>
            </tr>
            <tr>
              <td>Min/Max Duration:</td>
              <td>${analytics.phaseDurationMin.toFixed(1)}s / ${analytics.phaseDurationMax.toFixed(1)}s</td>
            </tr>
            <tr>
              <td>Phase Changes:</td>
              <td>${analytics.phaseChanges}</td>
            </tr>
            <tr>
              <td>Avg Traffic Score:</td>
              <td>${analytics.trafficScoreAvg.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Adaptation Rate:</td>
              <td>${(analytics.adaptationRate * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Fairness Metric:</td>
              <td>${(analytics.fairnessMetric * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Current Congestion:</td>
              <td>N: ${analytics.congestionScores[0].toFixed(1)}, 
                  E: ${analytics.congestionScores[1].toFixed(1)}, 
                  S: ${analytics.congestionScores[2].toFixed(1)}, 
                  W: ${analytics.congestionScores[3].toFixed(1)}</td>
            </tr>
            <tr>
              <td>Saturation Rates:</td>
              <td>N: ${analytics.saturationRates ? analytics.saturationRates[0].toFixed(2) : '0.00'}, 
                  E: ${analytics.saturationRates ? analytics.saturationRates[1].toFixed(2) : '0.00'}, 
                  S: ${analytics.saturationRates ? analytics.saturationRates[2].toFixed(2) : '0.00'}, 
                  W: ${analytics.saturationRates ? analytics.saturationRates[3].toFixed(2) : '0.00'}</td>
            </tr>
            <tr>
              <td>Emergency Activations:</td>
              <td>${analytics.emergencyActivations || 0}</td>
            </tr>
          </table>
          
          <button type="button" id="update-analytics-btn" class="btn small">Refresh Analytics</button>
        `;
        
        // Set up refresh button
        const refreshBtn = document.getElementById('update-analytics-btn');
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => {
            this.updateAnalytics(strategy);
          });
        }
      } catch (e) {
        analyticsDiv.innerHTML = `<p>Analytics not available: ${e.message}</p>`;
      }
    } else {
      analyticsDiv.innerHTML = '<p>No analytics available for this strategy</p>';
    }
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
