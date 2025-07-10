/**
 * BenchmarkRecommender - Generates recommendations based on benchmark comparison data
 * 
 * This module analyzes KPI data from benchmark runs and provides natural language
 * recommendations about which benchmark run performs better based on key metrics.
 */

/**
 * Configuration for each KPI metric, defining whether higher or lower values are better
 */
export interface KPIMetricConfig {
  key: string;         // Property name in the metrics object
  label: string;       // Human-readable label
  higherIsBetter: boolean; // Whether a higher value is better
  weight: number;      // Importance weight (1-10)
  unit?: string;       // Optional unit for display
}

/**
 * Default KPI metric configurations
 */
export const defaultKPIMetricConfigs: KPIMetricConfig[] = [
  { key: 'averageSpeed', label: 'Average Speed', higherIsBetter: true, weight: 8, unit: 'm/s' },
  { key: 'globalThroughput', label: 'Global Throughput', higherIsBetter: true, weight: 9, unit: 'veh/min' },
  { key: 'averageWaitTime', label: 'Average Wait Time', higherIsBetter: false, weight: 7, unit: 's' },
  { key: 'congestionIndex', label: 'Congestion Index', higherIsBetter: false, weight: 8 },
  { key: 'completedTrips', label: 'Completed Trips', higherIsBetter: true, weight: 6 },
  { key: 'totalStops', label: 'Total Stops', higherIsBetter: false, weight: 5 }
];

/**
 * Result of a metric comparison between two benchmark runs
 */
export interface MetricComparisonResult {
  metric: KPIMetricConfig;
  run1Value: number;
  run2Value: number;
  difference: number;
  percentDifference: number;
  betterRun: 1 | 2 | null; // 1, 2, or null if tied
  significantDifference: boolean; // true if the difference is considered significant
}

/**
 * Overall recommendation based on benchmark comparison
 */
export interface BenchmarkRecommendation {
  preferredRun: 1 | 2 | null; // null if tied
  confidenceScore: number;    // 0-1 indicating how confident the recommendation is
  betterMetricsRun1: KPIMetricConfig[];
  betterMetricsRun2: KPIMetricConfig[];
  tiedMetrics: KPIMetricConfig[];
  significantAdvantages: string[]; // List of significant advantages for the preferred run
  recommendationText: string;      // Natural language recommendation
}

/**
 * Configuration for recommendation generation
 */
interface RecommendationConfig {
  significanceThreshold: number; // Percentage difference threshold to consider a difference significant
  confidenceThreshold: number;   // Threshold for high confidence recommendation
  metricConfigs: KPIMetricConfig[];
}

const DEFAULT_CONFIG: RecommendationConfig = {
  significanceThreshold: 5, // 5% difference is considered significant
  confidenceThreshold: 0.7, // 70% of weighted metrics should favor one run for high confidence
  metricConfigs: defaultKPIMetricConfigs
};

/**
 * Analyzes two benchmark runs and generates a recommendation
 * 
 * @param run1Metrics The metrics from the first benchmark run
 * @param run2Metrics The metrics from the second benchmark run
 * @param config Optional configuration for recommendation generation
 * @returns A recommendation object with detailed analysis
 */
export function generateBenchmarkRecommendation(
  run1Metrics: any, 
  run2Metrics: any, 
  config: Partial<RecommendationConfig> = {}
): BenchmarkRecommendation {
  // Merge provided config with defaults
  const fullConfig: RecommendationConfig = { 
    ...DEFAULT_CONFIG,
    ...config,
    metricConfigs: config.metricConfigs || DEFAULT_CONFIG.metricConfigs
  };

  // Compare each metric
  const comparisons: MetricComparisonResult[] = fullConfig.metricConfigs.map(metric => {
    const run1Value = run1Metrics[metric.key];
    const run2Value = run2Metrics[metric.key];
    const difference = run1Value - run2Value;
    const percentDifference = run2Value !== 0 ? (Math.abs(difference) / run2Value) * 100 : 0;
    
    // Determine which run is better for this metric
    let betterRun: 1 | 2 | null = null;
    if (Math.abs(difference) < 0.001) { // Handle effectively equal values
      betterRun = null; // Tied
    } else if ((metric.higherIsBetter && difference > 0) || (!metric.higherIsBetter && difference < 0)) {
      betterRun = 1;
    } else {
      betterRun = 2;
    }

    return {
      metric,
      run1Value,
      run2Value,
      difference,
      percentDifference,
      betterRun,
      significantDifference: percentDifference >= fullConfig.significanceThreshold
    };
  });

  // Separate metrics by which run is better
  const betterMetricsRun1 = comparisons
    .filter(c => c.betterRun === 1)
    .map(c => c.metric);
  
  const betterMetricsRun2 = comparisons
    .filter(c => c.betterRun === 2)
    .map(c => c.metric);
  
  const tiedMetrics = comparisons
    .filter(c => c.betterRun === null)
    .map(c => c.metric);

  // Calculate weighted score for each run
  const totalWeight = fullConfig.metricConfigs.reduce((sum, metric) => sum + metric.weight, 0);
  
  const weightedScoreRun1 = comparisons
    .filter(c => c.betterRun === 1)
    .reduce((score, c) => score + c.metric.weight, 0);
  
  const weightedScoreRun2 = comparisons
    .filter(c => c.betterRun === 2)
    .reduce((score, c) => score + c.metric.weight, 0);

  // Determine preferred run
  let preferredRun: 1 | 2 | null = null;
  if (weightedScoreRun1 > weightedScoreRun2) {
    preferredRun = 1;
  } else if (weightedScoreRun2 > weightedScoreRun1) {
    preferredRun = 2;
  }

  // Calculate confidence score (0-1)
  const confidenceScore = preferredRun === null ? 
    0 : 
    (Math.abs(weightedScoreRun1 - weightedScoreRun2) / totalWeight);

  // Generate list of significant advantages for the preferred run
  const significantAdvantages = comparisons
    .filter(c => c.betterRun === preferredRun && c.significantDifference)
    .map(c => {
      const valueStr = c.betterRun === 1 ? 
        `${c.run1Value.toFixed(2)}${c.metric.unit || ''}` : 
        `${c.run2Value.toFixed(2)}${c.metric.unit || ''}`;
      
      const improvementStr = c.percentDifference.toFixed(1);
      return `${c.metric.label} (${valueStr}, ${improvementStr}% ${c.metric.higherIsBetter ? 'higher' : 'lower'})`;
    });

  // Generate recommendation text
  let recommendationText = generateRecommendationText(
    preferredRun,
    confidenceScore,
    fullConfig.confidenceThreshold,
    betterMetricsRun1,
    betterMetricsRun2,
    tiedMetrics,
    significantAdvantages
  );

  return {
    preferredRun,
    confidenceScore,
    betterMetricsRun1,
    betterMetricsRun2,
    tiedMetrics,
    significantAdvantages,
    recommendationText
  };
}

/**
 * Generates natural language recommendation text based on analysis
 */
function generateRecommendationText(
  preferredRun: 1 | 2 | null,
  confidenceScore: number,
  confidenceThreshold: number,
  betterMetricsRun1: KPIMetricConfig[],
  betterMetricsRun2: KPIMetricConfig[],
  tiedMetrics: KPIMetricConfig[],
  significantAdvantages: string[]
): string {
  if (preferredRun === null) {
    return "Both runs performed nearly identically across all key metrics. Either one could be used based on your specific requirements.";
  }

  const runName = `Run ${preferredRun}`;
  const otherRun = preferredRun === 1 ? 'Run 2' : 'Run 1';
  const betterMetrics = preferredRun === 1 ? betterMetricsRun1 : betterMetricsRun2;
  const worseMetrics = preferredRun === 1 ? betterMetricsRun2 : betterMetricsRun1;
  
  // Get top metrics names to highlight
  const topBetterMetrics = betterMetrics
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(m => m.label);

  if (confidenceScore > confidenceThreshold) {
    // Strong recommendation
    return `${runName} is clearly preferable, performing better in ${betterMetrics.length} out of ${betterMetrics.length + worseMetrics.length + tiedMetrics.length} key metrics. ${
      significantAdvantages.length > 0 ? 
        `Notable advantages include ${significantAdvantages.join(', ')}.` :
        `Key improvements were seen in ${topBetterMetrics.join(', ')}.`
    }`;
  } else if (betterMetrics.length > worseMetrics.length) {
    // Mixed results but still a preference
    return `${runName} appears slightly better overall, with advantages in ${topBetterMetrics.join(', ')}. However, ${otherRun} performs better in ${
      worseMetrics.map(m => m.label).join(', ')
    }. Consider which metrics align with your specific priorities.`;
  } else {
    // Very mixed results
    return `Results are mixed between the runs. ${runName} is better for ${
      topBetterMetrics.join(', ')
    }, while ${otherRun} performs better in ${
      worseMetrics.slice(0, 3).map(m => m.label).join(', ')
    }. Your choice depends on which metrics are most important for your use case.`;
  }
}
