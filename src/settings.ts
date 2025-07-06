interface Settings {
  colors: {
    background: string;
    redLight: string;
    greenLight: string;
    intersection: string;
    road: string;
    roadMarking: string;
    hoveredIntersection: string;
    tempRoad: string;
    gridPoint: string;
    grid1: string;
    grid2: string;
    hoveredGrid: string;
  };
  fps: number;
  lightsFlipInterval: number;
  gridSize: number;
  defaultTimeFactor: number;
}

const settings: Settings = {
  colors: {
    background: '#1a1a1a',
    redLight: 'hsl(0, 100%, 50%)',
    greenLight: '#85ee00',
    intersection: '#4a4a4a',
    road: '#4a4a4a',
    roadMarking: '#666666',
    hoveredIntersection: '#606060',
    tempRoad: '#555555',
    gridPoint: '#404040',
    grid1: 'rgba(255, 255, 255, 0.1)',
    grid2: 'rgba(255, 255, 255, 0.05)',
    hoveredGrid: '#333333'
  },
  fps: 30,
  lightsFlipInterval: 160,
  gridSize: 14,
  defaultTimeFactor: 5
};

export = settings;
