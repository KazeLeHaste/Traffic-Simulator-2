import { Router } from '../core/Router';
import { appState } from '../core/AppState';

/**
 * Home page - landing page for the traffic simulator
 */
export class HomePage {
  private container: HTMLElement;
  private router: Router;
  private recentLayouts: any[] = [];

  constructor(container: HTMLElement, router: Router) {
    this.container = container;
    this.router = router;
    this.init();
  }

  private async init() {
    console.log('🏠 [HOME] Initializing home page');
    
    // Ensure container is empty
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Load recent layouts to display on homepage
    try {
      this.recentLayouts = await appState.storage.loadAllLayouts();
      // Sort by last modified date
      this.recentLayouts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA; // Sort descending (newest first)
      });
      // Take only the most recent 3
      this.recentLayouts = this.recentLayouts.slice(0, 3);
      console.log(`🏠 [HOME] Loaded ${this.recentLayouts.length} recent layouts`);
    } catch (error) {
      console.error('Failed to load recent layouts:', error);
      this.recentLayouts = [];
    }
    
    console.log('🏠 [HOME] Rendering home page content');
    this.render();
    
    // Use setTimeout to ensure DOM is fully rendered before attaching events
    setTimeout(() => {
      console.log('🏠 [HOME] Setting up event listeners');
      this.addEventListeners();
    }, 100);
  }
  
  private addEventListeners() {
    console.log('Adding event listeners to home page buttons');
    
    // Navigation buttons
    const builderBtn = document.getElementById('go-to-builder');
    if (builderBtn) {
      console.log('Found builder button, attaching click event');
      builderBtn.addEventListener('click', () => {
        console.log('Builder button clicked, navigating...');
        this.router.navigate('/builder');
      });
    } else {
      console.warn('Builder button not found in the DOM');
    }
    
    const simulationBtn = document.getElementById('go-to-simulation');
    if (simulationBtn) {
      console.log('Found simulation button, attaching click event');
      simulationBtn.addEventListener('click', () => {
        console.log('Simulation button clicked, navigating...');
        this.router.navigate('/simulation');
      });
    } else {
      console.warn('Simulation button not found in the DOM');
    }
    
    // Recent layout buttons
    const layoutButtons = document.querySelectorAll('[data-action="load-layout"]');
    console.log(`Found ${layoutButtons.length} layout buttons`);
    
    layoutButtons.forEach(btn => {
      const layoutId = btn.getAttribute('data-layout-id');
      const target = btn.getAttribute('data-target');
      console.log(`Adding event listener to button for layout ${layoutId} with target ${target}`);
      
      btn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any default behavior
        const clickedBtn = e.currentTarget as HTMLElement;
        const layoutId = clickedBtn.getAttribute('data-layout-id');
        const target = clickedBtn.getAttribute('data-target');
        
        if (layoutId && target) {
          console.log(`Layout button clicked! Loading layout ${layoutId} and navigating to ${target}`);
          // Store the layout ID to be loaded
          appState.selectedLayoutId = layoutId;
          // Navigate to the appropriate page after a brief delay to allow console log to appear
          setTimeout(() => {
            this.router.navigate(`/${target}`);
          }, 100);
        } else {
          console.error('Missing layout ID or target in clicked button:', clickedBtn);
        }
      });
    });
  }

  private render() {
    this.container.innerHTML = `
      <div class="home-page" id="home-page-content">
        <div class="hero-section">
          <div class="hero-content">
            <h1>Road Traffic Simulator</h1>
            <p class="hero-subtitle">Design, build, and simulate traffic flow through custom road networks</p>
            
            <div class="feature-cards">
              <div class="feature-card">
                <div class="feature-icon">🏗️</div>
                <h3>Network Builder</h3>
                <p>Create custom road networks with intersections, lanes, and traffic signals</p>
                <button class="btn btn-primary" id="go-to-builder">
                  Start Building
                </button>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">🚗</div>
                <h3>Traffic Simulation</h3>
                <p>Run realistic traffic simulations on your custom road networks</p>
                <button class="btn btn-secondary" id="go-to-simulation">
                  View Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Layouts Section -->
        <div class="recent-section">
          <div class="section-content">
            <h2>Recent Layouts</h2>
            
            <div class="recent-layouts">
              ${this.recentLayouts.length > 0 ? 
                this.recentLayouts.map(layout => `
                  <div class="layout-card">
                    <div class="layout-info">
                      <h4>${layout.name || 'Unnamed Layout'}</h4>
                      <p>Last modified: ${new Date(layout.updatedAt || layout.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="layout-actions">
                      <button class="btn btn-primary btn-sm" data-action="load-layout" data-layout-id="${layout.id}" data-target="builder">
                        🏗️ Edit
                      </button>
                      <button class="btn btn-secondary btn-sm" data-action="load-layout" data-layout-id="${layout.id}" data-target="simulation">
                        🚗 Simulate
                      </button>
                    </div>
                  </div>
                `).join('') 
                : 
                `<div class="empty-state">
                  <div class="empty-icon">📄</div>
                  <p>No layouts found</p>
                  <small>Head to the Builder to create your first layout!</small>
                </div>`
              }
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="section-content">
            <h2>How to Use</h2>
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Design Your Network</h4>
                  <p>Use the Builder to create intersections (Shift+Click) and connect them with roads (Shift+Drag)</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Save Your Layout</h4>
                  <p>Save your road network designs to load them later or share with others</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Run Simulations</h4>
                  <p>Switch to Simulation mode to see how traffic flows through your network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="features-section">
          <div class="section-content">
            <h2>Key Features</h2>
            <div class="features-grid">
              <div class="feature">
                <div class="feature-icon">🔄</div>
                <h4>Real-time Simulation</h4>
                <p>Watch vehicles navigate through your road network in real-time</p>
              </div>
              
              <div class="feature">
                <div class="feature-icon">📊</div>
                <h4>Traffic Analytics</h4>
                <p>Track vehicle counts, speeds, and other traffic metrics</p>
              </div>
              
              <div class="feature">
                <div class="feature-icon">💾</div>
                <h4>Save & Load</h4>
                <p>Store your designs and continue working on them later</p>
              </div>
              
              <div class="feature">
                <div class="feature-icon">🔍</div>
                <h4>Detailed View</h4>
                <p>Zoom and pan to examine any part of your network</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #ffffff;
          overflow-y: auto;
          position: relative;
          z-index: 5;
        }
        
        .hero-section {
          padding: 60px 40px;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .hero-content h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #375a7f, #00bc8c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .recent-section, .info-section, .features-section {
          padding: 50px 40px;
        }
        
        .info-section {
          background: rgba(0, 0, 0, 0.2);
        }
        
        .features-section {
          background: rgba(0, 0, 0, 0.3);
        }
        
        .section-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .section-content h2 {
          font-size: 2rem;
          margin-bottom: 30px;
          text-align: center;
          position: relative;
        }
        
        .section-content h2::after {
          content: '';
          display: block;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #375a7f, #00bc8c);
          margin: 15px auto 0;
        }
        
        /* Recent Layouts */
        .recent-layouts {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }
        
        .layout-card {
          width: 300px;
          background: rgba(45, 45, 45, 0.8);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          border: 1px solid #404040;
          padding: 20px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .layout-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
        }
        
        .layout-info h4 {
          margin: 0 0 10px 0;
          font-size: 1.2rem;
          color: #ffffff;
        }
        
        .layout-info p {
          margin: 0 0 15px 0;
          color: #b0b0b0;
          font-size: 0.9rem;
        }
        
        .layout-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          background: rgba(45, 45, 45, 0.8);
          border-radius: 8px;
          border: 1px dashed #404040;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          opacity: 0.6;
        }
        
        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
        
        .feature {
          background: rgba(45, 45, 45, 0.8);
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          transition: transform 0.3s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .feature:hover {
          transform: translateY(-5px);
        }
        
        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 20px;
        }
        
        .feature h4 {
          margin: 0 0 15px 0;
          color: #ffffff;
        }
        
        .feature p {
          margin: 0;
          color: #b0b0b0;
        }
        
        /* Media Queries */
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
          
          .feature-cards {
            flex-direction: column;
          }
          
          .feature-card {
            margin-bottom: 20px;
          }
          
          .steps {
            flex-direction: column;
          }
          
          .step {
            margin-bottom: 30px;
          }
          
          .recent-section, .info-section, .features-section {
            padding: 40px 20px;
          }
        }
        
        .hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 40px;
          color: #cccccc;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .feature-cards {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 40px;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 30px;
          max-width: 300px;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        
        .feature-card h3 {
          margin-bottom: 15px;
          color: #ffffff;
        }
        
        .feature-card p {
          color: #cccccc;
          margin-bottom: 25px;
          line-height: 1.5;
        }
        
        .info-section {
          padding: 60px 40px;
          background: rgba(0, 0, 0, 0.2);
        }
        
        .info-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .info-content h2 {
          text-align: center;
          margin-bottom: 40px;
          font-size: 2.5rem;
          color: #ffffff;
        }
        
        .steps {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .step {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .step-number {
          background: #375a7f;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        
        .step-content h4 {
          margin: 0 0 10px 0;
          color: #ffffff;
        }
        
        .step-content p {
          margin: 0;
          color: #cccccc;
          line-height: 1.5;
        }
        
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          min-width: 150px;
          position: relative;
          z-index: 10;
          pointer-events: auto;
          font-weight: 500;
        }
        
        .btn:active {
          transform: translateY(1px);
          opacity: 0.9;
        }
        
        .btn-primary {
          background: linear-gradient(45deg, #375a7f, #4a6fa5);
          color: white;
        }
        
        .btn-primary:hover {
          background: linear-gradient(45deg, #4a6fa5, #375a7f);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(55, 90, 127, 0.4);
        }
        
        .btn-secondary {
          background: linear-gradient(45deg, #00bc8c, #00d4aa);
          color: white;
        }
        
        .btn-secondary:hover {
          background: linear-gradient(45deg, #00d4aa, #00bc8c);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 188, 140, 0.4);
        }
        
        /* Make buttons more clickable */
        .btn-sm {
          padding: 8px 16px;
          font-size: 0.9rem;
          min-width: 100px;
        }
        
        /* Ensure buttons are fully clickable */
        #go-to-builder, #go-to-simulation {
          position: relative;
          z-index: 100;
        }
        
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
          
          .feature-cards {
            flex-direction: column;
            align-items: center;
          }
          
          .hero-section,
          .info-section {
            padding: 40px 20px;
          }
        }
      </style>
    `;
  }
}
