# Road Traffic Simulator

A modern, interactive road traffic simulation tool built with TypeScript. Create custom road networks, run simulations, and analyze traffic flow.

## Features

- **Interactive Builder Mode**: Create custom road networks and intersections
- **Simulation Mode**: Run traffic simulations on your created layouts
- **Real-time Analytics**: Monitor traffic flow, vehicle counts, and performance metrics
- **Save & Load**: Store your road layouts for future use and testing
- **Responsive Design**: Works seamlessly across different screen sizes
- **Modern Dark Theme**: Easy on the eyes for extended design sessions

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/RoadTrafficSimulator.git
cd RoadTrafficSimulator
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### Builder Mode

1. Navigate to the **Builder** tab in the navigation bar
2. Use the tools in the sidebar to create roads and intersections
3. Click and drag to create roads between intersections
4. Save your layout for later use in simulations

### Simulation Mode

1. Navigate to the **Simulation** tab
2. Load a previously saved layout
3. Adjust the number of cars and time factor using the sliders
4. Click "Start Simulation" to begin
5. Use the analytics panel to monitor traffic metrics
6. Save analytics data for further analysis

## Project Structure

```
/
├── css/                     # Stylesheet files
│   ├── style.css            # Base styling
│   ├── dat-gui.css          # GUI component styling
│   └── dark-theme.css       # Dark theme styling
├── images/                  # Image assets
├── src/                     # Source code
│   ├── app.ts               # Application entry point
│   ├── components/          # UI components
│   ├── core/                # Core application logic
│   ├── geom/                # Geometric utilities
│   ├── lib/                 # Libraries and utilities
│   ├── model/               # Data models
│   ├── pages/               # Page components
│   ├── types/               # TypeScript definitions
│   └── visualizer/          # Visualization components
└── webpack.config.js        # Webpack configuration
```

## Recent Fixes & Improvements

- **Vehicle Despawning**: Vehicles now properly despawn when leaving the layout
- **Collision Avoidance**: Enhanced logic to prevent vehicles from passing through each other
- **Simulation Reset**: Fixed issues with the "Reset Simulation" button
- **Layout Loading**: Improved layout loading in simulation mode
- **Consistent Dark Theme**: Fixed styling issues to ensure consistent dark theme application
- **Performance Optimizations**: Improved rendering and simulation performance

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the original [RoadTrafficSimulator](https://github.com/volkhin/RoadTrafficSimulator) by Valery Volkhin
- Modernized with TypeScript and improved architecture
