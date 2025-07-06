import '../helpers';
import Tool = require('./tool');
import Road = require('../model/road');

class ToolRoadBuilder extends Tool {
  public sourceIntersection: any;
  public road: any;
  public dualRoad: any;

  constructor(visualizer: any, autobind?: boolean) {
    super(visualizer, autobind);
    this.sourceIntersection = null;
    this.road = null;
    this.dualRoad = null;
  }

  mousedown(e: any): void {
    console.log('RoadBuilder mousedown - shift:', e.shiftKey);
    const cell = this.getCell(e);
    const hoveredIntersection = this.getHoveredIntersection(cell);
    console.log('Hovered intersection:', hoveredIntersection);
    if (e.shiftKey && hoveredIntersection) {
      console.log('Starting road from intersection:', hoveredIntersection.id);
      this.sourceIntersection = hoveredIntersection;
      e.stopImmediatePropagation();
    }
  }

  mouseup(e: any): void {
    if (this.road) {
      this.visualizer.world.addRoad(this.road);
    }
    if (this.dualRoad) {
      this.visualizer.world.addRoad(this.dualRoad);
    }
    this.road = this.dualRoad = this.sourceIntersection = null;
  }

  mousemove(e: any): void {
    const cell = this.getCell(e);
    const hoveredIntersection = this.getHoveredIntersection(cell);
    if (this.sourceIntersection && hoveredIntersection && 
        this.sourceIntersection.id !== hoveredIntersection.id) {
      if (this.road) {
        this.road.target = hoveredIntersection;
        this.dualRoad.source = hoveredIntersection;
      } else {
        this.road = new Road(this.sourceIntersection, hoveredIntersection);
        this.dualRoad = new Road(hoveredIntersection, this.sourceIntersection);
      }
    } else {
      this.road = this.dualRoad = null;
    }
  }

  mouseout(e: any): void {
    this.road = this.dualRoad = this.sourceIntersection = null;
  }

  draw(): void {
    if (this.road) {
      this.visualizer.drawRoad(this.road, 0.4);
    }
    if (this.dualRoad) {
      this.visualizer.drawRoad(this.dualRoad, 0.4);
    }
  }
}

export = ToolRoadBuilder;
