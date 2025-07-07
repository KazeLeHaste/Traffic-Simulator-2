// Common interfaces to resolve circular dependencies
export interface Car {
  id: string;
  length: number;
  speed: number;
  alive: boolean;
  nextLane?: any;
  popNextLane?(): any;
  pickNextLane?(): any;
}

export interface NextCarDistance {
  car: Car | null;
  distance: number;
}
