# Road Traffic Simulator - Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Codebase Structure](#codebase-structure)
3. [Core Components](#core-components)
4. [Traffic Control Strategy Implementation](#traffic-control-strategy-implementation)
5. [KPI Collection System](#kpi-collection-system)
6. [Storage and Persistence](#storage-and-persistence)
7. [Visualization Components](#visualization-components)
8. [Testing Framework](#testing-framework)
9. [Build and Deployment](#build-and-deployment)
10. [Extending the System](#extending-the-system)

## Architecture Overview

The Road Traffic Simulator is built using TypeScript and follows a component-based architecture with clear separation of concerns. The system is organized into several key modules:

- **Core Simulation Engine**: Handles the physics and logic of vehicle movement and interaction
- **Model Layer**: Contains the data structures and domain objects
- **Visualization Layer**: Renders the simulation to the screen
- **Control Layer**: Manages user input and application state
- **Storage Layer**: Handles persistence and data management
- **Analytics Layer**: Tracks and analyzes performance metrics

The application follows these design patterns:
- **MVC Pattern**: Separating model, view, and controller concerns
- **Strategy Pattern**: For interchangeable traffic control algorithms
- **Observer Pattern**: For event-driven updates and communication
- **Factory Pattern**: For creating various simulation objects
- **Adapter Pattern**: For connecting different system components
- **Singleton Pattern**: For global managers and services

## Codebase Structure

```
RoadTrafficSimulator/
├── css/                  # Styling and themes
├── docs/                 # Documentation
├── images/               # Assets and icons
├── src/                  # Source code
│   ├── app.ts            # Application entry point
│   ├── helpers.ts        # Utility functions
│   ├── interfaces.ts     # Type definitions and interfaces
│   ├── main.ts           # Main initialization
│   ├── runner.ts         # Simulation runner
│   ├── settings.ts       # Global settings
│   ├── test-runner.ts    # Test execution
│   ├── components/       # UI components
│   ├── core/             # Core application logic
│   ├── geom/             # Geometry utilities
│   ├── lib/              # External libraries and services
│   │   └── storage/      # Storage implementations
│   ├── model/            # Domain objects
│   │   ├── traffic-control/ # Traffic control strategies
│   │   │   └── tests/   # Strategy tests
│   │   └── ...          # Other model objects
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type declarations
│   └── visualizer/       # Visualization components
├── test-runner.ts        # Test entry point
├── tsconfig.json         # TypeScript configuration
└── webpack.config.js     # Build configuration
```

## Core Components

### Application State (`src/core/AppState.ts`)
Central store for application state using a Singleton pattern. Manages global state and provides access to key services.

```typescript
// Example usage
import { appState } from '../core/AppState';
appState.world.addCar();
```

### Router (`src/core/Router.ts`)
Handles navigation between different pages/views of the application.

```typescript
// Example usage
import { router } from '../core/Router';
router.navigate('simulation');
```

### World (`src/model/world.ts`)
Central model representing the entire simulation state, including roads, intersections, and vehicles.

```typescript
// Example usage
const world = new World();
world.update(deltaTime);
```

### Visualizer (`src/visualizer/visualizer.ts`)
Handles rendering of the simulation to the canvas element.

```typescript
// Example usage
const visualizer = new Visualizer(canvas, world);
visualizer.render();
```

## Traffic Control Strategy Implementation

The traffic control system uses the Strategy pattern to allow interchangeable control algorithms.

### Strategy Interface (`src/model/traffic-control/ITrafficControlStrategy.ts`)
Defines the contract that all traffic control strategies must implement.

```typescript
export interface ITrafficControlStrategy {
  // Required methods
  initialize(intersection: Intersection): void;
  update(deltaTime: number): void;
  getSignalState(laneId: string): SignalState;
  
  // Optional methods
  getName(): string;
  getParameters(): any;
  setParameters(params: any): void;
}
```

### Abstract Strategy Base (`src/model/traffic-control/AbstractTrafficControlStrategy.ts`)
Provides common functionality for all strategy implementations.

```typescript
export abstract class AbstractTrafficControlStrategy implements ITrafficControlStrategy {
  protected intersection: Intersection;
  protected signals: Map<string, SignalState>;
  
  initialize(intersection: Intersection): void {
    this.intersection = intersection;
    this.initializeSignals();
  }
  
  // Common implementations...
  
  abstract update(deltaTime: number): void;
}
```

### Strategy Implementation Example
Example of implementing a custom traffic control strategy:

```typescript
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';

export class MyCustomStrategy extends AbstractTrafficControlStrategy {
  private timer: number = 0;
  
  update(deltaTime: number): void {
    this.timer += deltaTime;
    
    // Your custom logic here
    if (this.timer > 30) {
      this.switchPhase();
      this.timer = 0;
    }
  }
  
  private switchPhase(): void {
    // Implementation details
  }
  
  getName(): string {
    return 'My Custom Strategy';
  }
}
```

### Strategy Manager (`src/model/traffic-control/TrafficControlStrategyManager.ts`)
Registry for available strategies and factory for creating strategy instances.

```typescript
// Example usage
import { trafficControlStrategyManager } from './TrafficControlStrategyManager';

// Register a new strategy
trafficControlStrategyManager.registerStrategy('custom', MyCustomStrategy);

// Create a strategy instance
const strategy = trafficControlStrategyManager.createStrategy('adaptive');
```

## KPI Collection System

The KPI (Key Performance Indicator) system tracks performance metrics throughout the simulation.

### KPI Collector (`src/model/kpi-collector.ts`)
Singleton service that gathers and processes metrics data.

```typescript
// Core functionality
export class KPICollector {
  // Data structures
  private globalMetrics: SimulationMetrics;
  private laneMetrics: Map<string, LaneDetailedMetrics>;
  private intersectionMetrics: Map<string, IntersectionDetailedMetrics>;
  private historicalSamples: SimulationMetrics[];
  
  // Methods for recording events
  recordVehicleMovement(vehicle: Car, deltaTime: number): void {
    // Implementation details
  }
  
  recordVehicleWait(vehicle: Car, laneId: string, waitTime: number): void {
    // Implementation details
  }
  
  // Methods for retrieving metrics
  getGlobalMetrics(): SimulationMetrics {
    return this.globalMetrics;
  }
  
  // Export methods
  exportMetricsCSV(): string {
    // Implementation details
  }
  
  exportMetricsJSON(): string {
    // Implementation details
  }
}
```

### Integration with Simulation

```typescript
// In world.update()
update(deltaTime: number): void {
  // Update vehicles
  this.vehicles.forEach(vehicle => {
    vehicle.update(deltaTime);
    kpiCollector.recordVehicleMovement(vehicle, deltaTime);
  });
  
  // Update intersections
  this.intersections.forEach(intersection => {
    intersection.update(deltaTime);
  });
}
```

### Benchmark Management (`src/pages/SimulationPageComponent.ts`)
Handles the execution of benchmarks and processing of results.

```typescript
// Example benchmark execution
startBenchmark(duration: number): void {
  this.isBenchmarkRunning = true;
  this.benchmarkDuration = duration;
  this.benchmarkStartTime = this.world.getTime();
  this.benchmarkIntervalSamples = [];
  
  kpiCollector.startBenchmark();
  
  this.benchmarkTimer = setInterval(() => {
    const currentMetrics = kpiCollector.getGlobalMetrics();
    this.benchmarkIntervalSamples.push({...currentMetrics});
    
    if (this.world.getTime() - this.benchmarkStartTime >= duration) {
      this.completeBenchmark();
    }
  }, 1000); // Sample every second
}

completeBenchmark(): void {
  clearInterval(this.benchmarkTimer);
  this.isBenchmarkRunning = false;
  
  const finalMetrics = kpiCollector.finalizeBenchmark();
  
  this.benchmarkResults = {
    id: `benchmark-${Date.now()}`,
    name: `Benchmark ${new Date().toLocaleTimeString()}`,
    timestamp: new Date().toISOString(),
    finalMetrics: finalMetrics,
    samples: this.benchmarkIntervalSamples,
    settings: this.getSimulationSettings()
  };
  
  this.showBenchmarkResults();
}
```

## Storage and Persistence

### Storage Interface (`src/lib/storage/IStorage.ts`)
Common interface for different storage implementations.

```typescript
export interface IStorage {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}
```

### Local Storage Implementation (`src/lib/storage/LocalStorage.ts`)
Implementation using browser's localStorage API.

```typescript
export class LocalStorage implements IStorage {
  async save(key: string, data: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  async load(key: string): Promise<any> {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  // Other method implementations...
}
```

### Database Storage Implementation (`src/lib/storage/DatabaseStorage.ts`)
Implementation using a server-side database.

```typescript
export class DatabaseStorage implements IStorage {
  private apiUrl: string;
  
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  
  async save(key: string, data: any): Promise<void> {
    await fetch(`${this.apiUrl}/scenarios/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }
  
  // Other method implementations...
}
```

### Storage Manager (`src/lib/storage/storageStore.ts`)
Factory for creating and managing storage instances.

```typescript
export class StorageStore {
  private static instance: StorageStore;
  private activeStorage: IStorage;
  
  private constructor() {
    this.activeStorage = new LocalStorage();
  }
  
  static getInstance(): StorageStore {
    if (!StorageStore.instance) {
      StorageStore.instance = new StorageStore();
    }
    return StorageStore.instance;
  }
  
  setStorage(storageType: 'local' | 'database'): void {
    if (storageType === 'local') {
      this.activeStorage = new LocalStorage();
    } else if (storageType === 'database') {
      this.activeStorage = new DatabaseStorage('/api');
    }
  }
  
  getStorage(): IStorage {
    return this.activeStorage;
  }
}

export const storageStore = StorageStore.getInstance();
```

## Visualization Components

### KPI Visualization Component (`src/components/KPIVisualizationComponent.ts`)
Handles the display of KPI data through charts and tables.

```typescript
export class KPIVisualizationComponent {
  private container: HTMLElement;
  private charts: { [key: string]: Chart } = {};
  
  constructor(container: HTMLElement) {
    this.container = container;
  }
  
  displayBenchmarkResults(data: BenchmarkRun): void {
    this.render(data);
  }
  
  private render(data: BenchmarkRun): void {
    this.container.innerHTML = this.createHTML(data);
    this.initializeCharts(data);
    this.initializeEventListeners();
  }
  
  private createHTML(data: BenchmarkRun): string {
    // Generate HTML for the visualization
  }
  
  private initializeCharts(data: BenchmarkRun): void {
    this.createSpeedChart(data);
    this.createThroughputChart(data);
    this.createWaitTimeChart(data);
    this.createCongestionChart(data);
  }
  
  // Chart creation methods
  private createSpeedChart(data: BenchmarkRun): void {
    // Chart.js implementation
  }
  
  // Event handler setup
  private initializeEventListeners(): void {
    // Setup for sorting, filtering, export actions
  }
}
```

### Integration in Simulation Page

```typescript
// In SimulationPageComponent
private showBenchmarkResults(): void {
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'benchmark-results-container';
  document.body.appendChild(resultsContainer);
  
  this.kpiVisualization = new KPIVisualizationComponent(resultsContainer);
  this.kpiVisualization.displayBenchmarkResults(this.benchmarkResults);
}
```

## Testing Framework

### Unit Testing Setup

The project uses a custom test runner built on top of TypeScript.

```typescript
// Example test file structure
import { TestCase } from '../TestCase';

export class KPICollectorTest extends TestCase {
  testInitialization(): void {
    const collector = new KPICollector();
    this.assertNotNull(collector);
    this.assertEqual(collector.getGlobalMetrics().totalVehicles, 0);
  }
  
  testRecordVehicleMovement(): void {
    const collector = new KPICollector();
    const vehicle = this.createMockVehicle();
    
    collector.recordVehicleMovement(vehicle, 1.0);
    
    this.assertEqual(collector.getGlobalMetrics().totalVehicles, 1);
    this.assertEqual(collector.getGlobalMetrics().activeVehicles, 1);
  }
  
  // More test methods...
}
```

### Test Runner (`src/test-runner.ts`)

```typescript
export class TestRunner {
  private tests: TestCase[] = [];
  
  registerTest(test: TestCase): void {
    this.tests.push(test);
  }
  
  runAll(): TestResults {
    const results: TestResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    for (const test of this.tests) {
      const testResults = test.runAll();
      results.total += testResults.total;
      results.passed += testResults.passed;
      results.failed += testResults.failed;
      results.skipped += testResults.skipped;
      results.details.push(...testResults.details);
    }
    
    return results;
  }
}
```

### Running Tests

```typescript
// Test entry point
import { TestRunner } from './test-runner';
import { KPICollectorTest } from './model/tests/KPICollectorTest';
import { FixedTimingStrategyTest } from './model/traffic-control/tests/FixedTimingStrategyTest';
// Import other tests...

const runner = new TestRunner();
runner.registerTest(new KPICollectorTest());
runner.registerTest(new FixedTimingStrategyTest());
// Register other tests...

const results = runner.runAll();
console.log(`Tests: ${results.passed}/${results.total} passed`);
if (results.failed > 0) {
  console.error('Failed tests:');
  results.details
    .filter(detail => detail.status === 'failed')
    .forEach(detail => {
      console.error(`- ${detail.name}: ${detail.message}`);
    });
}
```

## Build and Deployment

### Webpack Configuration (`webpack.config.js`)
The project uses Webpack for bundling and building.

```javascript
module.exports = {
  entry: {
    main: './src/main.ts',
    tests: './test-runner.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ]
};
```

### npm Scripts (`package.json`)

```json
{
  "scripts": {
    "build": "webpack --mode development",
    "build:prod": "webpack --mode production",
    "dev": "webpack serve --mode development",
    "start": "npm run dev",
    "lint": "eslint 'src/**/*.ts'",
    "clean": "rimraf dist",
    "watch": "webpack --mode development --watch"
  }
}
```

## Extending the System

### Adding a New Traffic Control Strategy

1. Create a new strategy class in `src/model/traffic-control/`:

```typescript
import { AbstractTrafficControlStrategy } from './AbstractTrafficControlStrategy';
import { Intersection } from '../intersection';
import { SignalState } from '../control-signals';

export class MyNewStrategy extends AbstractTrafficControlStrategy {
  private customParameter: number = 5;
  
  constructor() {
    super();
  }
  
  initialize(intersection: Intersection): void {
    super.initialize(intersection);
    // Custom initialization
  }
  
  update(deltaTime: number): void {
    // Implement strategy logic here
  }
  
  getSignalState(laneId: string): SignalState {
    return this.signals.get(laneId) || SignalState.RED;
  }
  
  getName(): string {
    return 'My New Strategy';
  }
  
  getParameters(): any {
    return { customParameter: this.customParameter };
  }
  
  setParameters(params: any): void {
    if (params.customParameter !== undefined) {
      this.customParameter = params.customParameter;
    }
  }
}
```

2. Register the strategy in the manager:

```typescript
// In TrafficControlStrategyManager.ts or in your initialization code
trafficControlStrategyManager.registerStrategy('my-new-strategy', MyNewStrategy);
```

3. Add UI elements to select and configure the strategy:

```typescript
// In SimulationPageComponent.ts or relevant UI component
private createStrategySelectionUI(): HTMLElement {
  const container = document.createElement('div');
  
  // Add your strategy to the options
  container.innerHTML = `
    <select id="strategy-selector">
      <option value="fixed-timing">Fixed Timing</option>
      <option value="adaptive">Adaptive Timing</option>
      <option value="all-red-flashing">All Red Flashing</option>
      <option value="traffic-enforcer">Traffic Enforcer</option>
      <option value="my-new-strategy">My New Strategy</option>
    </select>
    <div id="strategy-parameters"></div>
  `;
  
  // Add event listener for strategy selection
  container.querySelector('#strategy-selector')!.addEventListener('change', (e) => {
    const value = (e.target as HTMLSelectElement).value;
    this.selectedTrafficControlModel = value;
    this.showStrategyParameters(value);
  });
  
  return container;
}

private showStrategyParameters(strategyType: string): void {
  const container = document.getElementById('strategy-parameters')!;
  
  // Clear previous parameters
  container.innerHTML = '';
  
  // Add parameter UI for your strategy
  if (strategyType === 'my-new-strategy') {
    container.innerHTML = `
      <div class="parameter">
        <label>Custom Parameter:</label>
        <input type="number" id="custom-parameter" value="5" min="1" max="10">
      </div>
    `;
    
    container.querySelector('#custom-parameter')!.addEventListener('change', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.strategyParameters = { customParameter: value };
    });
  }
  
  // Other strategy parameters...
}
```

4. Create tests for your strategy:

```typescript
// In src/model/traffic-control/tests/MyNewStrategyTest.ts
import { TestCase } from '../../../TestCase';
import { MyNewStrategy } from '../MyNewStrategy';
import { Intersection } from '../../intersection';

export class MyNewStrategyTest extends TestCase {
  testInitialization(): void {
    const strategy = new MyNewStrategy();
    const intersection = this.createMockIntersection();
    
    strategy.initialize(intersection);
    
    // Assertions
    this.assertNotNull(strategy);
    this.assertEqual(strategy.getName(), 'My New Strategy');
  }
  
  // More test methods...
}
```

5. Register your test:

```typescript
// In test-runner.ts
import { MyNewStrategyTest } from './model/traffic-control/tests/MyNewStrategyTest';

// Register test
runner.registerTest(new MyNewStrategyTest());
```

### Adding New KPI Metrics

1. Update the metric types in `src/model/kpi-collector.ts`:

```typescript
export interface SimulationMetrics {
  // Existing metrics
  totalVehicles: number;
  activeVehicles: number;
  // ...
  
  // New metric
  myNewMetric: number;
}
```

2. Add collection logic for the new metric:

```typescript
export class KPICollector {
  // Existing code
  
  recordMyNewMetricEvent(value: number): void {
    this.globalMetrics.myNewMetric += value;
  }
  
  // Update reset/initialize methods
  resetMetrics(): void {
    this.globalMetrics = {
      // Existing resets
      totalVehicles: 0,
      activeVehicles: 0,
      // ...
      
      // New metric reset
      myNewMetric: 0
    };
    
    // Reset other collections
  }
}
```

3. Add visualization for the new metric:

```typescript
// In KPIVisualizationComponent.ts
private renderSummaryCards(): string {
  const metrics = this.currentBenchmark!.finalMetrics;
  
  return `
    <div class="summary-grid">
      <!-- Existing cards -->
      
      <!-- New metric card -->
      <div class="summary-card">
        <div class="card-value">${metrics.myNewMetric.toFixed(2)}</div>
        <div class="card-label">My New Metric</div>
        <div class="card-change ${this.getChangeClass('myNewMetric')}">${this.getChangeText('myNewMetric')}</div>
      </div>
    </div>
  `;
}
```

4. Update export methods to include the new metric:

```typescript
// In KPICollector.ts
exportMetricsCSV(): string {
  let csv = 'Traffic Simulation Benchmark Results\n\n';
  
  // Existing export code
  
  // Add new metric to CSV
  csv += `My New Metric,${metrics.myNewMetric.toFixed(2)}\n`;
  
  return csv;
}

exportMetricsJSON(): string {
  // Existing code
  
  // New metric is already included in the metrics object
  return JSON.stringify({
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0'
    },
    metrics: this.getGlobalMetrics(),
    samples: this.historicalSamples,
    laneMetrics: Array.from(this.laneMetrics.values()),
    intersectionMetrics: Array.from(this.intersectionMetrics.values())
  }, null, 2);
}
```

### Creating Custom Visualizations

1. Create a new visualization component:

```typescript
// In src/components/MyCustomVisualization.ts
export class MyCustomVisualization {
  private container: HTMLElement;
  private data: any;
  
  constructor(container: HTMLElement) {
    this.container = container;
  }
  
  setData(data: any): void {
    this.data = data;
    this.render();
  }
  
  private render(): void {
    // Create your custom visualization here
    this.container.innerHTML = `
      <div class="custom-viz">
        <!-- Custom visualization HTML -->
      </div>
    `;
    
    // Add any JavaScript for interactivity
    this.addInteractivity();
  }
  
  private addInteractivity(): void {
    // Add event listeners, etc.
  }
  
  destroy(): void {
    // Clean up event listeners, etc.
  }
}
```

2. Integrate your visualization:

```typescript
// In the relevant page component
private initializeCustomVisualization(): void {
  const container = document.createElement('div');
  container.className = 'custom-viz-container';
  document.getElementById('visualization-panel').appendChild(container);
  
  this.customViz = new MyCustomVisualization(container);
  this.customViz.setData(this.getData());
}

private getData(): any {
  // Get data for your visualization
  return {
    // Your data structure
  };
}
```

For more detailed information on specific components or subsystems, please refer to the inline documentation in the codebase.
