# Enhanced KPI System Documentation

## Overview

The Enhanced KPI (Key Performance Indicator) System provides comprehensive tracking, analysis, and reporting of traffic simulation metrics. This system goes beyond basic traffic metrics to include emissions, fuel consumption, Level of Service analysis, and detailed queue management.

## Core Features

### 1. Comprehensive Vehicle Tracking
- **Journey Tracking**: Complete lifecycle from entry to exit
- **Stop Frequency**: Counts the number of stops per vehicle
- **Travel Time**: Total time from origin to destination
- **Delay Analysis**: Time spent stopped or delayed due to traffic

### 2. Emissions and Environmental Impact
- **CO₂ Emissions**: Carbon dioxide emissions in kg
- **Fuel Consumption**: Fuel usage in liters
- **NOx Emissions**: Nitrogen oxide emissions in kg
- **PM Emissions**: Particulate matter emissions in kg
- **Environmental Impact Score**: Weighted total environmental impact

#### Emission Calculation Model
The system uses a simplified Vehicle Specific Power (VSP) model:
- **Idling**: Higher emissions when vehicles are stopped
- **Acceleration**: Increased emissions during acceleration phases
- **Cruising**: Optimal emissions at steady speeds
- **Deceleration**: Reduced emissions during engine braking

### 3. Queue Length Analysis
- **Global Maximum**: Highest queue length across all locations
- **Average Queue Lengths**: Per intersection and lane
- **Queue Formation Events**: Number of times queues form
- **Queue Dissipation Events**: Number of times queues clear
- **Total Queue Time**: Cumulative time vehicles spend in queues

### 4. Level of Service (LOS) Assessment
Based on Highway Capacity Manual (HCM) standards:
- **Grade A**: Free flow (≤10s delay)
- **Grade B**: Stable flow (≤20s delay)
- **Grade C**: Stable with noticeable delays (≤35s delay)
- **Grade D**: Approaching unstable flow (≤55s delay)
- **Grade E**: Unstable flow (≤80s delay)
- **Grade F**: Forced flow (>80s delay)

### 5. Intersection Utilization
- **Utilization Rate**: Percentage of time intersections are actively used
- **Active Time**: Time spent with vehicles present
- **Idle Time**: Time with no vehicle activity
- **Peak Utilization**: Maximum utilization rate observed

### 6. Vehicle Density Metrics
- **Average Density**: Vehicles per kilometer
- **Maximum Density**: Peak density observed
- **Congestion Threshold**: Density at which congestion begins (25 veh/km)
- **Time Above Threshold**: Percentage of time above congestion level

## API Reference

### Core KPICollector Methods

#### Vehicle Lifecycle Tracking
```typescript
// Record vehicle entering simulation
recordVehicleEnter(vehicle: Car, time: number): void

// Record vehicle exiting simulation
recordVehicleExit(vehicle: Car, time: number): void

// Record vehicle stop event
recordVehicleStop(vehicle: Car, time: number): void

// Record vehicle start event
recordVehicleStart(vehicle: Car, time: number): void
```

#### Emissions Tracking
```typescript
// Update vehicle emissions based on driving behavior
updateVehicleEmissions(
  vehicle: Car, 
  time: number, 
  acceleration: number, 
  delta: number
): void
```

#### Queue and Density Monitoring
```typescript
// Record queue length at specific location
recordQueueLength(
  locationId: string, 
  queueLength: number, 
  isIntersection: boolean = false
): void

// Sample vehicle density on roads
sampleVehicleDensity(
  roadId: string, 
  vehicleCount: number, 
  roadLength: number
): void
```

#### Data Retrieval
```typescript
// Get comprehensive metrics
getMetrics(currentTime: number = 0): SimulationMetrics

// Export to CSV format
exportMetricsCSV(): string

// Export to JSON format
exportMetricsJSON(): string
```

### Data Structures

#### SimulationMetrics Interface
```typescript
interface SimulationMetrics {
  // Basic metrics
  totalVehicles: number;
  activeVehicles: number;
  completedTrips: number;
  averageSpeed: number;
  averageWaitTime: number;
  
  // Enhanced KPIs
  averageVehicleDelay: number;
  averageTravelTime: number;
  averageStopFrequency: number;
  totalEmissions: EmissionMetrics;
  averageEmissionsPerVehicle: EmissionMetrics;
  queueMetrics: QueueMetrics;
  levelOfService: { [segmentId: string]: LevelOfServiceMetrics };
  vehicleDensity: { [roadId: string]: DensityMetrics };
  intersectionUtilizationRate: { [intersectionId: string]: UtilizationMetrics };
}
```

#### EmissionMetrics Interface
```typescript
interface EmissionMetrics {
  co2Emissions: number;      // kg of CO2
  fuelConsumption: number;   // liters of fuel
  noxEmissions: number;      // kg of NOx
  pmEmissions: number;       // kg of particulate matter
  totalEmissions: number;    // Total environmental impact score
}
```

## Integration Guide

### 1. Basic Setup
```typescript
import { kpiCollector } from './model/kpi-collector';

// Start recording
kpiCollector.startRecording(simulationStartTime);

// Reset for new simulation
kpiCollector.reset();
```

### 2. Vehicle Integration
```typescript
// In vehicle constructor
kpiCollector.recordVehicleEnter(this, currentTime);

// In vehicle movement loop
kpiCollector.updateVehicleEmissions(this, currentTime, acceleration, deltaTime);

// On vehicle destruction
kpiCollector.recordVehicleExit(this, currentTime);
```

### 3. Intersection Integration
```typescript
// In intersection update loop
const hasVehicles = this.getVehicleCount() > 0;
kpiCollector.recordIntersectionUtilization(this.id, currentTime, hasVehicles);
```

### 4. Lane Integration
```typescript
// When vehicle enters lane
kpiCollector.recordLaneEnter(vehicle, this, currentTime);

// When vehicle exits lane
kpiCollector.recordLaneExit(vehicle, this, currentTime);
```

## Visualization Features

### 1. Summary Cards
- Real-time display of key metrics
- Color-coded performance indicators
- Comparison with previous runs

### 2. Interactive Tables
- **Enhanced KPI Summary**: Core performance metrics
- **Emissions Table**: Environmental impact breakdown
- **Level of Service**: Per-segment LOS assessment
- **Utilization Rates**: Intersection efficiency metrics
- **Density Analysis**: Traffic density by road segment

### 3. Time-Series Charts
- Speed evolution over time
- Throughput trends
- Wait time patterns
- Congestion development

### 4. Export Capabilities
- **CSV Export**: Detailed metrics for analysis
- **JSON Export**: Complete data structure with raw events
- **Data Validation**: Accuracy verification tools

## Testing Framework

### Automated Tests
The system includes comprehensive unit tests:

```typescript
// Run all KPI tests
KPICollectorTest.runAllTests();

// Specific test categories
KPICollectorTest.testVehicleTracking();
KPICollectorTest.testEmissionsCalculation();
KPICollectorTest.testQueueTracking();
KPICollectorTest.testLevelOfService();
```

### Validation Features
- Data integrity checks
- Cross-validation between metrics
- Export accuracy verification
- Performance impact monitoring

## Performance Considerations

### Efficiency Optimizations
1. **Incremental Aggregation**: Metrics calculated incrementally to avoid full recalculation
2. **Sampling Strategy**: Density and utilization sampled at reasonable intervals
3. **Memory Management**: Old data cleaned up automatically
4. **Selective Recording**: Only record events when simulation is active

### Scalability
- Handles thousands of vehicles efficiently
- Minimal performance impact on simulation
- Configurable sampling rates
- Optional detailed logging

## Best Practices

### 1. Integration
- Call KPI methods at appropriate simulation points
- Ensure consistent timing across all events
- Handle edge cases (vehicle removal, simulation reset)

### 2. Data Analysis
- Use appropriate time windows for analysis
- Consider traffic patterns when interpreting results
- Validate results against known traffic engineering principles

### 3. Performance Monitoring
- Monitor KPI collection overhead
- Adjust sampling rates based on simulation size
- Regular validation of calculation accuracy

## Future Enhancements

### Planned Features
1. **Real-time Alerting**: Automatic detection of traffic issues
2. **Predictive Analytics**: Forecast congestion based on current trends
3. **Multi-scenario Comparison**: Side-by-side analysis of different configurations
4. **Advanced Emissions Models**: More sophisticated emission calculations
5. **Machine Learning Integration**: Pattern recognition and optimization suggestions

### Extensibility
The system is designed for easy extension:
- Add new KPI types through interface extension
- Plugin architecture for custom calculations
- Configurable aggregation methods
- Custom export formats

## Troubleshooting

### Common Issues
1. **Missing Data**: Ensure all lifecycle events are properly recorded
2. **Incorrect Calculations**: Verify vehicle state consistency
3. **Performance Issues**: Check sampling rates and data cleanup
4. **Export Problems**: Validate data integrity before export

### Debug Tools
- Built-in validation methods
- Console logging for event tracking
- Data integrity checks
- Performance monitoring utilities
