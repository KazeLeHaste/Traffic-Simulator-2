import { appState } from '../core/AppState';
import World = require('../model/world');
import Visualizer = require('../visualizer/visualizer');
import _ = require('underscore');

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

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private async init() {
    await this.loadLayouts();
    this.render();
    
    // Add event listeners with a small delay to ensure DOM is fully rendered
    setTimeout(() => this.addEventListeners(), 100);
    
    await this.initializeSimulation();
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
                <div class="metric">
                  <span class="label">Active Cars:</span>
                  <span class="value" id="active-cars">0</span>
                </div>
                
                <div class="metric">
                  <span class="label">Average Speed:</span>
                  <span class="value" id="average-speed">0.00 m/s</span>
                </div>
                
                <div class="metric">
                  <span class="label">Intersections:</span>
                  <span class="value" id="total-intersections">0</span>
                </div>
                
                <div class="metric">
                  <span class="label">Roads:</span>
                  <span class="value" id="total-roads">0</span>
                </div>
                
                <div class="metric">
                  <span class="label">Simulation Time:</span>
                  <span class="value" id="simulation-time">0.0s</span>
                </div>
                
                <button id="save-analytics" class="btn btn-secondary btn-block">
                  💾 Save Analytics
                </button>
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
            <canvas id="canvas"></canvas>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  private addEventListeners() {
    // Toggle panels
    document.getElementById('toggle-analytics')?.addEventListener('click', () => {
      const panel = document.getElementById('analytics-panel');
      const btn = document.getElementById('toggle-analytics');
      const isHidden = panel?.style.display === 'none';
      panel!.style.display = isHidden ? 'block' : 'none';
      btn!.textContent = isHidden ? 'Hide Analytics' : 'Show Analytics';
    });

    // Simulation controls
    document.getElementById('toggle-simulation')?.addEventListener('click', () => this.toggleSimulation());
    document.getElementById('reset-simulation')?.addEventListener('click', () => this.resetSimulation());
    document.getElementById('load-layout')?.addEventListener('click', () => this.showLoadDialog());
    document.getElementById('save-analytics')?.addEventListener('click', () => this.saveAnalytics());

    // Sliders
    const carsRange = document.getElementById('cars-range') as HTMLInputElement;
    const carsValue = document.getElementById('cars-value');
    carsRange?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      carsValue!.textContent = value;
      if (this.world) {
        this.world.carsNumber = parseInt(value);
      }
    });

    const timeFactorRange = document.getElementById('time-factor-range') as HTMLInputElement;
    const timeFactorValue = document.getElementById('time-factor-value');
    timeFactorRange?.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      timeFactorValue!.textContent = value.toFixed(1);
      if (this.visualizer) {
        this.visualizer.timeFactor = value;
      }
    });
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
      
      // Initialize visualizer with delay to ensure DOM is ready
      setTimeout(() => this.initializeVisualizer(), 300);
      
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
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas not found in DOM during simulation initialization');
      return;
    }

    console.log('🎨 Initializing simulation visualizer...');

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
      // Create visualizer in SIMULATION MODE
      this.visualizer = new Visualizer(this.world);
      
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
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const visualizerArea = canvas?.parentElement;
      
      if (canvas && visualizerArea) {
        const rect = visualizerArea.getBoundingClientRect();
        const targetWidth = Math.max(rect.width || 800, 400);
        const targetHeight = Math.max(rect.height || 600, 300);
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        console.log('🎨 Simulation: Canvas resized to:', targetWidth, 'x', targetHeight);
        
        // Redraw after resize
        if (this.visualizer) {
          setTimeout(() => {
            if (this.visualizer.drawSingleFrame) {
              this.visualizer.drawSingleFrame();
            }
          }, 100);
        }
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
  
      // Store current layout data (if any)
      let currentLayoutData = null;
      try {
        // Serialize the current world layout (without cars)
        const layoutData = _.extend({}, this.world);
        delete (layoutData as any).cars;
        currentLayoutData = JSON.stringify(layoutData);
        console.log('🔄 [SIM DEBUG] Saved current layout state');
      } catch (layoutErr) {
        console.warn('🔄 [SIM WARN] Could not save current layout:', layoutErr);
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

    this.analytics = {
      totalCars: Object.keys(this.world.cars?.all() || {}).length,
      averageSpeed: this.world.instantSpeed || 0,
      totalIntersections: Object.keys(this.world.intersections?.all() || {}).length,
      totalRoads: Object.keys(this.world.roads?.all() || {}).length,
      simulationTime: this.world.time || 0
    };

    // Update UI elements
    const activeCarsEl = document.getElementById('active-cars');
    const averageSpeedEl = document.getElementById('average-speed');
    const totalIntersectionsEl = document.getElementById('total-intersections');
    const totalRoadsEl = document.getElementById('total-roads');
    const simulationTimeEl = document.getElementById('simulation-time');

    if (activeCarsEl) activeCarsEl.textContent = this.analytics.totalCars.toString();
    if (averageSpeedEl) averageSpeedEl.textContent = this.analytics.averageSpeed.toFixed(2) + ' m/s';
    if (totalIntersectionsEl) totalIntersectionsEl.textContent = this.analytics.totalIntersections.toString();
    if (totalRoadsEl) totalRoadsEl.textContent = this.analytics.totalRoads.toString();
    if (simulationTimeEl) simulationTimeEl.textContent = this.analytics.simulationTime.toFixed(1) + 's';
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
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
      }
      
      .page-header h2 {
        margin: 0;
        color: #333;
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
        background-color: #fafafa;
        border-right: 1px solid #ddd;
        padding: 10px;
      }
      
      .panel {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 15px;
        padding: 10px;
      }
      
      .panel h3 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      
      .visualizer-area {
        flex: 1;
        overflow: hidden;
        position: relative;
      }
      
      .visualizer-area canvas {
        width: 100%;
        height: 100%;
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
      
      .btn-primary { background-color: #007bff; color: white; }
      .btn-success { background-color: #28a745; color: white; }
      .btn-info { background-color: #17a2b8; color: white; }
      .btn-warning { background-color: #ffc107; color: #212529; }
      .btn-secondary { background-color: #6c757d; color: white; }
      
      .slider {
        width: 100%;
      }
      
      .analytics {
        margin-top: 10px;
      }
      
      .metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .instructions {
        padding-left: 20px;
        margin-top: 0;
      }
      
      .instructions li {
        margin-bottom: 5px;
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
      
      // Create and save analytics data
      const analyticsData = {
        timestamp: new Date().toISOString(),
        metrics: this.analytics,
        layout: {
          roads: Object.keys(this.world.roads?.all() || {}).length,
          intersections: Object.keys(this.world.intersections?.all() || {}).length
        },
        simulation: {
          time: this.world.time || 0,
          carCount: Object.keys(this.world.cars?.all() || {}).length
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
        this.showNotification('No saved layouts found', 'warning');
        return;
      }
      
      // Create modal dialog
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '1000';
      
      // Create modal content
      const content = document.createElement('div');
      content.style.backgroundColor = '#fff';
      content.style.borderRadius = '8px';
      content.style.padding = '20px';
      content.style.width = '500px';
      content.style.maxWidth = '90%';
      content.style.maxHeight = '80vh';
      content.style.overflowY = 'auto';
      
      // Create header
      const header = document.createElement('h3');
      header.textContent = 'Load Layout';
      header.style.marginTop = '0';
      
      // Create layout list
      const list = document.createElement('div');
      list.style.marginBottom = '20px';
      
      // Add each layout
      this.layouts.forEach(layout => {
        const item = document.createElement('div');
        item.style.padding = '10px';
        item.style.borderBottom = '1px solid #eee';
        item.style.cursor = 'pointer';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        const name = document.createElement('span');
        name.textContent = layout.name || `Layout ${layout.id}`;
        
        const date = document.createElement('small');
        date.style.color = '#777';
        date.textContent = new Date(layout.updatedAt || layout.createdAt).toLocaleString();
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-primary';
        loadBtn.textContent = 'Load';
        loadBtn.onclick = async () => {
          document.body.removeChild(modal);
          await this.loadLayoutById(layout.id);
        };
        
        item.appendChild(name);
        item.appendChild(date);
        item.appendChild(loadBtn);
        list.appendChild(item);
      });
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn btn-secondary';
      closeBtn.textContent = 'Cancel';
      closeBtn.style.marginRight = '10px';
      closeBtn.onclick = () => {
        document.body.removeChild(modal);
      };
      
      // Create footer
      const footer = document.createElement('div');
      footer.style.marginTop = '20px';
      footer.style.textAlign = 'right';
      footer.appendChild(closeBtn);
      
      // Assemble modal
      content.appendChild(header);
      content.appendChild(list);
      content.appendChild(footer);
      modal.appendChild(content);
      
      // Show modal
      document.body.appendChild(modal);
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
      // Show loading state
      this.showNotification(`Loading layout...`, 'info');
      
      // Find layout from previously loaded layouts
      const layout = this.layouts.find(l => l.id === layoutId);
      if (!layout) {
        this.showNotification(`Layout not found (ID: ${layoutId})`, 'error');
        return;
      }
      
      // Stop current simulation if running
      const wasRunning = this.isRunning;
      if (wasRunning) {
        this.toggleSimulation(); // This will stop it
      }
      
      // Reset the simulation
      await this.resetSimulation();
      
      // Load the layout into world
      if (this.world) {
        this.world.load(layout.data);
        
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
    const canvas = document.getElementById('canvas');
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
}
