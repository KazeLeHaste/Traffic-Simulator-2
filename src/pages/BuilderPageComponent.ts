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
      <div class="builder-page">
        <div class="page-header">
          <h2>Road Network Builder</h2>
          <p>Create and edit road networks. Use Shift+Click to create intersections and Shift+Drag to create roads.</p>
        </div>
        
        <div class="builder-content">
          <div class="sidebar">
            <div class="panel">
              <h3>Controls</h3>
              <button id="save-layout" class="btn btn-success btn-block">💾 Save Layout</button>
              <button id="load-layout" class="btn btn-secondary btn-block">📁 Load Layout</button>
              <button id="clear-world" class="btn btn-danger btn-block">🗑️ Clear</button>

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
            <canvas id="builder-canvas"></canvas>
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
    const clearBtn = document.getElementById('clear-world');
    const loadBtn = document.getElementById('load-layout');
    
    console.log('🔗 Builder: Button elements found:', {
      saveBtn: !!saveBtn,
      clearBtn: !!clearBtn,
      loadBtn: !!loadBtn
    });

    // Control buttons with logging
    saveBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Save layout clicked');
      this.showSaveDialog();
    });
    
    loadBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Load layout clicked');
      this.showLoadDialog();
    });
    
    clearBtn?.addEventListener('click', () => {
      console.log('🔗 Builder: Clear world clicked');
      this.clearWorld();
    });
    

  }

  private async initializeWorld() {
    console.log('🌍 Initializing world for builder...');
    
    try {
      this.world = new World();

      // Start with completely empty world for builder
      this.world.clear();
      this.world.carsNumber = 0;

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

  private destroyVisualizer(): void {
    console.log('🎨 [DEBUG] Destroying visualizer...');
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
        
        console.log('🎨 [DEBUG] Visualizer destroyed successfully');
      } else {
        console.log('🎨 [DEBUG] No visualizer to destroy');
      }
    } catch (error) {
      console.error('🎨 [ERROR] Error destroying visualizer:', error);
    }
  }

  private initializeVisualizer(): void {
    if (!this.world) {
      console.error('🎨 [ERROR] Cannot initialize visualizer without world');
      return;
    }
    
    console.log('🎨 [DEBUG] Initializing new visualizer...');
    
    try {
      // Create new visualizer with the world
      this.visualizer = new Visualizer(this.world, 'builder-canvas');
      
      // Set builder mode
      this.visualizer.isBuilderMode = true;
      
      // Ensure zooming is at a reasonable level
      if (this.visualizer.zoomer) {
        this.visualizer.zoomer.defaultZoom = 4;
      }
      
      console.log('🎨 [DEBUG] Visualizer initialized successfully');
      
      // Do a single draw to show the initial state
      this.visualizer.forceRefresh();
    } catch (error) {
      console.error('🎨 [ERROR] Failed to initialize visualizer:', error);
    }
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

  private async saveLayout(layoutName: string) {
    if (!this.world) return;

    try {
      const worldData = {
        intersections: this.world.intersections?.all() || {},
        roads: this.world.roads?.all() || {},
        carsNumber: this.world.carsNumber || 0,
        time: this.world.time || 0
      };

      console.log('💾 Saving world data:', worldData);

      // Pass the world data and layout name
      await appState.storage.saveLayout(worldData, layoutName);
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
    console.log('🔄 [DEBUG] Starting loadLayoutById for ID:', layoutId);
    
    const layout = this.layouts.find(l => l.id === layoutId);
    if (layout && this.world) {
      try {
        console.log('🔄 [DEBUG] Layout found:', layout.name);
        console.log('🔄 [DEBUG] Layout data:', layout.data);
        console.log('🔄 [DEBUG] World exists:', !!this.world);
        console.log('🔄 [DEBUG] Visualizer exists:', !!this.visualizer);
        
        // Validate layout data structure
        if (!layout.data || typeof layout.data !== 'object') {
          throw new Error('Invalid layout data structure');
        }
        
        // Check what the world looks like before loading
        console.log('🔄 [DEBUG] World before loading:', {
          intersections: Object.keys(this.world.intersections?.all() || {}).length,
          roads: Object.keys(this.world.roads?.all() || {}).length
        });
        
        // Load the layout data
        console.log('🔄 [DEBUG] Calling world.load()...');
        this.world.load(JSON.stringify(layout.data));
        console.log('🔄 [DEBUG] World.load() completed');
        
        // Check what the world looks like after loading
        console.log('🔄 [DEBUG] World after loading:', {
          intersections: Object.keys(this.world.intersections?.all() || {}).length,
          roads: Object.keys(this.world.roads?.all() || {}).length
        });
        
        // Ensure builder mode - no cars
        console.log('🔄 [DEBUG] Setting builder mode - clearing cars...');
        this.world.carsNumber = 0;
        if (this.world.cars && this.world.cars.clear) {
          this.world.cars.clear();
        }
        console.log('🔄 [DEBUG] Cars cleared');
        
        // Complete visualizer reset: destroy and recreate
        console.log('🔄 [DEBUG] Performing complete visualizer reset...');
        
        // First destroy any existing visualizer
        this.destroyVisualizer();
        
        // Then create a fresh visualizer instance
        console.log('🔄 [DEBUG] Initializing new visualizer after layout load...');
        this.initializeVisualizer();
        
        console.log('🔄 [DEBUG] Visualizer reset completed successfully');
        
        console.log('🔄 [DEBUG] loadLayoutById completed successfully');
        this.showNotification(`Layout "${layout.name}" loaded successfully!`);
      } catch (error) {
        console.error('🔄 [ERROR] Failed to load layout:', error);
        console.error('🔄 [ERROR] Stack trace:', error.stack);
        this.showNotification('Failed to load layout: ' + error.message, 'error');
      }
    } else {
      console.error('🔄 [ERROR] Layout not found or world not initialized');
      console.error('🔄 [ERROR] Layout exists:', !!layout);
      console.error('🔄 [ERROR] World exists:', !!this.world);
      this.showNotification('Layout not found!', 'error');
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
    
    console.log('🧹 [DEBUG] Starting clearWorld operation...');
    console.log('🧹 [DEBUG] World exists:', !!this.world);
    console.log('🧹 [DEBUG] Visualizer exists:', !!this.visualizer);
    console.log('🧹 [DEBUG] Visualizer running:', this.visualizer?.running);
    
    try {
      // Stop visualizer first to prevent animation issues
      if (this.visualizer && this.visualizer.running) {
        console.log('🧹 [DEBUG] Stopping visualizer...');
        this.visualizer.running = false;
      }
      
      // Use clear method instead of set({}) to properly reset
      console.log('🧹 [DEBUG] Calling world.clear()...');
      this.world.clear();
      this.world.carsNumber = 0;
      console.log('🧹 [DEBUG] World cleared successfully');
      
      // Re-initialize visualizer
      if (this.visualizer) {
        console.log('🧹 [DEBUG] Reinitializing visualizer...');
        
        // Ensure we're in builder mode
        this.visualizer.isBuilderMode = true;
        
        // Clean approach: recreate the visualizer for a fresh state
        this.destroyVisualizer();
        this.initializeVisualizer();
        
        console.log('🧹 [DEBUG] Visualizer reinitialized successfully');
      } else {
        console.log('🧹 [DEBUG] No visualizer to manage');
        // Create a new visualizer if needed
        this.initializeVisualizer();
      }
      
      console.log('🧹 [DEBUG] clearWorld operation completed');
      this.showNotification('World cleared successfully!');
    } catch (error) {
      console.error('🧹 [ERROR] Failed to clear world:', error);
      console.error('🧹 [ERROR] Stack trace:', error.stack);
      this.showNotification('Failed to clear world!', 'error');
      
      // Recovery attempt
      console.log('🧹 [DEBUG] Attempting recovery...');
      this.destroyVisualizer();
      this.initializeVisualizer();
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
          border: 1px solid #404040;
          overflow: hidden;
        }
        
        .visualizer-area canvas {
          width: 100% !important;
          height: 100% !important;
          background: #1a1a1a !important;
          border: 2px solid #404040 !important;
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
        
        /* Modal Dialogs */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-dialog {
          background: #2d2d2d;
          border-radius: 8px;
          border: 1px solid #404040;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .modal-large {
          max-width: 800px;
        }
        
        .modal-header {
          padding: 20px;
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
          background: none;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-body label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-weight: 500;
        }
        
        .modal-body input {
          width: 100%;
          padding: 10px;
          border: 1px solid #404040;
          border-radius: 4px;
          background: #404040;
          color: #ffffff;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .modal-body input:focus {
          outline: none;
          border-color: #007bff;
        }
        
        .modal-body small {
          color: #cccccc;
          font-size: 12px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #404040;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .layout-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .layout-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #404040;
          border-radius: 8px;
          padding: 15px;
          transition: all 0.3s ease;
        }
        
        .layout-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #007bff;
        }
        
        .layout-card h4 {
          margin: 0 0 8px 0;
          color: #ffffff;
          font-size: 16px;
        }
        
        .layout-card small {
          color: #cccccc;
          font-size: 12px;
        }
        
        .layout-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }
        
        .layout-actions .btn {
          flex: 1;
          padding: 8px 16px;
          font-size: 14px;
        }
        
        .notification {
          position: fixed;
          top: 80px;
          right: 20px;
          background: #00bc8c;
          color: white;
          padding: 12px 20px;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          border: 1px solid #009473;
        }
        
        .notification.error {
          background: #e74c3c;
          color: white;
          border: 1px solid #c0392b;
        }
        
        .notification.success {
          background: #00bc8c;
          color: white;
          border: 1px solid #009473;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private showSaveDialog() {
    // Create save dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Save Layout</h3>
          <button class="close-btn" id="close-save-dialog">×</button>
        </div>
        <div class="modal-body">
          <label for="layout-name">Layout Name:</label>
          <input type="text" id="layout-name" placeholder="Enter layout name..." maxlength="50">
          <small>Choose a descriptive name for your road network layout</small>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-save">Cancel</button>
          <button class="btn btn-success" id="confirm-save">Save</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Focus on input
    const nameInput = document.getElementById('layout-name') as HTMLInputElement;
    nameInput.focus();
    
    // Event listeners
    const confirmSave = document.getElementById('confirm-save');
    const cancelSave = document.getElementById('cancel-save');
    const closeSave = document.getElementById('close-save-dialog');
    
    const closeDialog = () => {
      if (dialog && dialog.parentNode) {
        document.body.removeChild(dialog);
      }
    };
    
    confirmSave?.addEventListener('click', () => {
      const layoutName = nameInput.value.trim();
      if (!layoutName) {
        alert('Please enter a layout name');
        return;
      }
      this.saveLayout(layoutName);
      closeDialog();
    });
    
    cancelSave?.addEventListener('click', closeDialog);
    closeSave?.addEventListener('click', closeDialog);
    
    // Close on escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        closeDialog();
      }
    });
  }

  private async showLoadDialog() {
    try {
      // Load all layouts
      const layouts = await appState.storage.loadAllLayouts();
      
      if (layouts.length === 0) {
        alert('No saved layouts found. Create and save a layout first!');
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
            <p>Select a layout to load:</p>
            <div class="layout-grid">
              ${layouts.map(layout => `
                <div class="layout-card" data-layout-id="${layout.id}">
                  <div class="layout-info">
                    <h4>${layout.name}</h4>
                    <small>Created: ${new Date(layout.createdAt).toLocaleString()}</small>
                  </div>
                  <div class="layout-actions">
                    <button class="btn btn-primary load-layout-btn" data-layout-id="${layout.id}">Load</button>
                    <button class="btn btn-danger delete-layout-btn" data-layout-id="${layout.id}">Delete</button>
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
            await this.loadLayoutById(layoutId);
            closeDialog();
          }
        });
      });
      
      // Delete layout buttons
      dialog.querySelectorAll('.delete-layout-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const layoutId = (e.target as HTMLElement).getAttribute('data-layout-id');
          if (layoutId && confirm('Are you sure you want to delete this layout?')) {
            await this.deleteLayoutById(layoutId);
            // Refresh the dialog
            closeDialog();
            this.showLoadDialog();
          }
        });
      });
      
      cancelLoad?.addEventListener('click', closeDialog);
      closeLoad?.addEventListener('click', closeDialog);
      
      // Close on escape
      const escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDialog();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      // Close on backdrop click
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          closeDialog();
        }
      });
      
    } catch (error) {
      console.error('Failed to load layouts:', error);
      alert('Failed to load layouts');
    }
  }

  destroy() {
    console.log('🧹 Builder: Destroying page and cleaning up canvas...');
    
    if (this.visualizer) {
      if (this.visualizer.destroy) {
        this.visualizer.destroy();
      } else {
        this.visualizer.stop();
      }
      this.visualizer = null;
    }
    
    if (this.world) {
      this.world = null;
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
