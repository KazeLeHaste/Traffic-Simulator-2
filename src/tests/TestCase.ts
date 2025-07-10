/**
 * Base class for test cases in Road Traffic Simulator
 * 
 * Provides assertion methods and test lifecycle hooks
 */
export class TestCase {
  /**
   * Set up the test environment before each test method
   */
  setUp(): void {
    // Default implementation does nothing
  }
  
  /**
   * Clean up the test environment after each test method
   */
  tearDown(): void {
    // Default implementation does nothing
  }
  
  /**
   * Assert that a condition is true
   */
  assertTrue(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Assertion failed: expected true but got false');
    }
  }
  
  /**
   * Assert that a condition is false
   */
  assertFalse(condition: boolean, message?: string): void {
    if (condition) {
      throw new Error(message || 'Assertion failed: expected false but got true');
    }
  }
  
  /**
   * Assert that two values are equal
   */
  assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Assertion failed: expected ${expected} but got ${actual}`);
    }
  }
  
  /**
   * Assert that two values are not equal
   */
  assertNotEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual === expected) {
      throw new Error(message || `Assertion failed: expected different value than ${expected}`);
    }
  }
  
  /**
   * Assert that a value is null
   */
  assertNull(value: any, message?: string): void {
    if (value !== null) {
      throw new Error(message || `Assertion failed: expected null but got ${value}`);
    }
  }
  
  /**
   * Assert that a value is not null
   */
  assertNotNull(value: any, message?: string): void {
    if (value === null) {
      throw new Error(message || 'Assertion failed: expected non-null value but got null');
    }
  }
  
  /**
   * Assert that a value is undefined
   */
  assertUndefined(value: any, message?: string): void {
    if (value !== undefined) {
      throw new Error(message || `Assertion failed: expected undefined but got ${value}`);
    }
  }
  
  /**
   * Assert that a value is not undefined
   */
  assertDefined(value: any, message?: string): void {
    if (value === undefined) {
      throw new Error(message || 'Assertion failed: expected defined value but got undefined');
    }
  }
  
  /**
   * Assert that an array contains an item
   */
  assertContains<T>(array: T[], item: T, message?: string): void {
    if (array.indexOf(item) === -1) {
      throw new Error(message || `Assertion failed: array does not contain ${item}`);
    }
  }
  
  /**
   * Assert that an array does not contain an item
   */
  assertNotContains<T>(array: T[], item: T, message?: string): void {
    if (array.indexOf(item) !== -1) {
      throw new Error(message || `Assertion failed: array should not contain ${item}`);
    }
  }
  
  /**
   * Assert that a string contains a substring
   */
  assertStringContains(str: string, substring: string, message?: string): void {
    if (str.indexOf(substring) === -1) {
      throw new Error(message || `Assertion failed: "${str}" does not contain "${substring}"`);
    }
  }
  
  /**
   * Assert that a string does not contain a substring
   */
  assertStringNotContains(str: string, substring: string, message?: string): void {
    if (str.indexOf(substring) !== -1) {
      throw new Error(message || `Assertion failed: "${str}" should not contain "${substring}"`);
    }
  }
  
  /**
   * Assert that a value is approximately equal to another value within a tolerance
   */
  assertApproximateEqual(actual: number, expected: number, tolerance: number = 0.001, message?: string): void {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(message || `Assertion failed: ${actual} is not approximately equal to ${expected} within tolerance ${tolerance}`);
    }
  }
  
  /**
   * Assert that a function throws an error
   */
  assertThrows(fn: Function, expectedErrorType?: any, message?: string): void {
    try {
      fn();
      throw new Error(message || 'Assertion failed: function did not throw an error');
    } catch (error) {
      if (expectedErrorType && !(error instanceof expectedErrorType)) {
        throw new Error(message || `Assertion failed: function threw ${error} which is not an instance of ${expectedErrorType}`);
      }
    }
  }
  
  /**
   * Assert that a function does not throw an error
   */
  assertDoesNotThrow(fn: Function, message?: string): void {
    try {
      fn();
    } catch (error) {
      throw new Error(message || `Assertion failed: function threw unexpected error: ${error}`);
    }
  }
  
  /**
   * Skip a test with a message
   */
  skip(message?: string): void {
    throw new SkipTestError(message || 'Test skipped');
  }
}

/**
 * Custom error class for skipped tests
 */
class SkipTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkipTestError';
  }
}
