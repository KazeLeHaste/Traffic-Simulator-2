# Road Traffic Simulator - User Guide

## Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Building Road Networks](#building-road-networks)
4. [Running Simulations](#running-simulations)
5. [Traffic Control Strategies](#traffic-control-strategies)
6. [KPI Benchmarking](#kpi-benchmarking)
7. [Saving & Loading Scenarios](#saving--loading-scenarios)
8. [Exporting & Analyzing Results](#exporting--analyzing-results)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Features](#advanced-features)

## Introduction

The Road Traffic Simulator is a powerful tool for designing, testing, and analyzing road networks and traffic control strategies. This user guide will help you understand the key features and how to use them effectively.

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- JavaScript enabled
- Minimum screen resolution: 1280x720

### Accessing the Application
1. Open your web browser
2. Navigate to http://localhost:8080 (development) or the deployed URL
3. The application will load to the home page

### User Interface Overview
- **Navigation Bar**: Access different sections of the application
- **Home**: Introduction and quick start
- **Builder**: Create and modify road networks
- **Simulation**: Run simulations and analyze results

## Building Road Networks

### Basic Controls
- **Left Click**: Select/place road elements
- **Right Click**: Cancel/delete elements
- **Mouse Wheel**: Zoom in/out
- **Click and Drag**: Move the view

### Creating Roads
1. In Builder page, select "Road" from the toolbar
2. Click on the canvas to place the start point
3. Click again to place the end point
4. Adjust the road properties (width, lanes) in the properties panel

### Creating Intersections
1. Select "Intersection" from the toolbar
2. Click on the canvas to place the intersection
3. Connect roads to the intersection by dragging from road ends
4. Configure traffic signals in the properties panel

### Tips for Effective Network Design
- Start with simple grids before creating complex networks
- Use consistent road widths for better traffic flow
- Consider traffic patterns when designing intersections
- Test networks with small simulations before benchmarking

## Running Simulations

### Basic Simulation Controls
- **Start**: Begin the simulation
- **Pause**: Temporarily halt the simulation
- **Reset**: Return to initial state
- **Speed**: Adjust simulation speed (0.5x to 3x)

### Vehicle Configuration
- **Vehicle Count**: Set the number of vehicles (10-1000)
- **Spawn Rate**: Control how quickly vehicles enter the simulation
- **Route Assignment**: Choose how vehicles select their routes
- **Vehicle Types**: Configure the mix of vehicle types

### Viewing Options
- **Show/Hide**: Toggle visibility of different elements
- **Highlight**: Emphasize specific metrics (speed, wait time, etc.)
- **Follow**: Track specific vehicles through their journey
- **Analytics Panel**: View real-time statistics

## Traffic Control Strategies

### Available Strategies

#### Fixed Timing Strategy
- **Description**: Traditional traffic lights with predetermined timing
- **Configuration**: Set cycle time and phase durations
- **Best For**: Consistent, predictable traffic patterns
- **Usage**: Set green/yellow/red durations for each direction

#### Adaptive Timing Strategy
- **Description**: Dynamically adjusts signals based on traffic conditions
- **Configuration**: Set sensitivity and min/max phase durations
- **Best For**: Variable traffic with peak periods
- **Usage**: The system will automatically adjust timing based on queue lengths

#### All-Red Flashing Strategy
- **Description**: All directions have flashing red (like 4-way stop)
- **Configuration**: No special configuration needed
- **Best For**: Low-traffic intersections, power outage simulation
- **Usage**: Select this strategy to simulate four-way stops

#### Traffic Enforcer Strategy
- **Description**: Simulates a human directing traffic
- **Configuration**: Set decision frequency and priority rules
- **Best For**: Complex intersections, unusual traffic patterns
- **Usage**: The system will dynamically direct traffic based on current conditions

### Switching Strategies
1. Select an intersection in the simulation
2. Open the "Traffic Control" panel
3. Choose a strategy from the dropdown
4. Configure strategy-specific parameters
5. Apply changes to see immediate effect

### Creating Custom Strategies
Advanced users can create custom strategies by implementing the ITrafficControlStrategy interface. See the Developer Guide for details.

## KPI Benchmarking

### Running a Benchmark
1. Set up your road network and vehicle configuration
2. Select the traffic control strategy to test
3. Set benchmark duration (recommended: 60-300 seconds)
4. Click "📊 Run KPI Benchmark"
5. Wait for the benchmark to complete

### Understanding Benchmark Results

#### Summary Cards
- **Average Speed**: Overall average vehicle speed in m/s
- **Global Throughput**: Vehicles passing through intersections per minute
- **Average Wait Time**: Mean time vehicles spend waiting at intersections
- **Congestion Index**: 0-100% measure of overall congestion
- **Total Vehicles**: Count of all vehicles in the simulation
- **Completed Trips**: Number of vehicles that reached their destination

#### Charts
- **Speed Chart**: Average vehicle speed over time
- **Throughput Chart**: Traffic flow rate over time
- **Wait Time Chart**: Average and maximum wait times over time
- **Congestion Chart**: Congestion index evolution over time

#### Detailed Tables
- **Lane Metrics**: Performance data for individual lanes
- **Intersection Metrics**: Performance data for each intersection

### Comparing Benchmarks
1. Run multiple benchmarks with different settings
2. Click "📊 Compare Runs" in the results panel
3. Select a previous benchmark from the dropdown
4. View side-by-side comparison with percentage differences
5. Up to 10 recent benchmarks are saved for comparison

## Saving & Loading Scenarios

### Saving a Scenario
1. Create or modify a road network
2. Configure vehicle settings and traffic control strategies
3. Click "Save Scenario" in the toolbar
4. Enter a name and description for the scenario
5. Click "Save" to store the scenario

### Loading a Scenario
1. Click "Load Scenario" in the toolbar
2. Select a scenario from the dropdown list
3. Click "Load" to restore the saved scenario
4. All settings and configurations will be restored

### Importing/Exporting Scenarios
1. To export: Click "Export" in the scenario management panel
2. Save the JSON file to your computer
3. To import: Click "Import" and select a previously exported file
4. Shared scenarios can be imported from other users

## Exporting & Analyzing Results

### Exporting Benchmark Data

#### CSV Export
1. Run a benchmark
2. In the results panel, click "📄 Export CSV"
3. Choose a save location for the CSV file
4. Open in spreadsheet software (Excel, Google Sheets, etc.)

#### JSON Export
1. Run a benchmark
2. In the results panel, click "📋 Export JSON"
3. Choose a save location for the JSON file
4. Use for programmatic analysis or custom visualization

### Validating Export Accuracy
1. After exporting data, click "✓ Validate Data"
2. The system will compare exported data with internal metrics
3. A validation report will show any discrepancies
4. Green checkmarks indicate successful validation

### External Analysis Tips
- Use the CSV export for quick analysis in spreadsheet software
- Use the JSON export for custom analysis in programming environments
- Time-series data can be used to create custom visualizations
- Compare multiple exports to evaluate different strategies

## Troubleshooting

### Common Issues

#### Simulation Performance
- **Issue**: Simulation running slowly
- **Solution**: Reduce vehicle count, simplify road network, or use a more powerful computer

#### Browser Compatibility
- **Issue**: Features not working in specific browsers
- **Solution**: Try Chrome or Firefox for best compatibility

#### Data Export Problems
- **Issue**: Export not downloading
- **Solution**: Check browser download settings, try a different browser

#### Rendering Issues
- **Issue**: Visual glitches or missing elements
- **Solution**: Refresh the page, update your browser, or check for WebGL support

### Getting Help
- Check the FAQ section on the website
- Join the user forum for community support
- Contact technical support for persistent issues

## Advanced Features

### Keyboard Shortcuts
- **Space**: Start/Pause simulation
- **R**: Reset simulation
- **S**: Save current scenario
- **L**: Load scenario dialog
- **B**: Run benchmark
- **+/-**: Increase/decrease simulation speed

### Customization Options
- **Dark/Light Theme**: Toggle in settings
- **Display Units**: Choose metric or imperial
- **Custom Vehicle Types**: Define your own vehicle characteristics
- **Visual Style**: Choose between realistic and schematic visualization

### Advanced Analysis
- **Custom KPI Tracking**: Configure which metrics to track
- **API Integration**: Connect to external analysis tools
- **Batch Processing**: Run multiple benchmarks automatically
- **Scenario Generation**: Algorithmically create test scenarios

### Developer Extensions
- **Custom Strategies**: Create your own traffic control algorithms
- **Visualization Plugins**: Add custom visualizations
- **Data Processors**: Add custom data analysis modules

---

For technical details and API documentation, please refer to the Developer Guide.

For testing procedures and validation, see the Test Documentation.
