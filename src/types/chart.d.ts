declare module 'chart.js/auto' {
  import { Chart } from 'chart.js';
  export default Chart;
}

declare module 'chart.js' {
  export * from 'chart.js/types/index.esm';
}
