declare module 'chai' {
  interface Assertion {
    to: Assertion;
    be: Assertion;
    equal(value: any): void;
    deep: Assertion;
    null: void;
    not: Assertion;
  }

  interface Expect {
    (value: any): Assertion;
  }

  export const expect: Expect;
}
