import { appState } from '../core/AppState';
import World = require('../model/world');
import Visualizer = require('../visualizer/visualizer');

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
              <button id="toggle-layouts" class="btn btn-primary btn-block">
                Show Layout Selector
              </button>
              
              <div id="layout-selector" class="layout-selector" style="display: none;">
                <div class="layout-info">
                  <p>Choose a layout created in the Builder to simulate:</p>
                </div>
                
                <label>Available Layouts:</label>
                <select id="layout-select" class="form-control">
                  <option value="">-- Select a Layout --</option>
                  ${this.layouts.map(layout => 
                    `<option value="${layout.id}">${layout.name}</option>`
                  ).join('')}
                </select>
                
                <button id="load-layout" class="btn btn-success btn-block">
                  Load Selected Layout
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
    document.getElementById('toggle-layouts')?.addEventListener('click', () => {
      const panel = document.getElementById('layout-selector');
      const btn = document.getElementById('toggle-layouts');
      const isHidden = panel?.style.display === 'none';
      panel!.style.display = isHidden ? 'block' : 'none';
      btn!.textContent = isHidden ? 'Hide Layout Selector' : 'Show Layout Selector';
    });

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
    document.getElementById('load-layout')?.addEventListener('click', () => this.loadSelectedLayout());
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

      // Try to load existing layout first, or generate a fresh map
      try {
        const savedData = await appState.storage.loadLayout();
        if (savedData) {
          this.world.load(JSON.stringify(savedData));
        } else {
          this.world.generateMap();
        }
      } catch (error) {
        console.warn('No saved layout found, generating fresh map');
        this.world.generateMap();
      }

      // Set initial number of cars for simulation
      this.world.carsNumber = 100;
      
      console.log('🌍 World initialized with:', {
        intersections: Object.keys(this.world.intersections?.all() || {}).length,
        roads: Object.keys(this.world.roads?.all() || {}).length,
        cars: this.world.carsNumber
      });
      
      // Initialize visualizer with delay to ensure DOM is ready
      setTimeout(() => this.initializeVisualizer(), 300);
      
    } catch (error) {
      console.error('🚨 Failed to initialize simulation world:', error);
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
      
      // SIMULATION MODE: Keep editing tools active for layout modification
      // Set isBuilderMode to false to allow simulation
      this.visualizer.isBuilderMode = false;
      
      // Start the visualizer for rendering
      this.visualizer.start();
      
      // Start analytics updates
      this.startAnalyticsUpdates();
      
      // Force initial draw after a short delay
      setTimeout(() => {
        if (this.visualizer && this.visualizer.drawSingleFrame) {
          this.visualizer.drawSingleFrame();
        }
      }, 200);
      
      console.log('✅ Simulation visualizer initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing simulation visualizer:', error);
    }
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
    if (!this.visualizer) return;

    const button = document.getElementById('toggle-simulation');
    
    if (this.isRunning) {
      // Stop simulation (pause)
      this.visualizer.running = false;
      this.isRunning = false;
      button!.innerHTML = '▶️ Start Simulation';
      button!.className = 'btn btn-success btn-block';
    } else {
      // Start simulation 
      this.visualizer.running = true;
      this.isRunning = true;
      button!.innerHTML = '⏸️ Pause Simulation';
      button!.className = 'btn btn-warning btn-block';
    }
  }

  private resetSimulation() {
    if (!this.world || !this.visualizer) return;

    // Clear all cars and reset time
    this.world.cars.clear();
    this.world.time = 0;
    this.world.carsNumber = parseInt((document.getElementById('cars-range') as HTMLInputElement)?.value || '100');

    this.updateAnalytics();
    this.showNotification('Simulation reset!');

    // If it was running, restart it
    if (this.isRunning) {
      this.visualizer.running = false;
      setTimeout(() => {
        this.visualizer.running = true;
      }, 100);
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

  private async saveAnalytics() {
    try {
      const carsRange = document.getElementById('cars-range') as HTMLInputElement;
      const timeFactorRange = document.getElementById('time-factor-range') as HTMLInputElement;
      const layoutSelect = document.getElementById('layout-select') as HTMLSelectElement;

      const analyticsData = {
        ...this.analytics,
        timestamp: new Date().toISOString(),
        layoutId: layoutSelect?.value || 'current',
        carsNumber: parseInt(carsRange?.value || '100'),
        timeFactor: parseFloat(timeFactorRange?.value || '1')
      };

      await appState.storage.saveAnalytics(analyticsData);
      this.showNotification('Analytics saved successfully!');
    } catch (error) {
      console.error('Failed to save analytics:', error);
      this.showNotification('Failed to save analytics!', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
      color: ${type === 'success' ? '#155724' : '#721c24'};
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1001;
      border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  private addStyles() {
    if (!document.getElementById('simulation-styles')) {
      const style = document.createElement('style');
      style.id = 'simulation-styles';
      style.textContent = `
        .simulation-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: #1a1a1a;
          color: #ffffff;
          overflow: hidden;
        }
        
        .page-header {
          background: #2d2d2d;
          color: #ffffff;
          padding: 20px;
          border-bottom: 1px solid #404040;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .page-header h2 {
          margin: 0 0 8px 0;
          color: #ffffff;
          font-weight: 600;
        }
        
        .page-header p {
          margin: 0;
          color: #b0b0b0;
          font-size: 0.95rem;
        }
        
        .simulation-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .sidebar {
          width: 300px;
          background: #2d2d2d;
          border-right: 1px solid #404040;
          overflow-y: auto;
          padding: 20px;
        }
        
        .visualizer-area {
          flex: 1;
          position: relative;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .visualizer-area canvas {
          width: 100% !important;
          height: 100% !important;
          background: #2d2d2d !important;
          border: 1px solid #404040;
          display: block !important;
        }
        
        .panel {
          margin-bottom: 20px;
          padding: 16px;
          border: 1px solid #404040;
          border-radius: 8px;
          background: #333333;
        }
        
        .panel h3 {
          margin: 0 0 12px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #ffffff;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          text-align: center;
          display: inline-block;
          text-decoration: none;
        }
        
        .btn-block {
          width: 100%;
          margin-bottom: 8px;
        }
        
        .btn-primary { background-color: #375a7f; color: white; }
        .btn-primary:hover { background-color: #2e4c6d; }
        .btn-secondary { background-color: #444444; color: white; }
        .btn-secondary:hover { background-color: #555555; }
        .btn-success { background-color: #00bc8c; color: white; }
        .btn-success:hover { background-color: #00a085; }
        .btn-warning { background-color: #f39c12; color: #212529; }
        .btn-warning:hover { background-color: #e67e22; }
        .btn-info { background-color: #3498db; color: white; }
        .btn-info:hover { background-color: #2980b9; }
        
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #404040;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 8px;
          background: #404040;
          color: #ffffff;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .control-group {
          margin-bottom: 16px;
        }
        
        .control-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #ffffff;
          font-size: 14px;
        }
        
        .slider {
          width: 100%;
          margin: 8px 0;
          background: #404040;
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: none;
        }
        
        .analytics {
          margin-top: 12px;
        }
        
        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #404040;
        }
        
        .metric:last-of-type {
          border-bottom: none;
          margin-bottom: 12px;
        }
        
        .metric .label {
          font-weight: 500;
          color: #b0b0b0;
        }
        
        .metric .value {
          font-weight: 600;
          color: #ffffff;
          background: #404040;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .instructions {
          margin: 0;
          padding-left: 16px;
        }
        
        .instructions li {
          margin-bottom: 8px;
          color: #b0b0b0;
          font-size: 14px;
        }
        
        .text-muted {
          color: #6c757d;
        }
      `;
      document.head.appendChild(style);
    }
  }

  destroy() {
    if (this.visualizer) {
      this.visualizer.stop();
      this.visualizer = null;
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }
    if (this.world) {
      this.world = null;
    }
  }

  // Public interface methods for app integration
  getContainer() {
    return this.container;
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}
