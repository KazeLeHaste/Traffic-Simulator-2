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
    background: '#97a1a1',
    redLight: 'hsl(0, 100%, 50%)',
    greenLight: '#85ee00',
    intersection: '#586970',
    road: '#586970',
    roadMarking: '#bbb',
    hoveredIntersection: '#3d4c53',
    tempRoad: '#aaa',
    gridPoint: '#586970',
    grid1: 'rgba(255, 255, 255, 0.5)',
    grid2: 'rgba(220, 220, 220, 0.5)',
    hoveredGrid: '#f4e8e1'
  },
  fps: 30,
  lightsFlipInterval: 160,
  gridSize: 14,
  defaultTimeFactor: 5
};

export = settings;
