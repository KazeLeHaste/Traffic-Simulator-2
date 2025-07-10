# Road Traffic Simulator - Feature Documentation

## Overview

This document provides detailed documentation for the key features implemented in the Road Traffic Simulator application, focusing on:

1. KPI Benchmarking System
2. Modular Traffic Control Strategies
3. Scenario Management (Save/Load)
4. Results Export & Visualization
5. User Interface Enhancements

## 1. KPI Benchmarking System

### Purpose
The KPI (Key Performance Indicator) benchmarking system provides comprehensive metrics for evaluating traffic flow efficiency and intersection performance under various conditions.

### Features
- **Real-time Metric Collection**: Continuously tracks performance data during simulation
- **Detailed Analytics**: Lane-level and intersection-level metrics
- **Time-series Tracking**: Evolution of metrics over simulation time
- **Benchmarking**: Automated benchmark runs with set duration
- **Comparison**: Side-by-side comparison of different scenarios
- **Validation**: Built-in data validation to ensure accuracy

### Key Metrics Tracked
- **Global Metrics**:
  - Average Vehicle Speed
  - Global Throughput
  - Congestion Index
  - Average/Maximum Wait Time
  - Total Vehicles/Completed Trips
  - Stopped Vehicles Count
  - Total Stops

- **Lane-specific Metrics**:
  - Lane Throughput
  - Average Speed in Lane
  - Queue Length
  - Congestion Rate
  - Wait Times

- **Intersection Metrics**:
  - Intersection Throughput
  - Average/Max Queue Length
  - Average/Max Wait Time
  - Congestion Rate
  - Total Vehicles Processed

### Implementation
- Core metric collection in `src/model/kpi-collector.ts`
- Visualization in `src/components/KPIVisualizationComponent.ts`
- Integration in `src/pages/SimulationPageComponent.ts`

### Usage
1. Navigate to Simulation page
2. Configure simulation parameters
3. Click "📊 Run KPI Benchmark"
4. View results in interactive visualization panel
5. Export or compare results as needed

## 2. Modular Traffic Control Strategies

### Purpose
The modular traffic control strategy pattern allows for flexible, interchangeable traffic management approaches that can be easily extended and customized.

### Available Strategies

#### Fixed Timing Strategy
- **Description**: Classic traffic light system with predetermined phase timings
- **Parameters**: Phase durations, cycle time
- **Best for**: Predictable traffic patterns, balanced flow
- **Implementation**: `src/model/traffic-control/FixedTimingStrategy.ts`

#### Adaptive Timing Strategy
- **Description**: Dynamically adjusts signal timings based on real-time traffic conditions
- **Parameters**: Sensitivity, minimum/maximum phase durations
- **Best for**: Variable traffic patterns, handling unexpected peaks
- **Implementation**: `src/model/traffic-control/AdaptiveTimingStrategy.ts`

#### All-Red Flashing Strategy
- **Description**: Flashing red lights for all directions (4-way stop)
- **Parameters**: None
- **Best for**: Low traffic situations, power outage simulation
- **Implementation**: `src/model/traffic-control/AllRedFlashingStrategy.ts`

#### Traffic Enforcer Strategy
- **Description**: Simulates human traffic director making real-time decisions
- **Parameters**: Decision frequency, prioritization rules
- **Best for**: Complex intersections, special events
- **Implementation**: `src/model/traffic-control/TrafficEnforcerStrategy.ts`

### Strategy Pattern Implementation
- **Interface**: `ITrafficControlStrategy` in `src/model/traffic-control/ITrafficControlStrategy.ts`
- **Abstract Base**: `AbstractTrafficControlStrategy` in `src/model/traffic-control/AbstractTrafficControlStrategy.ts`
- **Manager**: `TrafficControlStrategyManager` in `src/model/traffic-control/TrafficControlStrategyManager.ts`
- **Adapter**: `IntersectionTrafficControlAdapter` in `src/model/traffic-control/IntersectionTrafficControlAdapter.ts`

### Usage
1. Select desired strategy from dropdown in Simulation page
2. Configure strategy-specific parameters if needed
3. Run simulation or benchmark
4. Change strategy during simulation if desired

## 3. Scenario Management

### Purpose
Allows users to save, load, and share traffic scenarios with specific layouts, vehicle configurations, and control strategies.

### Features
- **Save Scenario**: Store complete simulation state
- **Load Scenario**: Restore previously saved scenarios
- **Export/Import**: Share scenarios between users
- **Preset Library**: Access to predefined test scenarios

### Scenario Components
- Road network layout
- Intersection configurations
- Vehicle parameters (count, speed, etc.)
- Traffic control strategy and settings
- Starting conditions

### Storage Options
- **Local Storage**: Browser-based persistent storage
- **Database**: Optional server-side storage for registered users
- **File-based**: Import/export as JSON files

### Implementation
- Storage interfaces: `src/lib/storage/IStorage.ts`
- Local storage: `src/lib/storage/LocalStorage.ts`
- Database storage: `src/lib/storage/DatabaseStorage.ts`
- Storage manager: `src/lib/storage/storageStore.ts`

### Usage
1. Create or load a scenario in the Builder page
2. Configure as desired
3. Save using the "Save Scenario" button
4. Load using the "Load Scenario" dropdown

## 4. Results Export & Visualization

### Purpose
Provides comprehensive data export and visualization capabilities for analysis, reporting, and research.

### Export Formats
- **CSV**: Spreadsheet-compatible format for analysis in Excel, etc.
- **JSON**: Structured data format for programmatic analysis

### Export Contents
- Complete benchmark metrics
- Time-series data
- Lane and intersection detailed metrics
- Simulation parameters
- Timestamp and metadata

### Visualization Components
- **Summary Cards**: At-a-glance key metrics
- **Time-series Charts**: Performance evolution over time
- **Interactive Tables**: Detailed data with sorting and filtering
- **Comparison Views**: Side-by-side analysis

### Implementation
- CSV/JSON export: `src/model/kpi-collector.ts`
- Visualization: `src/components/KPIVisualizationComponent.ts`
- Styling: `css/kpi-visualization.css`

### Usage
1. Run a benchmark
2. View visualization in results panel
3. Click "📄 Export CSV" or "📋 Export JSON"
4. Use "✓ Validate Data" to verify export accuracy
5. Use "📊 Compare Runs" for historical comparison

## 5. User Interface Enhancements

### Purpose
Improves usability, clarity, and efficiency of the simulation interface for better user experience.

### Key Enhancements
- **Dark Theme**: Reduced eye strain, modern appearance
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Controls**: Intuitive simulation management
- **Real-time Feedback**: Dynamic updating of metrics
- **Data Visualization**: Charts and tables for clear insights
- **Tooltips**: Contextual help for complex features
- **Keyboard Shortcuts**: Efficient control for power users

### Implementation
- Core styles: `css/style.css`, `css/dark-theme.css`
- KPI visualization: `css/kpi-visualization.css`
- UI components: `src/components/` directory

### Navigation Structure
- **Home**: Welcome and quick start
- **Builder**: Road network creation and editing
- **Simulation**: Running simulations and benchmarks
- **Help/Documentation**: Detailed user guidance

## Additional Resources

- **GitHub Repository**: [RoadTrafficSimulator](https://github.com/volkhin/RoadTrafficSimulator)
- **User Guide**: See `docs/USER_GUIDE.md`
- **Developer Guide**: See `docs/DEVELOPER_GUIDE.md`
- **Test Documentation**: See `docs/TEST_DOCUMENTATION.md`
