import '../helpers';

interface Poolable {
  id: string;
  release?(): void;
}

interface PoolableFactory<T extends Poolable> {
  copy(obj: any): T;
}

class Pool<T extends Poolable> {
  public factory: PoolableFactory<T>;
  public objects: { [key: string]: T };

  constructor(factory: PoolableFactory<T>, pool?: any) {
    this.factory = factory;
    this.objects = {};
    
    if (pool && pool.objects) {
      for (const k in pool.objects) {
        const v = pool.objects[k];
        this.objects[k] = this.factory.copy(v);
      }
    }
  }

  toJSON(): { [key: string]: T } {
    return this.objects;
  }

  get(id: string): T {
    return this.objects[id];
  }

  put(obj: T): void {
    this.objects[obj.id] = obj;
  }

  pop(obj: T | string): T {
    const id = typeof obj === 'string' ? obj : obj.id;
    const result = this.objects[id];
    if (result) {
      if (result.release) {
        result.release();
      }
      delete this.objects[id];
    }
    return result;
  }

  all(): { [key: string]: T } {
    return this.objects;
  }

  clear(): void {
    this.objects = {};
  }

  get length(): number {
    return Object.keys(this.objects).length;
  }
}

export = Pool;
