/**
 * Simple router for single-page application
 */
export class Router {
  private routes: { [key: string]: () => void } = {};
  private currentRoute: string = '/';

  constructor() {
    this.init();
  }

  addRoute(path: string, handler: () => void) {
    this.routes[path] = handler;
  }

  navigate(path: string) {
    console.log(`Router attempting to navigate to: ${path}`);
    if (this.routes[path]) {
      console.log(`Route handler found for ${path}, updating state and history`);
      this.currentRoute = path;
      window.history.pushState({ path }, '', path);
      try {
        this.routes[path]();
        console.log(`Successfully navigated to ${path}`);
      } catch (error) {
        console.error(`Error executing route handler for ${path}:`, error);
      }
    } else {
      console.warn(`No route handler registered for path: ${path}`);
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  private init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const path = event.state?.path || '/';
      if (this.routes[path]) {
        this.currentRoute = path;
        this.routes[path]();
      }
    });

    // Handle initial route - always start at home
    const path = window.location.pathname;
    this.currentRoute = '/'; // Always start at home page
    
    // If user directly navigates to a specific page, redirect to home
    if (path !== '/') {
      window.history.replaceState({ path: '/' }, '', '/');
    }
  }

  start() {
    if (this.routes[this.currentRoute]) {
      this.routes[this.currentRoute]();
    }
  }
}
