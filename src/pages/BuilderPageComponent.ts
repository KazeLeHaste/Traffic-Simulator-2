import { appState } from '../core/AppState';
import World = require('../model/world');
import Visualizer = require('../visualizer/visualizer');

/**
 * Builder page for creating and editing road networks
 */
export class BuilderPageComponent {
  private container: HTMLElement;
  private world: any;
  private visualizer: any;
  private layouts: any[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private async init() {
    await this.loadLayouts();
    this.render();
    
    // Add event listeners with longer delay and better error handling
    setTimeout(() => {
      console.log('🔗 Builder: Setting up event listeners...');
      this.addEventListeners();
    }, 500);
    
    await this.initializeWorld();
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
      <div class="builder-page">
        <div class="page-header">
          <h2>Road Network Builder</h2>
          <p>Create and edit road networks. Use Shift+Click to create intersections and Shift+Drag to create roads.</p>
        </div>
        
        <div class="builder-content">
          <div class="sidebar">
            <div class="panel">
              <h3>Layout Manager</h3>
              <button id="toggle-layouts" class="btn btn-primary btn-block">
                Show Saved Layouts
              </button>
              
              <div id="layout-manager" class="layout-manager" style="display: none;">
                <h4>Saved Layouts (${this.layouts.length})</h4>
                
                ${this.layouts.length > 0 ? `
                  <div class="layout-selector">
                    <select id="layout-select" class="form-control">
                      <option value="">Select a layout...</option>
                      ${this.layouts.map(layout => 
                        `<option value="${layout.id}">${layout.name}</option>`
                      ).join('')}
                    </select>
                    
                    <div class="layout-actions">
                      <button id="load-layout" class="btn btn-secondary btn-sm">Load</button>
                      <button id="delete-layout" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                  
                  <div class="layout-items">
                    ${this.layouts.map(layout => `
                      <div class="layout-item" data-layout-id="${layout.id}">
                        <div class="layout-info">
                          <strong>${layout.name}</strong>
                          <small>${new Date(layout.createdAt).toLocaleString()}</small>
                        </div>
                        <div class="layout-item-actions">
                          <button class="btn btn-sm btn-outline load-layout-btn" data-layout-id="${layout.id}">Load</button>
                          <button class="btn btn-sm btn-danger-outline delete-layout-btn" data-layout-id="${layout.id}">✕</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <p class="no-layouts">No saved layouts yet. Create and save your first layout!</p>
                `}
              </div>
            </div>
            
            <div class="panel">
              <h3>Controls</h3>
              <button id="save-layout" class="btn btn-success btn-block">💾 Save Layout</button>
              <button id="load-current" class="btn btn-secondary btn-block">📂 Load Layout</button>
              <button id="clear-world" class="btn btn-warning btn-block">🗑️ Clear</button>
              <button id="generate-map" class="btn btn-info btn-block">🎲 Generate Map</button>
            </div>
            
            <div class="panel">
              <h3>Instructions</h3>
              <ul class="instructions">
                <li><strong>Shift + Click:</strong> Create intersection</li>
                <li><strong>Shift + Drag:</strong> Create road between intersections</li>
                <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
                <li><strong>Drag:</strong> Pan around the map</li>
                <li><strong>Save Layout:</strong> Store your design</li>
              </ul>
            </div>
          </div>
          
          <div class="visualizer-area">
            <canvas id="canvas"></canvas>
          </div>
        </div>
      </div>
    `;

    // Add event listeners after render
    this.addStyles();
  }

  private addEventListeners() {
    console.log('🔗 Builder: addEventListeners called');
    
    // Check if buttons exist
    const saveBtn = document.getElementById('save-layout');
    const generateBtn = document.getElementById('generate-map');
    const clearBtn = document.getElementById('clear-world');
    const loadBtn = document.getElementById('load-current');
    
    console.log('🔗 Builder: Button elements found:', {
      saveBtn: !!saveBtn,
      generateBtn: !!generateBtn,
      clearBtn: !!clearBtn,
      loadBtn: !!loadBtn
    });

    // Toggle layout manager
    const toggleBtn = document.getElementById('toggle-layouts');
    const layoutManager = document.getElementById('layout-manager');
    
    toggleBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Toggle layouts clicked');
      const isHidden = layoutManager?.style.display === 'none';
      layoutManager!.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide Saved Layouts' : 'Show Saved Layouts';
    });

    // Control buttons with logging
    saveBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Save layout clicked');
      this.saveLayout();
    });
    loadBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Load layout clicked');
      this.loadLayout();
    });
    clearBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Clear world clicked');
      this.clearWorld();
    });
    generateBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Generate map clicked');
      this.generateMap();
    });

    // Layout management
    document.getElementById('load-layout')?.addEventListener('click', () => this.loadSelectedLayout());
    document.getElementById('delete-layout')?.addEventListener('click', () => this.deleteSelectedLayout());

    // Individual layout buttons
    document.querySelectorAll('.load-layout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layoutId = (e.target as HTMLElement).getAttribute('data-layout-id');
        if (layoutId) this.loadLayoutById(layoutId);
      });
    });

    document.querySelectorAll('.delete-layout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layoutId = (e.target as HTMLElement).getAttribute('data-layout-id');
        if (layoutId) this.deleteLayoutById(layoutId);
      });
    });
  }

  private async initializeWorld() {
    console.log('🌍 Initializing world for builder...');
    
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

      // BUILDER MODE: NO cars, purely for layout editing
      this.world.carsNumber = 0;
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }

      console.log('🌍 World initialized with:', {
        intersections: Object.keys(this.world.intersections?.all() || {}).length,
        roads: Object.keys(this.world.roads?.all() || {}).length,
        cars: this.world.carsNumber
      });

      // Initialize visualizer with delay to ensure DOM is ready
      setTimeout(() => this.initializeVisualizer(), 300);
      
      console.log('✅ World initialized successfully');
    } catch (error) {
      console.error('🚨 Failed to initialize world:', error);
    }
  }

  private initializeVisualizer() {
    console.log('🎨 Builder: Initializing visualizer...');
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Builder: Canvas not found in DOM');
      return;
    }

    // Debug canvas container
    const visualizerArea = canvas.parentElement;
    console.log('🎨 Builder: Canvas container found:', !!visualizerArea);
    
    if (visualizerArea) {
      const rect = visualizerArea.getBoundingClientRect();
      console.log('🎨 Builder: Container dimensions:', rect);
      
      // Use the full container dimensions for responsive sizing
      const targetWidth = Math.max(rect.width || 800, 400);
      const targetHeight = Math.max(rect.height || 600, 300);
      
      console.log('🎨 Builder: Target canvas size:', targetWidth, 'x', targetHeight);
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Set responsive styling for builder canvas
      canvas.style.cssText = `
        width: 100% !important;
        height: 100% !important;
        display: block !important;
        border: 2px solid #0000ff !important;
        position: relative !important;
        z-index: 10 !important;
        pointer-events: auto !important;
        box-sizing: border-box !important;
      `;
      
      console.log('🎨 Builder: Canvas styled, final size:', canvas.width, 'x', canvas.height);
    }

    try {
      // Create visualizer in BUILDER MODE - all editing tools active
      console.log('🎨 Builder: Creating visualizer with world...');
      this.visualizer = new Visualizer(this.world);
      console.log('🎨 Builder: Visualizer created successfully');
      
      // Check if visualizer has canvas
      console.log('🎨 Builder: Visualizer canvas:', this.visualizer.canvas);
      console.log('🎨 Builder: Visualizer canvas size:', this.visualizer.canvas?.width, 'x', this.visualizer.canvas?.height);
      
      // BUILDER MODE: Keep cars at 0 and disable simulation
      this.world.carsNumber = 0;
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      // Set builder mode to prevent simulation
      this.visualizer.isBuilderMode = true;
      
      // Start visualizer for rendering (but not simulation)
      console.log('🎨 Builder: Starting visualizer...');
      this.visualizer.start();
      console.log('🎨 Builder: Visualizer started');
      
      // Force initial draw after a short delay
      setTimeout(() => {
        console.log('🎨 Builder: Attempting to draw...');
        
        // Check if canvas still exists and has correct reference
        const canvasCheck = document.getElementById('canvas') as HTMLCanvasElement;
        console.log('🎨 Builder: Canvas check:', !!canvasCheck);
        
        // Only check reference if visualizer still exists
        if (this.visualizer && this.visualizer.canvas) {
          console.log('🎨 Builder: Canvas same reference?', canvasCheck === this.visualizer.canvas);
        }
        
        // Skip direct canvas test - let visualizer handle all drawing
        console.log('🎨 Builder: Letting visualizer handle canvas drawing...');
        
        if (this.visualizer) {
          // Skip test rendering - causes red background flash
          // Test method has been commented out in visualizer.ts
          
          if (this.visualizer.drawSingleFrame) {
            this.visualizer.drawSingleFrame();
          }
        }
      }, 1000);
      
      console.log('✅ Builder visualizer initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing builder visualizer:', error);
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
        
        console.log('🎨 Builder: Canvas resized to:', targetWidth, 'x', targetHeight);
        
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

  private async saveLayout() {
    if (!this.world) return;

    try {
      const worldData = {
        intersections: this.world.intersections?.all() || {},
        roads: this.world.roads?.all() || {},
        carsNumber: this.world.carsNumber || 0,
        time: this.world.time || 0
      };

      await appState.storage.saveLayout(worldData);
      this.showNotification('Layout saved successfully!');
      await this.loadLayouts();
      this.render(); // Re-render to update layout list
      this.initializeVisualizer(); // Re-initialize after render
    } catch (error) {
      console.error('Failed to save layout:', error);
      this.showNotification('Failed to save layout!', 'error');
    }
  }

  private async loadLayout() {
    if (!this.world) return;

    try {
      const data = await appState.storage.loadLayout();
      if (data) {
        this.world.load(JSON.stringify(data));
        this.showNotification('Layout loaded successfully!');
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
      this.showNotification('Failed to load layout!', 'error');
    }
  }

  private async loadSelectedLayout() {
    const select = document.getElementById('layout-select') as HTMLSelectElement;
    const layoutId = select?.value;
    if (layoutId) {
      await this.loadLayoutById(layoutId);
    }
  }

  private async loadLayoutById(layoutId: string) {
    const layout = this.layouts.find(l => l.id === layoutId);
    if (layout && this.world) {
      try {
        this.world.load(JSON.stringify(layout.data));
        this.showNotification('Layout loaded successfully!');
      } catch (error) {
        console.error('Failed to load layout:', error);
        this.showNotification('Failed to load layout!', 'error');
      }
    }
  }

  private async deleteSelectedLayout() {
    const select = document.getElementById('layout-select') as HTMLSelectElement;
    const layoutId = select?.value;
    if (layoutId) {
      await this.deleteLayoutById(layoutId);
    }
  }

  private async deleteLayoutById(layoutId: string) {
    if (confirm('Are you sure you want to delete this layout?')) {
      try {
        const remainingLayouts = this.layouts.filter(l => l.id !== layoutId);
        localStorage.setItem('traffic_simulator_layouts', JSON.stringify(remainingLayouts));
        await this.loadLayouts();
        this.render();
        this.initializeVisualizer();
        this.showNotification('Layout deleted successfully!');
      } catch (error) {
        console.error('Failed to delete layout:', error);
        this.showNotification('Failed to delete layout!', 'error');
      }
    }
  }

  private clearWorld() {
    if (!this.world) return;
    
    console.log('🧹 Clearing world...');
    try {
      this.world.set({}); // Reset world to empty state
      this.world.carsNumber = 0;
      this.showNotification('World cleared successfully!');
      
      // Ensure visualization is updated
      if (this.visualizer) {
        this.visualizer.running = false;
      }
    } catch (error) {
      console.error('Failed to clear world:', error);
      this.showNotification('Failed to clear world!', 'error');
    }
  }

  private generateMap() {
    if (!this.world) {
      return;
    }
    
    try {
      this.world.generateMap();
      
      // BUILDER MODE: No cars, purely for layout editing
      this.world.carsNumber = 0;
      if (this.world.cars && this.world.cars.clear) {
        this.world.cars.clear();
      }
      
      this.showNotification('New map generated successfully!');
      
      // Ensure visualization is updated
      if (this.visualizer) {
        // No need to stop/start in builder mode, just ensure no simulation
        this.visualizer.running = false;
      }
    } catch (error) {
      console.error('Failed to generate map:', error);
      this.showNotification('Failed to generate map!', 'error');
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
    if (!document.getElementById('builder-styles')) {
      const style = document.createElement('style');
      style.id = 'builder-styles';
      style.textContent = `
        .builder-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: #1a1a1a;
          color: #ffffff;
          overflow: hidden;
          position: relative;
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
        
        .builder-content {
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
          align-items: stretch;
          justify-content: stretch;
          min-height: 0;
          border: 2px solid #00ff00;
          overflow: hidden;
        }
        
        .visualizer-area canvas {
          width: 100% !important;
          height: 100% !important;
          background: #ff0000 !important;
          border: 2px solid #0000ff !important;
          display: block !important;
          position: relative !important;
          z-index: 10 !important;
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
        
        .btn-primary { background-color: #375a7f; color: white; border: 1px solid #375a7f; }
        .btn-primary:hover { background-color: #2e4c6d; }
        .btn-secondary { background-color: #444444; color: white; border: 1px solid #666666; }
        .btn-secondary:hover { background-color: #555555; }
        .btn-success { background-color: #00bc8c; color: white; border: 1px solid #00bc8c; }
        .btn-success:hover { background-color: #00a085; }
        .btn-warning { background-color: #f39c12; color: #212529; border: 1px solid #f39c12; }
        .btn-warning:hover { background-color: #e67e22; }
        .btn-info { background-color: #3498db; color: white; border: 1px solid #3498db; }
        .btn-info:hover { background-color: #2980b9; }
        .btn-danger { background-color: #e74c3c; color: white; border: 1px solid #e74c3c; }
        .btn-danger:hover { background-color: #c0392b; }
        
        .btn-sm { padding: 4px 8px; font-size: 12px; }
        .btn-outline { background: #404040; border: 1px solid #666666; color: #ffffff; }
        .btn-outline:hover { background: #555555; }
        .btn-danger-outline { background: #404040; border: 1px solid #dc3545; color: #dc3545; }
        .btn-danger-outline:hover { background: #dc3545; color: white; }
        
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
        
        .layout-actions {
          display: flex;
          gap: 8px;
        }
        
        .layout-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          margin-bottom: 4px;
          background: #404040;
          border: 1px solid #666666;
          border-radius: 4px;
        }
        
        .layout-info strong {
          display: block;
          color: #ffffff;
          font-size: 14px;
        }
        
        .layout-info small {
          color: #b0b0b0;
          font-size: 12px;
        }
        
        .layout-item-actions {
          display: flex;
          gap: 4px;
        }
        
        .no-layouts {
          text-align: center;
          color: #b0b0b0;
          font-style: italic;
          padding: 20px;
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
        
        .instructions strong {
          color: #ffffff;
        }
      `;
      document.head.appendChild(style);
    }
  }

  destroy() {
    console.log('🧹 Builder: Destroying page and cleaning up canvas...');
    
    if (this.visualizer) {
      this.visualizer.stop();
      this.visualizer = null;
    }
    
    // Remove the canvas element to prevent duplicates
    const canvas = document.getElementById('canvas');
    if (canvas) {
      console.log('🗑️ Builder: Removing canvas element');
      canvas.remove();
    }
    
    // Clear the container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    console.log('✅ Builder: Page destroyed and cleaned up');
  }

  // Public interface methods for app integration
  getContainer() {
    return this.container;
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
      // Re-initialize visualizer if needed
      if (this.world && !this.visualizer) {
        this.initializeVisualizer();
      }
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}
