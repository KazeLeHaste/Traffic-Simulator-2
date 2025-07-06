declare module 'underscore' {
  interface UnderscoreStatic {
    uniqueId(prefix?: string): string;
    extend<T, U>(destination: T, ...sources: U[]): T & U;
    sample<T>(list: T[]): T;
    sample<T>(obj: { [key: string]: T }): T;
    random(min: number, max: number): number;
    map<T, TResult>(list: T[], iteratee: (value: T) => TResult): TResult[];
    map<T, TResult>(obj: { [key: string]: T }, iteratee: (value: T) => TResult): TResult[];
    reduce<T, TResult>(list: T[], iteratee: (memo: TResult, value: T) => TResult, memo?: TResult): TResult;
    filter<T>(list: T[], predicate: (value: T) => boolean): T[];
  }
  
  const _: UnderscoreStatic;
  export = _;
}
