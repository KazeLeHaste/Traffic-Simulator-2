# Fixed Timing Traffic Light Strategy

This module implements a fixed timing strategy for traffic lights in the traffic simulator. The strategy operates traffic lights on a fixed schedule, switching at predetermined intervals regardless of real-time traffic conditions.

## Features

- **Fixed Duration Cycles**: Consistent, predictable traffic signal timing for all approaches
- **Configurable Phase Durations**: Adjust base timing and variation percentages
- **T-Junction Support**: Automatically adapts to different intersection types
- **Timing Verification**: Built-in logging and statistics for timing accuracy validation
- **Random Offset**: Slight variation between intersections to prevent synchronization

## Usage

### Basic Usage

```typescript
import { FixedTimingStrategy } from './model/traffic-control/FixedTimingStrategy';
import Intersection from './model/intersection';

// Create the strategy
const strategy = new FixedTimingStrategy();

// Initialize it with an intersection
strategy.initialize(intersection);

// In the simulation loop:
const signalStates = strategy.update(deltaTime);
```

### Configuration

```typescript
// Get the current configuration
const config = strategy.getConfigOptions();

// Update configuration
strategy.updateConfig({
  baseDuration: 5,           // Phase duration in seconds
  variationPercentage: 5,    // Variation to prevent synchronization (0-100%)
  enableLogging: true,       // Enable timing logs
  logToConsole: true         // Output logs to console
});
```

### Timing Verification

```typescript
// Enable detailed logging
strategy.setLogging(true);

// After running for some time, get statistics:
const stats = strategy.getTimingStatistics();
console.log(`Average deviation: ${stats.averageDeviation.toFixed(2)}s`);
console.log(`Maximum deviation: ${stats.maxDeviation.toFixed(2)}s`);

// Reset timing statistics
strategy.resetTimingStatistics();
```

## Testing

The fixed timing strategy includes comprehensive tests to verify its timing accuracy and correct operation. To run the tests:

1. Start the traffic simulator application
2. Open the browser console (F12)
3. Run the tests with: `trafficControlTests.runFixedTimingTests()`

The test suite verifies:
- Proper initialization
- Phase transitions
- Timing accuracy
- Configuration changes
- Serialization/deserialization

## Signal States

The strategy cycles through the following signal phases:

1. North & South left turns
2. North & South forward and right turns
3. East & West left turns
4. East & West forward and right turns

For 2-way or T-intersections, a simplified single phase is used that allows all movements.

## Implementation Details

- The strategy extends `AbstractTrafficControlStrategy` and implements the `ITrafficControlStrategy` interface
- Timing is determined by a base duration plus a small random variation
- Phase changes occur when the elapsed time exceeds the target duration
- Detailed timing statistics are maintained for verification
