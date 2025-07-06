# Road Traffic Simulator (TypeScript)

A TypeScript-based traffic simulation with signal-controlled intersections, modernized from CoffeeScript.

## Overview

This project simulates road networks with intelligent traffic signals and vehicle movement using the [Intelligent Driver Model](https://en.wikipedia.org/wiki/Intelligent_driver_model) (IDM) and MOBIL lane-changing model. Originally written in CoffeeScript, it has been completely modernized to TypeScript while maintaining 100% functional parity.

### Key Features
- **Intelligent Traffic Signals**: Adaptive signal timing based on traffic patterns
- **Realistic Vehicle Behavior**: Cars follow IDM for realistic acceleration and following behavior
- **Interactive Visualization**: Real-time visualization with zoom, pan, and debug features
- **Customizable Road Networks**: Build custom road layouts or generate random networks
- **Performance Metrics**: Real-time speed monitoring and traffic flow analysis

## Technology Stack

- **TypeScript**: Modern JavaScript with static typing
- **Webpack**: Module bundling and asset management
- **npm**: Package management and build scripts
- **Mocha + Chai**: Unit testing framework
- **ESLint**: Code quality and style checking

## Quick Start

```bash
# Clone and install
git clone https://github.com/volkhin/RoadTrafficSimulator.git
cd RoadTrafficSimulator
npm install

# Start development server
npm run dev
# Open http://localhost:9000 in your browser

# Or build for production
npm run build
# Open index.html in your browser
```

## Controls

### Mouse Controls
- **Mouse wheel**: Zoom in/out
- **Drag**: Pan around the map
- **Shift + Click**: Create intersection
- **Shift + Drag**: Create road between intersections

### GUI Controls
- **Generate Map**: Create random road network
- **Cars Number**: Adjust vehicle count (0-200)
- **Time Factor**: Change simulation speed
- **Debug Mode**: Show additional information
- **Save/Load**: Persist road networks

## Available Scripts

```bash
npm run build       # Development build
npm run build:prod  # Production build  
npm run dev         # Development server
npm run test        # Run tests
npm run lint        # Check code quality
npm run clean       # Clean build files
```

## Project Structure

```
src/                    # TypeScript source code
├── app.ts             # Main application entry
├── model/             # Simulation models (cars, roads, intersections)
├── geom/              # Geometry classes (points, segments, curves)
├── visualizer/        # Rendering and UI components
└── types/             # TypeScript type declarations

test/                  # Unit tests
experiments/           # Research data and analysis
```

## Migration from CoffeeScript

This project was completely rewritten from CoffeeScript to TypeScript while preserving:
- ✅ All simulation algorithms and behavior
- ✅ Original UI and visualization
- ✅ Complete feature set
- ✅ Backwards compatibility with saved data

### Benefits of TypeScript Version
- **Better Development Experience**: Enhanced IDE support, autocomplete, refactoring
- **Type Safety**: Catch errors at compile time
- **Modern Ecosystem**: Access to current JavaScript libraries and tools
- **Improved Performance**: Optimized builds with webpack
- **Better Maintainability**: Self-documenting code with type information

## License

MIT License - Original work by Artem Volkhin

## Contributing

Feel free to submit pull requests, create issues, or send feedback to artem@volkhin.com.

## Research Applications

This simulator supports traffic engineering research including signal optimization, flow analysis, behavior modeling, and infrastructure planning.
