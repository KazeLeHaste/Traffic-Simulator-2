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
