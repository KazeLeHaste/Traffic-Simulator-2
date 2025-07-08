import { appState } from '../core/AppState';
import World = require('../model/world');
import Visualizer = require('../visualizer/visualizer');
import _ = require('underscore');
import settings = require('../settings');

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
  private analyticsInterval: NodeJS.Timeout | null = null;

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
              
              <div class="control-group">
                <label for="lights-flip-interval">Lights Flip Interval: <span id="lights-flip-value">160</span></label>
                <input type="range" id="lights-flip-interval" min="20" max="400" step="10" value="160" class="slider">
              </div>
              
              <div class="control-group">
                <div class="checkbox-container">
                  <input type="checkbox" id="debug-toggle" class="checkbox">
                  <label for="debug-toggle">Show Debug Information</label>
                </div>
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
            
            <!-- Traffic Pattern Controls -->
            <div class="panel">
              <h3>Traffic Pattern</h3>
              <div class="control-group">
                <label for="traffic-pattern">Select Pattern:</label>
                <select id="traffic-pattern" class="form-control">
                  <option value="random">Random</option>
                  <option value="heavy">Heavy Traffic</option>
                  <option value="light">Light Traffic</option>
                  <option value="rush-hour">Rush Hour</option>
                </select>
              </div>
              <button id="apply-pattern" class="btn btn-secondary btn-block">
                Apply Pattern
              </button>
            </div>
            
            <!-- Instructions -->
            <div class="panel">
              <h3>Instructions</h3>
              <ul class="instructions">
                <li>Select a saved layout or use the current one</li>
                <li>Adjust the number of cars and simulation speed</li>
                <li>Modify the traffic light timing as needed</li>
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
    document.getElementById('apply-pattern')?.addEventListener('click', () => this.applyTrafficPattern());

    // Cars slider
    const carsRange = document.getElementById('cars-range') as HTMLInputElement;
    const carsValue = document.getElementById('cars-value');
    carsRange?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      carsValue!.textContent = value;
      if (this.world) {
        this.world.carsNumber = parseInt(value);
      }
    });

    // Time factor slider
    const timeFactorRange = document.getElementById('time-factor-range') as HTMLInputElement;
    const timeFactorValue = document.getElementById('time-factor-value');
    timeFactorRange?.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      timeFactorValue!.textContent = value.toFixed(1);
      if (this.visualizer) {
        this.visualizer.timeFactor = value;
      }
    });
    
    // Lights flip interval slider
    const lightsFlipRange = document.getElementById('lights-flip-interval') as HTMLInputElement;
    const lightsFlipValue = document.getElementById('lights-flip-value');
    lightsFlipRange?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      lightsFlipValue!.textContent = value.toString();
      
      // Update the global setting for traffic light timing
      settings.lightsFlipInterval = value;
      
      // Visual feedback
      lightsFlipValue!.style.fontWeight = 'bold';
      setTimeout(() => {
        lightsFlipValue!.style.fontWeight = 'normal';
      }, 500);
    });
    
    // Debug information toggle
    const debugToggle = document.getElementById('debug-toggle') as HTMLInputElement;
    debugToggle?.addEventListener('change', () => {
      if (this.visualizer) {
        this.visualizer.debug.enabled = debugToggle.checked;
        this.visualizer.debug.showIds = debugToggle.checked;
        console.log(`Debug mode ${debugToggle.checked ? 'enabled' : 'disabled'}`);
      }
    });
  }

  private async initializeSimulation() {
    try {
      // Create new world instance
      this.world = new World();
      
      // Create a default road network if none exists
      if (!localStorage.world) {
        this.world.generateMap();
        this.world.carsNumber = 100;
      } else {
        // Load existing world
        this.world.load();
      }
      
      // Initialize visualizer
      this.visualizer = new Visualizer(this.world, 'simulation-canvas');
      
      // Important: Configure visualizer for simulation mode (not builder mode)
      this.visualizer.setMode(false); // false = simulation mode
      
      // Set initial values for controls
      this.updateControlValues();
      
      // Start the simulation
      this.visualizer.start();
      this.isRunning = true;
      
      // Start analytics update
      this.startAnalyticsUpdates();
      
      // Update UI to reflect the simulation is running
      const toggleButton = document.getElementById('toggle-simulation');
      if (toggleButton) {
        toggleButton.innerHTML = '⏸️ Pause Simulation';
        toggleButton.classList.remove('btn-success');
        toggleButton.classList.add('btn-warning');
      }
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  }
  
  private updateControlValues() {
    // Update car count slider
    const carsRange = document.getElementById('cars-range') as HTMLInputElement;
    const carsValue = document.getElementById('cars-value');
    
    if (carsRange && carsValue) {
      carsRange.value = String(this.world.carsNumber);
      carsValue.textContent = String(this.world.carsNumber);
    }
    
    // Update time factor slider
    const timeFactorRange = document.getElementById('time-factor-range') as HTMLInputElement;
    const timeFactorValue = document.getElementById('time-factor-value');
    
    if (timeFactorRange && timeFactorValue && this.visualizer) {
      timeFactorRange.value = String(this.visualizer.timeFactor);
      timeFactorValue.textContent = String(this.visualizer.timeFactor);
    }
    
    // Update lights flip interval slider
    const lightsFlipRange = document.getElementById('lights-flip-interval') as HTMLInputElement;
    const lightsFlipValue = document.getElementById('lights-flip-value');
    
    if (lightsFlipRange && lightsFlipValue) {
      lightsFlipRange.value = String(settings.lightsFlipInterval);
      lightsFlipValue.textContent = String(settings.lightsFlipInterval);
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
      console.error('❌ Simulation canvas not found in DOM during simulation initialization');
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
      this.visualizer = new Visualizer(this.world, 'simulation-canvas');
      
      // SIMULATION MODE: Start with no cars and no simulation running
      this.world.carsNumber = 0;
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      // Set to simulation mode first before binding tools
      this.visualizer.isBuilderMode = false;
      
      // Explicitly rebind tools with simulation mode settings to prevent flickering
      if (typeof this.visualizer.bindTools === 'function') {
        this.visualizer.bindTools();
      }
      
      // Don't start the animation loop automatically - let user control it
      this.visualizer.running = false;
      this.isRunning = false;
      
      // Draw a single frame to show the current state
      setTimeout(() => {
        if (this.visualizer) {
          this.visualizer.drawSingleFrame();
        }
      }, 100);
      this.isRunning = false;
      
      // Start analytics updates
      this.startAnalyticsUpdates();
      
      // Force initial draw after a short delay
      setTimeout(() => {
        if (this.visualizer) {
          // Use proper method to force a redraw without animation
          this.visualizer.forceRedraw();
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
            if (this.visualizer) {
              // Use proper method to force a redraw without animation
              this.visualizer.forceRedraw();
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

  private async loadLayoutById(layoutId: string) {
    try {
      console.log('🔄 [SIM DEBUG] Loading layout:', layoutId);
      
      // Stop any running simulation first
      if (this.isRunning && this.visualizer) {
        this.visualizer.stop();
        this.isRunning = false;
      }
      
      const layout = await appState.storage.loadLayout(layoutId);
      if (layout && this.world) {
        console.log('🔄 [SIM DEBUG] Layout data loaded, applying to world...');
        
        // Clear the world first
        this.world.clear();
        
        // Load the layout data
        this.world.load(JSON.stringify(layout.data));
        
        // Set car count from slider but don't spawn cars yet
        const carsRange = document.getElementById('cars-range') as HTMLInputElement;
        this.world.carsNumber = parseInt(carsRange?.value || '100');
        
        console.log('🔄 [SIM DEBUG] Layout loaded, reinitializing visualizer...');
        
        // Destroy and recreate visualizer to ensure clean state
        if (this.visualizer) {
          this.destroyVisualizer();
        }
        
        // Wait a bit for cleanup then reinitialize
        setTimeout(() => {
          this.initializeVisualizer();
          this.updateAnalytics();
          this.showNotification('Layout loaded successfully!');
        }, 100);
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
      this.showNotification('Failed to load layout!', 'error');
    }
  }

  private async showLoadDialog() {
    try {
      // Refresh layouts list
      await this.loadLayouts();
      
      if (this.layouts.length === 0) {
        this.showNotification('No layouts available to load. Create one in the Builder first!', 'warning');
        return;
      }
      
      // Remove any existing modal dialogs first
      const existingDialogs = document.querySelectorAll('.modal-dialog, .modal-overlay');
      existingDialogs.forEach(dialog => dialog.remove());
      
      // Create modal dialog with consistent styling to match BuilderPage
      const dialog = document.createElement('div');
      dialog.className = 'modal-overlay';
      dialog.innerHTML = `
        <div class="modal-dialog modal-large">
          <div class="modal-header">
            <h3>Load Layout</h3>
            <button class="close-btn" id="close-load-dialog">×</button>
          </div>
          <div class="modal-body">
            <p>Select a layout to load:</p>
            <div class="layout-grid">
              ${this.layouts.map(layout => `
                <div class="layout-card" data-layout-id="${layout.id}">
                  <div class="layout-info">
                    <h4>${layout.name || 'Unnamed Layout'}</h4>
                    <small>Created: ${new Date(layout.timestamp || layout.createdAt).toLocaleString()}</small>
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
      
      // Add to document
      document.body.appendChild(dialog);
      
      // Set up event handlers
      document.getElementById('close-load-dialog')?.addEventListener('click', () => {
        dialog.remove();
      });
      
      document.getElementById('cancel-load')?.addEventListener('click', () => {
        dialog.remove();
      });
      
      // Set up load buttons
      const loadButtons = dialog.querySelectorAll('.load-layout-btn');
      loadButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const layoutId = (event.currentTarget as HTMLElement).getAttribute('data-layout-id');
          if (layoutId) {
            await this.loadLayoutById(layoutId);
            dialog.remove();
          }
        });
      });
      
    } catch (error) {
      console.error('Failed to show load dialog:', error);
      this.showNotification('Error showing layout dialog!', 'error');
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
      this.visualizer.stop(); // Use proper stop method
      this.isRunning = false;
      
      // Keep the canvas visible by doing a single frame draw
      setTimeout(() => {
        this.visualizer.drawSingleFrame();
      }, 10);
      
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
      
      // Apply traffic light interval from slider
      const lightsFlipSlider = document.getElementById('lights-flip-interval') as HTMLInputElement;
      if (lightsFlipSlider) {
        const interval = parseInt(lightsFlipSlider.value || '160');
        console.log('🎮 [SIM] Setting lights flip interval to', interval);
        settings.lightsFlipInterval = interval;
      }
      
      // Start the animation loop
      console.log('🎮 [SIM] Setting visualizer.running = true');
      this.visualizer.start(); // Use proper start method
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
      if (this.visualizer.stop) {
        this.visualizer.stop();
      } else {
        this.visualizer.running = false;
      }
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

  private startAnalyticsUpdates() {
    // Clear any existing interval
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }
    
    // Update analytics every second
    this.analyticsInterval = setInterval(() => {
      this.updateAnalytics();
    }, 1000);
  }

  private saveAnalytics() {
    try {
      if (!this.world) {
        this.showNotification('No simulation data to save!', 'error');
        return;
      }
      
      // Generate timestamp for the filename
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      
      // Create analytics data object
      const analyticsData = {
        timestamp: new Date().toISOString(),
        metrics: this.analytics,
        worldState: {
          carCount: this.world.carsNumber,
          intersectionCount: Object.keys(this.world.intersections?.all() || {}).length,
          roadCount: Object.keys(this.world.roads?.all() || {}).length,
        }
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(analyticsData, null, 2);
      
      // Create a download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `traffic-sim-analytics-${timestamp}.json`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      this.showNotification('Analytics saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save analytics:', error);
      this.showNotification('Failed to save analytics!', 'error');
    }
  }

  private applyTrafficPattern() {
    const patternSelect = document.getElementById('traffic-pattern') as HTMLSelectElement;
    const pattern = patternSelect.value;
    
    if (!this.world) {
      this.showNotification('World not initialized!', 'error');
      return;
    }
    
    // Get current car count slider
    const carsSlider = document.getElementById('cars-range') as HTMLInputElement;
    const timeFactorSlider = document.getElementById('time-factor-range') as HTMLInputElement;
    const lightsFlipSlider = document.getElementById('lights-flip-interval') as HTMLInputElement;
    
    let carCount = 100;
    let timeFactor = 1.0;
    let flipInterval = 160;
    
    // Apply different patterns based on selection
    switch (pattern) {
      case 'heavy':
        carCount = 180;
        timeFactor = 1.2;
        flipInterval = 220;
        break;
      case 'light':
        carCount = 50;
        timeFactor = 2.0;
        flipInterval = 100;
        break;
      case 'rush-hour':
        carCount = 200;
        timeFactor = 0.8;
        flipInterval = 300;
        break;
      default: // random
        carCount = Math.floor(Math.random() * 150) + 50; // 50-200
        timeFactor = Math.random() * 2 + 0.5; // 0.5-2.5
        flipInterval = Math.floor(Math.random() * 300) + 50; // 50-350
    }
    
    // Update sliders and apply values
    carsSlider.value = carCount.toString();
    document.getElementById('cars-value')!.textContent = carCount.toString();
    this.world.carsNumber = carCount;
    
    timeFactorSlider.value = timeFactor.toString();
    document.getElementById('time-factor-value')!.textContent = timeFactor.toFixed(1);
    if (this.visualizer) {
      this.visualizer.timeFactor = timeFactor;
    }
    
    lightsFlipSlider.value = flipInterval.toString();
    document.getElementById('lights-flip-value')!.textContent = flipInterval.toString();
    settings.lightsFlipInterval = flipInterval;
    
    // Show notification
    this.showNotification(`Applied ${pattern} traffic pattern!`, 'success');
  }

  // Utility function for showing notifications
  private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after timeout
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
  
  // Helper method to ensure a CSS file is loaded
  private ensureCssFileLoaded(id: string, href: string): Promise<void> {
    return new Promise((resolve) => {
      // Check if the CSS file is already loaded
      let styleLink = document.getElementById(id) as HTMLLinkElement;
      
      if (!styleLink) {
        // Create new link if it doesn't exist
        styleLink = document.createElement('link');
        styleLink.id = id;
        styleLink.rel = 'stylesheet';
        styleLink.href = href;
        document.head.appendChild(styleLink);
        
        // Resolve when loaded
        styleLink.onload = () => {
          console.log(`🎨 [SIM] CSS file loaded: ${href}`);
          resolve();
        };
        
        // Also resolve after timeout in case onload doesn't fire
        setTimeout(resolve, 50);
      } else {
        // Already exists, ensure it's in the head and has correct href
        if (styleLink.href !== href) {
          styleLink.href = href;
        }
        resolve();
      }
    });
  }

  private addStyles() {
    console.log('🎨 [SIM] Applying simulation page styles');
    
    // 1. Add simulation-specific class to body immediately
    document.body.className = 'simulation-mode no-scroll';
    
    // 2. Apply direct styling to critical elements for immediate effect
    document.body.style.backgroundColor = '#1a1a1a';
    document.body.style.color = '#ffffff';
    
    // 3. Ensure core CSS files are loaded in the right order
    // Load these CSS files with our improved loader
    Promise.all([
      this.ensureCssFileLoaded('style-css', 'css/style.css'),
      this.ensureCssFileLoaded('dat-gui-css', 'css/dat-gui.css'),
      this.ensureCssFileLoaded('dark-theme-css', 'css/dark-theme.css')
    ]).then(() => {
      console.log('🎨 [SIM] All CSS files loaded');
    });
    
    // 4. Apply panel-specific styles
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
      .panel {
        background-color: #2d2d2d !important;
        border: 1px solid #404040 !important;
        border-radius: 4px !important;
        padding: 15px !important;
        margin-bottom: 15px !important;
      }
      .btn-primary {
        background-color: #375a7f !important;
        border-color: #375a7f !important;
        color: white !important;
      }
      .btn-info {
        background-color: #3498db !important;
        border-color: #3498db !important;
        color: white !important;
      }
      .btn-success {
        background-color: #00bc8c !important;
        border-color: #00bc8c !important;
        color: white !important;
      }
      .btn-warning {
        background-color: #f39c12 !important;
        border-color: #f39c12 !important;
        color: white !important;
      }
      .btn-secondary {
        background-color: #444444 !important;
        border-color: #444444 !important;
        color: white !important;
      }
    `;
    document.head.appendChild(additionalStyles);
    
    // 5. Force a reflow to apply styles immediately - BUT DO IT GENTLY
    setTimeout(() => {
      console.log('🎨 [SIM] Applying consistent styling');
      
      // Apply class to sidebar panels
      const panels = document.querySelectorAll('.panel');
      panels.forEach(panel => {
        panel.classList.add('styled-panel');
      });
      
      // Apply styles to buttons
      const buttons = document.querySelectorAll('.btn');
      buttons.forEach(button => {
        if (!button.className.includes('styled-button')) {
          button.classList.add('styled-button');
        }
      });
    }, 100);
  }
  
  // Helper method to ensure CSS files are loaded
  private ensureCssFile(id: string, href: string): void {
    let linkElement = document.getElementById(id) as HTMLLinkElement;
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.id = id;
      linkElement.rel = 'stylesheet';
      linkElement.href = href;
      document.head.appendChild(linkElement);
      console.log(`🎨 [SIM] Added CSS: ${href}`);
    } else {
      // Ensure it's the last one (highest precedence)
      document.head.appendChild(linkElement);
      console.log(`🎨 [SIM] Reordered CSS: ${href}`);
    }
  }

  /**
   * Cleanup method when navigating away from this page
   */
  public destroy(): void {
    // Stop analytics update
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }
    
    // Clean up visualizer resources if available
    if (this.visualizer && typeof this.visualizer.destroy === 'function') {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    
    // Remove the canvas element to prevent duplicates
    const canvas = document.getElementById('simulation-canvas');
    if (canvas) {
      console.log('🗑️ Simulation: Removing simulation canvas element');
      canvas.remove();
    }
    
    // Remove any event listeners
    try {
      const controls = [
        'toggle-simulation',
        'reset-simulation',
        'cars-range',
        'time-factor-range',
        'lights-flip-interval',
        'toggle-analytics',
        'load-layout'
      ];
      
      controls.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          // Use cloneNode to remove all event listeners at once
          const newElement = element.cloneNode(true);
          if (element.parentNode) {
            element.parentNode.replaceChild(newElement, element);
          }
        }
      });
    } catch (error) {
      console.error('Error removing event listeners:', error);
    }
  }
}
