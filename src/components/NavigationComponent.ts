import { Router } from '../core/Router';

/**
 * Navigation bar component for switching between builder and simulation
 */
export class NavigationComponent {
  private container: HTMLElement;
  private router: Router;

  constructor(container: HTMLElement, router: Router) {
    this.container = container;
    this.router = router;
    this.render();
  }

  private render() {
    console.log('🧭 [NAV] Rendering navigation bar');
    
    // Ensure container is empty before rendering
    this.container.innerHTML = '';
    
    this.container.innerHTML = `
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <h1>Traffic Simulator</h1>
          </div>
          
          <div class="nav-links">
            <a href="/" class="nav-link" data-route="/">
              🏠 Home
            </a>
            
            <a href="/builder" class="nav-link" data-route="/builder">
              🏗️ Builder
            </a>
            
            <a href="/simulation" class="nav-link" data-route="/simulation">
              🚦 Simulation
            </a>
            
            <a href="/analytics" class="nav-link" data-route="/analytics">
              📊 Analytics
            </a>
          </div>
        </div>
      </nav>
    `;

    // Add click handlers
    this.container.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = (e.target as HTMLElement).getAttribute('data-route') || '/';
        this.router.navigate(route);
        this.updateActiveLink(route);
      });
    });

    // Set initial active state
    this.updateActiveLink(this.router.getCurrentRoute());

    // Add styles
    this.addStyles();
  }

  private updateActiveLink(currentRoute: string) {
    this.container.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = this.container.querySelector(`[data-route="${currentRoute}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  private addStyles() {
    if (!document.getElementById('navbar-styles')) {
      const style = document.createElement('style');
      style.id = 'navbar-styles';
      style.textContent = `
        .navbar {
          background: #2d2d2d;
          color: white;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 1000;
          border-bottom: 1px solid #404040;
        }
        
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 60px;
        }
        
        .nav-brand h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffffff;
        }
        
        .nav-links {
          display: flex;
          gap: 20px;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .nav-link:hover {
          background: #404040;
          color: white;
          transform: translateY(-1px);
        }
        
        .nav-link.active {
          background: #007bff;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 15px;
          }
          
          .nav-brand h1 {
            font-size: 1.2rem;
          }
          
          .nav-links {
            gap: 10px;
          }
          
          .nav-link {
            padding: 8px 15px;
            font-size: 0.9rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
