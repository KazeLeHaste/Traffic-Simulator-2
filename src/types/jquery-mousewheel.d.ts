declare module 'jquery-mousewheel' {
  import $ = require('jquery');
  export = $;
}

interface JQueryMousewheelEvent extends JQueryEventObject {
  deltaY: number;
  deltaFactor: number;
  deltaX?: number;
  originalEvent?: WheelEvent;
}

interface JQuery {
  mousewheel(handler: (event: JQueryMousewheelEvent) => any): JQuery;
}
