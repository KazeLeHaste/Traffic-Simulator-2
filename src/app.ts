// New modernized Road Traffic Simulator with separation of concerns
import './helpers';
import '../css/style.css';
import '../css/dat-gui.css';
import $ = require('jquery');
import 'jquery-mousewheel';

// Import the new architecture components
import { appState } from './core/AppState';
import { Router } from './core/Router';
import { NavigationComponent } from './components/NavigationComponent';
import { BuilderPageComponent } from './pages/BuilderPageComponent';
import { SimulationPageComponent } from './pages/SimulationPageComponent';

// Initialize the modernized application
$(() => {
  console.log('🚀 Road Traffic Simulator starting with new architecture...');
  
  // Wait for DOM to be ready
  setTimeout(() => {
    // Create main application container
    const appContainer = $('<div id="app-container"></div>');
    $(document.body).append(appContainer);
    
    // Create navigation container
    const navContainer = $('<div id="nav-container"></div>')[0];
    appContainer.append(navContainer);
    
    // Create main content area
    const mainContent = $('<div id="main-content"></div>')[0];
    appContainer.append(mainContent);
    
    // Initialize router
    const router = new Router();
    
    // Initialize navigation component
    const navigation = new NavigationComponent(navContainer, router);
    
    // Initialize page components (lazy loading)
    let builderPage: BuilderPageComponent | null = null;
    let simulationPage: SimulationPageComponent | null = null;
    
    // Add routes
    router.addRoute('/builder', () => {
      console.log('📐 Navigating to Builder page');
      
      // Properly destroy any existing pages
      if (simulationPage) {
        simulationPage.destroy();
        simulationPage = null;
      }
      if (builderPage) {
        builderPage.destroy();
        builderPage = null;
      }
      
      // Clear content and create fresh builder page
      mainContent.innerHTML = '';
      builderPage = new BuilderPageComponent(mainContent);
    });
    
    router.addRoute('/simulation', () => {
      console.log('🏃 Navigating to Simulation page');
      
      // Properly destroy any existing pages
      if (builderPage) {
        builderPage.destroy();
        builderPage = null;
      }
      if (simulationPage) {
        simulationPage.destroy();
        simulationPage = null;
      }
      
      // Clear content and create fresh simulation page
      mainContent.innerHTML = '';
      simulationPage = new SimulationPageComponent(mainContent);
    });
    
    // Start the router (which will trigger the initial route)
    router.start();
    
    console.log('🚀 Modern application ready');
    console.log('📐 Builder mode: Create and edit road layouts');
    console.log('🏃 Simulation mode: Run traffic simulations on saved layouts');
    
    // Expose useful debugging functions
    (window as any).appState = appState;
    (window as any).router = router;
    (window as any).getBuilderPage = () => builderPage;
    (window as any).getSimulationPage = () => simulationPage;
    
    // Navigation helper functions for debugging
    (window as any).goToBuilder = () => router.navigate('/builder');
    (window as any).goToSimulation = () => router.navigate('/simulation');
    
    console.log('🛠️ Debug functions available: appState, router, getBuilderPage(), getSimulationPage(), goToBuilder(), goToSimulation()');
    
  }, 10);
});
