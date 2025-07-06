/**
 * Simple router for single-page application
 */
export class Router {
  private routes: { [key: string]: () => void } = {};
  private currentRoute: string = '/builder';

  constructor() {
    this.init();
  }

  addRoute(path: string, handler: () => void) {
    this.routes[path] = handler;
  }

  navigate(path: string) {
    if (this.routes[path]) {
      this.currentRoute = path;
      window.history.pushState({ path }, '', path);
      this.routes[path]();
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  private init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const path = event.state?.path || '/builder';
      if (this.routes[path]) {
        this.currentRoute = path;
        this.routes[path]();
      }
    });

    // Handle initial route
    const path = window.location.pathname;
    this.currentRoute = this.routes[path] ? path : '/builder';
  }

  start() {
    if (this.routes[this.currentRoute]) {
      this.routes[this.currentRoute]();
    }
  }
}
