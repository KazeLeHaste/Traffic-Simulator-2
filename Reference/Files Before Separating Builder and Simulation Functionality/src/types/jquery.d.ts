declare module 'jquery' {
  interface JQuery<TElement = HTMLElement> {
    append(content: any): JQuery<TElement>;
    on(event: string, handler: (event: JQueryEventObject) => any): JQuery<TElement>;
    off(event: string, handler?: (event: JQueryEventObject) => any): JQuery<TElement>;
    attr(name: string): string | undefined;
    attr(name: string, value: string | number): JQuery<TElement>;
    attr(attributes: Record<string, string | number>): JQuery<TElement>;
    width(): number | undefined;
    height(): number | undefined;
  }
  
  interface JQueryStatic {
    (selector: string): JQuery<HTMLElement>;
    (element: Element | Document): JQuery<HTMLElement>;
    (window: Window): JQuery<Window>;
    (callback: () => void): void;
    <T extends Element>(html: string, props?: any): JQuery<T>;
  }

  interface JQueryEventObject {
    pageX: number;
    pageY: number;
    preventDefault(): void;
    deltaY?: number;
    deltaFactor?: number;
  }
  
  const $: JQueryStatic;
  export = $;
}
