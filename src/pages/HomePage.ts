import { Router } from '../core/Router';

/**
 * Home page - landing page for the traffic simulator
 */
export class HomePage {
  private container: HTMLElement;
  private router: Router;

  constructor(container: HTMLElement, router: Router) {
    this.container = container;
    this.router = router;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="home-page">
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
        
        <div class="info-section">
          <div class="info-content">
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
      </div>
      
      <style>
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #ffffff;
          overflow-y: auto;
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
    
    this.addEventListeners();
  }
  
  private addEventListeners() {
    const builderBtn = document.getElementById('go-to-builder');
    const simulationBtn = document.getElementById('go-to-simulation');
    
    if (builderBtn) {
      builderBtn.addEventListener('click', () => {
        this.router.navigate('builder');
      });
    }
    
    if (simulationBtn) {
      simulationBtn.addEventListener('click', () => {
        this.router.navigate('simulation');
      });
    }
  }
}
