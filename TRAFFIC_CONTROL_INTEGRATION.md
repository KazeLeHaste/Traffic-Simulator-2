# Traffic Control Strategy System - Integration Guide

This document provides instructions for integrating the new modular traffic control strategy system into the existing road traffic simulator.

## Overview

The new traffic control system provides a flexible, modular approach to controlling traffic signals at intersections. Key features include:

- Multiple traffic control strategies (Fixed Timing, Adaptive, All-Red Flashing)
- Extensible design for adding new strategies
- Configuration options for fine-tuning each strategy
- Backward compatibility with existing code
- UI components for selecting and configuring strategies

## Integration Steps

### Step 1: Register the TrafficControlStrategyManager

Add the following import to your main application file (app.ts or main.ts):

```typescript
import { trafficControlStrategyManager } from './model/traffic-control/TrafficControlStrategyManager';
```

This imports the singleton manager instance that's already initialized with available strategies.

### Step 2: Update Intersection Class

Option A - Direct modification:
1. Replace the current ControlSignals import in intersection.ts with:

```typescript
import { IntersectionTrafficControlAdapter as ControlSignals } from './traffic-control/IntersectionTrafficControlAdapter';
```

2. Update the Intersection.copy method to use the adapter:

```typescript
static copy(intersection: any): Intersection {
  // ...existing code...
  
  // Update this section
  if (intersection.controlSignals) {
    result.controlSignals = ControlSignals.create(intersection.controlSignals, result);
  } else {
    result.controlSignals = new ControlSignals(result);
  }
  
  // ...existing code...
}
```

Option B - Use IntersectionWithStrategies:
1. Replace imports of Intersection with IntersectionWithStrategies where enhanced functionality is needed.

### Step 3: Add the Traffic Control Panel to the UI

1. Add a container for the panel in your HTML:

```html
<div id="traffic-control-panel" class="panel"></div>
```

2. Initialize the panel in your simulation page component:

```typescript
import { TrafficControlPanel } from '../components/TrafficControlPanel';

// In your initialization code
const trafficControlPanel = new TrafficControlPanel('traffic-control-panel');

// When an intersection is selected
trafficControlPanel.setSelectedIntersection(selectedIntersection);
```

### Step 4: Add CSS Styles

Add these styles to your CSS file:

```css
.traffic-control-panel {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.traffic-control-panel h3 {
  margin-top: 0;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.strategy-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strategy-config-form button {
  margin-top: 10px;
}
```

## Creating New Strategies

To add a new traffic control strategy:

1. Create a new class that extends AbstractTrafficControlStrategy
2. Implement the required methods and properties
3. Register the strategy with the manager:

```typescript
import { MyNewStrategy } from './MyNewStrategy';
trafficControlStrategyManager.registerStrategy('my-new-strategy', MyNewStrategy);
```

## Example: Creating an Actuated Strategy

Here's a skeleton for an actuated control strategy:

```typescript
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';
import Intersection = require('../intersection');
import { TrafficState } from './ITrafficControlStrategy';

export class ActuatedTimingStrategy extends AbstractTrafficControlStrategy {
  readonly strategyType: string = 'actuated-timing';
  readonly displayName: string = 'Actuated Timing';
  readonly description: string = 'Extends green phases when vehicles are detected';
  
  // Vehicle detection thresholds
  private minGreenTime: number = 10;
  private maxGreenTime: number = 60;
  private extensionTime: number = 3;
  
  constructor() {
    super();
    this.configOptions = {
      minGreenTime: this.minGreenTime,
      maxGreenTime: this.maxGreenTime,
      extensionTime: this.extensionTime
    };
  }
  
  protected shouldSwitchPhase(trafficStates?: TrafficState[]): boolean {
    // Minimum green time logic
    if (this.timeInPhase < this.minGreenTime) {
      return false;
    }
    
    // Maximum green time logic
    if (this.timeInPhase >= this.maxGreenTime) {
      return true;
    }
    
    // Check if we have vehicles that would benefit from extension
    if (trafficStates && this.hasActiveTraffic(trafficStates)) {
      this.nextPhaseChangeTime = this.timeInPhase + this.extensionTime;
      return false;
    }
    
    return super.shouldSwitchPhase(trafficStates);
  }
  
  private hasActiveTraffic(trafficStates: TrafficState[]): boolean {
    // Implementation to detect if traffic is actively moving through
    // the intersection in the current phase
    return false; // Placeholder
  }
  
  protected getCurrentSignalStates(): number[][] {
    // Implementation similar to other strategies
    return []; // Placeholder
  }
}
```

## Testing and Validation

To test the new traffic control system:

1. Run the simulation
2. Select an intersection
3. Use the Traffic Control Panel to switch between strategies
4. Observe the effect on traffic flow
5. Adjust configuration parameters to see their impact

## Troubleshooting

- If traffic signals don't appear to be changing, check that the adapter is correctly integrated
- If strategy selection doesn't work, verify the TrafficControlPanel is properly initialized
- For error "Cannot find module './traffic-control/TrafficControlController'", check the import paths

## Demo Example

```typescript
// Example of switching all intersections to adaptive timing
function switchAllIntersectionsToAdaptive(world) {
  const intersections = world.intersections.all();
  for (const id in intersections) {
    const intersection = intersections[id];
    if ((intersection as any).setTrafficControlStrategy) {
      (intersection as any).setTrafficControlStrategy('adaptive-timing');
    }
  }
}
```
