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
    
    // Get the controller through our helper
    const controller = this.getTrafficController();
    
    // Apply the strategy if controller is available
    if (controller && controller.setStrategy) {
      controller.setStrategy(selectedStrategy);
    }
    // Or use the direct intersection method if available
    else if ((this.selectedIntersection as any).setTrafficControlStrategy) {
      (this.selectedIntersection as any).setTrafficControlStrategy(selectedStrategy);
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
    
    // Get controller and strategy
    const controller = this.getTrafficController();
    let strategy: any = null;
    
    if (controller && controller.getStrategy) {
      strategy = controller.getStrategy();
    }
    
    if (strategy) {
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
    
    // Generate specific UI based on strategy type
    if (strategy.strategyType === 'adaptive-timing') {
      return this.createAdaptiveStrategyUI(strategy, configDiv, options);
    }
    else if (strategy.strategyType === 'traffic-enforcer') {
      return this.createTrafficEnforcerUI(strategy, configDiv, options);
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
   * Create specialized UI for traffic enforcer configuration
   */
  private createTrafficEnforcerUI(strategy: ITrafficControlStrategy, container: HTMLElement, options: Record<string, any>): void {
    // Create a user-friendly form for the traffic enforcer strategy
    container.innerHTML = `
      <h4>Traffic Enforcer Configuration</h4>
      <form id="traffic-enforcer-form" class="strategy-config-form">
        <div class="config-section">
          <h5>Timing Parameters</h5>
          <div class="form-group">
            <label for="decisionInterval">Decision Interval (seconds):</label>
            <input type="range" id="decisionInterval" name="decisionInterval" 
                  min="1" max="15" step="1" value="${options.decisionInterval || 5}">
            <span class="range-value">${options.decisionInterval || 5}</span>
          </div>
          
          <div class="form-group">
            <label for="minimumGreenTime">Minimum Green Time (seconds):</label>
            <input type="range" id="minimumGreenTime" name="minimumGreenTime" 
                  min="3" max="30" step="1" value="${options.minimumGreenTime || 10}">
            <span class="range-value">${options.minimumGreenTime || 10}</span>
          </div>
          
          <div class="form-group">
            <label for="fairnessWindow">Fairness Window (seconds):</label>
            <input type="range" id="fairnessWindow" name="fairnessWindow" 
                  min="30" max="180" step="10" value="${options.fairnessWindow || 60}">
            <span class="range-value">${options.fairnessWindow || 60}</span>
          </div>
        </div>
        
        <div class="config-section">
          <h5>Decision Thresholds</h5>
          <div class="form-group">
            <label for="priorityThreshold">Priority Threshold:</label>
            <input type="range" id="priorityThreshold" name="priorityThreshold" 
                  min="3" max="10" step="0.5" value="${options.priorityThreshold || 7}">
            <span class="range-value">${options.priorityThreshold || 7}</span>
            <small>Traffic above this congestion score gets priority</small>
          </div>
          
          <div class="form-group">
            <label for="emergencyThreshold">Emergency Threshold:</label>
            <input type="range" id="emergencyThreshold" name="emergencyThreshold" 
                  min="5" max="10" step="0.5" value="${options.emergencyThreshold || 9}">
            <span class="range-value">${options.emergencyThreshold || 9}</span>
            <small>Traffic above this congestion score triggers emergency response</small>
          </div>
        </div>
        
        <div class="config-section">
          <h5>Direction Priorities</h5>
          <div class="form-group checkbox-group">
            <label>Prioritized Directions:</label><br>
            <label>
              <input type="checkbox" name="priorityNorth" value="0" ${(options.prioritizedDirections || []).includes(0) ? 'checked' : ''}>
              North
            </label>
            <label>
              <input type="checkbox" name="priorityEast" value="1" ${(options.prioritizedDirections || []).includes(1) ? 'checked' : ''}>
              East
            </label>
            <label>
              <input type="checkbox" name="prioritySouth" value="2" ${(options.prioritizedDirections || []).includes(2) ? 'checked' : ''}>
              South
            </label>
            <label>
              <input type="checkbox" name="priorityWest" value="3" ${(options.prioritizedDirections || []).includes(3) ? 'checked' : ''}>
              West
            </label>
          </div>
        </div>
        
        <div class="config-section">
          <h5>Movement Priorities</h5>
          <div class="form-group checkbox-group">
            <label>Prioritized Movements:</label><br>
            <div class="movement-grid">
              <div>
                <label>
                  <input type="checkbox" name="priorityNorthLeft" ${this.hasMovementPriority(options.prioritizedMovements, 0, 0) ? 'checked' : ''}>
                  North Left
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="priorityNorthStraight" ${this.hasMovementPriority(options.prioritizedMovements, 0, 1) ? 'checked' : ''}>
                  North Straight
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="priorityEastLeft" ${this.hasMovementPriority(options.prioritizedMovements, 1, 0) ? 'checked' : ''}>
                  East Left
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="priorityEastStraight" ${this.hasMovementPriority(options.prioritizedMovements, 1, 1) ? 'checked' : ''}>
                  East Straight
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="prioritySouthLeft" ${this.hasMovementPriority(options.prioritizedMovements, 2, 0) ? 'checked' : ''}>
                  South Left
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="prioritySouthStraight" ${this.hasMovementPriority(options.prioritizedMovements, 2, 1) ? 'checked' : ''}>
                  South Straight
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="priorityWestLeft" ${this.hasMovementPriority(options.prioritizedMovements, 3, 0) ? 'checked' : ''}>
                  West Left
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" name="priorityWestStraight" ${this.hasMovementPriority(options.prioritizedMovements, 3, 1) ? 'checked' : ''}>
                  West Straight
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" id="apply-traffic-enforcer-config-btn" class="btn">Apply Configuration</button>
          <button type="button" id="reset-traffic-enforcer-config-btn" class="btn secondary">Reset to Defaults</button>
        </div>
      </form>
    `;
    
    // Set up event listeners for the sliders
    document.querySelectorAll('#traffic-enforcer-form input[type="range"]').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const valueDisplay = target.nextElementSibling as HTMLElement;
        if (valueDisplay) {
          valueDisplay.textContent = target.value;
        }
      });
    });
    
    // Set up apply button
    const applyBtn = document.getElementById('apply-traffic-enforcer-config-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyTrafficEnforcerConfig(strategy);
      });
    }
    
    // Set up reset button
    const resetBtn = document.getElementById('reset-traffic-enforcer-config-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetTrafficEnforcerConfig(strategy);
      });
    }
  }
  
  /**
   * Check if a movement has priority in the config
   */
  private hasMovementPriority(prioritizedMovements: any[] | undefined, direction: number, movement: number): boolean {
    if (!prioritizedMovements || !Array.isArray(prioritizedMovements)) {
      return false;
    }
    
    return prioritizedMovements.some(m => 
      m.direction === direction && m.movement === movement
    );
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
   * Apply traffic enforcer configuration
   */
  private applyTrafficEnforcerConfig(strategy: ITrafficControlStrategy): void {
    const form = document.getElementById('traffic-enforcer-form') as HTMLFormElement;
    if (!form) return;
    
    const config: Record<string, any> = {};
    
    // Get all numeric inputs
    const numericInputs = ['decisionInterval', 'minimumGreenTime', 'fairnessWindow',
                          'priorityThreshold', 'emergencyThreshold'];
    
    numericInputs.forEach(name => {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      if (input) {
        config[name] = parseFloat(input.value);
      }
    });
    
    // Get prioritized directions
    const priorityDirections = ['priorityNorth', 'priorityEast', 'prioritySouth', 'priorityWest'];
    const prioritizedDirections: number[] = [];
    
    priorityDirections.forEach((name, index) => {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      if (input && input.checked) {
        prioritizedDirections.push(index);
      }
    });
    
    config.prioritizedDirections = prioritizedDirections;
    
    // Get prioritized movements
    const priorityMovements = [
      { name: 'priorityNorthLeft', direction: 0, movement: 0 },
      { name: 'priorityNorthStraight', direction: 0, movement: 1 },
      { name: 'priorityEastLeft', direction: 1, movement: 0 },
      { name: 'priorityEastStraight', direction: 1, movement: 1 },
      { name: 'prioritySouthLeft', direction: 2, movement: 0 },
      { name: 'prioritySouthStraight', direction: 2, movement: 1 },
      { name: 'priorityWestLeft', direction: 3, movement: 0 },
      { name: 'priorityWestStraight', direction: 3, movement: 1 }
    ];
    
    const prioritizedMovements: { direction: number, movement: number }[] = [];
    
    priorityMovements.forEach(pm => {
      const input = form.elements.namedItem(pm.name) as HTMLInputElement;
      if (input && input.checked) {
        prioritizedMovements.push({ direction: pm.direction, movement: pm.movement });
      }
    });
    
    config.prioritizedMovements = prioritizedMovements;
    
    // Apply configuration
    strategy.updateConfig(config);
    
    // Show confirmation
    alert('Traffic Enforcer configuration updated');
  }
  
  /**
   * Reset traffic enforcer config to defaults
   */
  private resetTrafficEnforcerConfig(strategy: ITrafficControlStrategy): void {
    const defaultConfig = {
      decisionInterval: 5,
      minimumGreenTime: 10,
      fairnessWindow: 60,
      priorityThreshold: 7,
      emergencyThreshold: 9,
      prioritizedDirections: [],
      prioritizedMovements: []
    };
    
    // Apply defaults
    strategy.updateConfig(defaultConfig);
    
    // Update UI
    this.updateConfigOptions(strategy);
    
    // Show confirmation
    alert('Traffic Enforcer configuration reset to defaults');
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
  
  /**
   * Get the traffic light controller for an intersection
   * This handles both the new direct approach and the legacy adapter approach
   */
  private getTrafficController(): any {
    if (!this.selectedIntersection) {
      return null;
    }
    
    // Try the direct approach first (new implementation)
    if ((this.selectedIntersection as any).trafficLightController) {
      return (this.selectedIntersection as any).trafficLightController;
    }
    
    // Fallback to adapter approach
    if (this.selectedIntersection.controlSignals && 
        (this.selectedIntersection.controlSignals as any).getController) {
      return (this.selectedIntersection.controlSignals as any).getController();
    }
    
    return null;
  }
}
