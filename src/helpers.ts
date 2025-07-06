// TypeScript equivalent of CoffeeScript property decorator functionality

export {};

declare global {
  interface Function {
    property(prop: string, desc: PropertyDescriptor): void;
  }
}

Function.prototype.property = function(prop: string, desc: PropertyDescriptor) {
  Object.defineProperty(this.prototype, prop, desc);
};
