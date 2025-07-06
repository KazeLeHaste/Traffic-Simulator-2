declare module 'dat-gui' {
  interface GUIController {
    min(min: number): GUIController;
    max(max: number): GUIController;
    step(step: number): GUIController;
    listen(): GUIController;
  }

  interface GUI {
    add(object: any, property: string, min?: number, max?: number, step?: number): GUIController;
    addFolder(name: string): GUI;
    open(): void;
  }

  export class GUI {
    constructor();
    add(object: any, property: string, min?: number, max?: number, step?: number): GUIController;
    addFolder(name: string): GUI;
    open(): void;
  }
}
