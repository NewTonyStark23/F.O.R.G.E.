/**
 * FORGE PROTOCOL - Pattern Recognizer
 * 
 * Multi-dimensional pattern recognition:
 * - Time-series pattern detection
 * - Statistical pattern matching
 * - Anomaly detection
 * - Trend analysis
 * - Correlation analysis
 * - Confidence scoring
 */

export interface Pattern {
  id: string;
  name: string;
  type: 'reversal' | 'continuation' | 'breakout' | 'anomaly' | 'trend' | 'cycle';
  confidence: number; // 0-100
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  dataPoints: number;
  detectedAt: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  volume?: number;
}

export interface PatternConfig {
  minConfidence: number; // Minimum confidence to report (default: 60)
  lookbackPeriod: number; // Data points to analyze (default: 100)
  sensitivity: number; // Pattern detection sensitivity 0-1 (default: 0.7)
  enableAnomalyDetection: boolean;
  enableTrendAnalysis: boolean;
  enableCycleDetection: boolean;
}

export class PatternRecognizer {
  private config: PatternConfig;
  private detectedPatterns: Pattern[] = [];
  private patternCounter: number = 0;

  constructor(config: Partial<PatternConfig> = {}) {
    this.config = {
      minConfidence: config.minConfidence ?? 60,
      lookbackPeriod: config.lookbackPeriod ?? 100,
      sensitivity: config.sensitivity ?? 0.7,
      enableAnomalyDetection: config.enableAnomalyDetection ?? true,
      enableTrendAnalysis: config.enableTrendAnalysis ?? true,
      enableCycleDetection: config.enableCycleDetection ?? true,
    };
  }

  /**
   * Analyze time series data for patterns
   */
  analyze(data: TimeSeriesPoint[]): Pattern[] {
    if (data.length < 20) {
      console.log('[PATTERN] Insufficient data for pattern recognition');
      return [];
    }

    const patterns: Pattern[] = [];
    const lookback = data.slice(-this.config.lookbackPeriod);

    // Detect various pattern types
    if (this.config.enableTrendAnalysis) {
      patterns.push(...this.detectTrends(lookback));
    }

    patterns.push(...this.detectReversals(lookback));
    patterns.push(...this.detectBreakouts(lookback));
    
    if (this.config.enableAnomalyDetection) {
      patterns.push(...this.detectAnomalies(lookback));
    }

    if (this.config.enableCycleDetection) {
      patterns.push(...this.detectCycles(lookback));
    }

    // Filter by confidence
    const filtered = patterns.filter(p => p.confidence >= this.config.minConfidence);
    
    this.detectedPatterns.push(...filtered);
    
    console.log(`[PATTERN] Detected ${filtered.length} patterns (confidence >= ${this.config.minConfidence}%)`);
    
    return filtered;
  }

  /**
   * Detect trend patterns
   */
  private detectTrends(data: TimeSeriesPoint[]): Pattern[] {
    const patterns: Pattern[] = [];
    const values = data.map(d => d.value);
    
    // Linear regression for trend detection
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) * (i - xMean);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const trendStrength = Math.abs(slope) / yMean;
    
    if (trendStrength > 0.01) { // Significant trend
      const direction = slope > 0 ? 'bullish' : 'bearish';
      const confidence = Math.min(trendStrength * 1000, 95);
      
      patterns.push({
        id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
        name: `${direction === 'bullish' ? 'Uptrend' : 'Downtrend'} Detected`,
        type: 'trend',
        confidence,
        direction,
        timeframe: `${data.length} periods`,
        dataPoints: data.length,
        detectedAt: Date.now(),
        metadata: { slope, strength: trendStrength },
      });
    }

    return patterns;
  }

  /**
   * Detect reversal patterns (double top/bottom, head & shoulders, etc.)
   */
  private detectReversals(data: TimeSeriesPoint[]): Pattern[] {
    const patterns: Pattern[] = [];
    const values = data.map(d => d.value);
    const len = values.length;

    // Double Bottom detection
    if (len >= 20) {
      const firstThird = values.slice(0, Math.floor(len / 3));
      const middleThird = values.slice(Math.floor(len / 3), Math.floor(2 * len / 3));
      const lastThird = values.slice(Math.floor(2 * len / 3));

      const firstMin = Math.min(...firstThird);
      const lastMin = Math.min(...lastThird);
      const middleMax = Math.max(...middleThird);

      // Check for double bottom (W pattern)
      if (Math.abs(firstMin - lastMin) / firstMin < 0.02 && middleMax > firstMin * 1.05) {
        patterns.push({
          id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
          name: 'Double Bottom (W Pattern)',
          type: 'reversal',
          confidence: 75,
          direction: 'bullish',
          timeframe: `${data.length} periods`,
          dataPoints: data.length,
          detectedAt: Date.now(),
        });
      }

      // Double Top detection (M pattern)
      const firstMax = Math.max(...firstThird);
      const lastMax = Math.max(...lastThird);
      const middleMin = Math.min(...middleThird);

      if (Math.abs(firstMax - lastMax) / firstMax < 0.02 && middleMin < firstMax * 0.95) {
        patterns.push({
          id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
          name: 'Double Top (M Pattern)',
          type: 'reversal',
          confidence: 75,
          direction: 'bearish',
          timeframe: `${data.length} periods`,
          dataPoints: data.length,
          detectedAt: Date.now(),
        });
      }
    }

    return patterns;
  }

  /**
   * Detect breakout patterns
   */
  private detectBreakouts(data: TimeSeriesPoint[]): Pattern[] {
    const patterns: Pattern[] = [];
    const values = data.map(d => d.value);
    const len = values.length;

    if (len < 20) return patterns;

    // Calculate support and resistance
    const lookback = values.slice(-20, -1);
    const resistance = Math.max(...lookback);
    const support = Math.min(...lookback);
    const current = values[len - 1];

    // Breakout above resistance
    if (current > resistance * 1.01) {
      const breakoutStrength = (current - resistance) / resistance;
      patterns.push({
        id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
        name: 'Resistance Breakout',
        type: 'breakout',
        confidence: Math.min(60 + breakoutStrength * 1000, 90),
        direction: 'bullish',
        timeframe: `${data.length} periods`,
        dataPoints: data.length,
        detectedAt: Date.now(),
        metadata: { breakoutPercent: breakoutStrength * 100 },
      });
    }

    // Breakdown below support
    if (current < support * 0.99) {
      const breakdownStrength = (support - current) / support;
      patterns.push({
        id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
        name: 'Support Breakdown',
        type: 'breakout',
        confidence: Math.min(60 + breakdownStrength * 1000, 90),
        direction: 'bearish',
        timeframe: `${data.length} periods`,
        dataPoints: data.length,
        detectedAt: Date.now(),
        metadata: { breakdownPercent: breakdownStrength * 100 },
      });
    }

    return patterns;
  }

  /**
   * Detect anomalies using statistical methods
   */
  private detectAnomalies(data: TimeSeriesPoint[]): Pattern[] {
    const patterns: Pattern[] = [];
    const values = data.map(d => d.value);
    
    // Calculate mean and standard deviation
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Detect anomalies (values > 2 standard deviations from mean)
    const threshold = mean + stdDev * 2;
    const current = values[values.length - 1];
    
    if (Math.abs(current - mean) > stdDev * 2.5) {
      const zScore = (current - mean) / stdDev;
      const direction = zScore > 0 ? 'bullish' : 'bearish';
      
      patterns.push({
        id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
        name: `Statistical Anomaly (Z-Score: ${zScore.toFixed(2)})`,
        type: 'anomaly',
        confidence: Math.min(Math.abs(zScore) * 20, 95),
        direction,
        timeframe: `${data.length} periods`,
        dataPoints: data.length,
        detectedAt: Date.now(),
        metadata: { zScore, mean, stdDev },
      });
    }

    return patterns;
  }

  /**
   * Detect cyclical patterns using autocorrelation
   */
  private detectCycles(data: TimeSeriesPoint[]): Pattern[] {
    const patterns: Pattern[] = [];
    const values = data.map(d => d.value);
    const n = values.length;

    if (n < 30) return patterns;

    // Simple autocorrelation for cycle detection
    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;

    let bestLag = 0;
    let bestCorrelation = 0;

    // Check lags from 5 to n/3
    for (let lag = 5; lag < Math.floor(n / 3); lag++) {
      let correlation = 0;
      
      for (let i = 0; i < n - lag; i++) {
        correlation += (values[i] - mean) * (values[i + lag] - mean);
      }
      
      correlation /= (n - lag) * variance;
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    // If strong cycle detected
    if (bestCorrelation > 0.5 * this.config.sensitivity) {
      patterns.push({
        id: `PAT-${String(++this.patternCounter).padStart(4, '0')}`,
        name: `Cyclical Pattern (Period: ${bestLag})`,
        type: 'cycle',
        confidence: Math.min(bestCorrelation * 100, 90),
        direction: 'neutral',
        timeframe: `${bestLag} periods`,
        dataPoints: data.length,
        detectedAt: Date.now(),
        metadata: { period: bestLag, correlation: bestCorrelation },
      });
    }

    return patterns;
  }

  /**
   * Get all detected patterns
   */
  getPatterns(): Pattern[] {
    return [...this.detectedPatterns];
  }

  /**
   * Get patterns by type
   */
  getPatternsByType(type: Pattern['type']): Pattern[] {
    return this.detectedPatterns.filter(p => p.type === type);
  }

  /**
   * Clear detected patterns
   */
  clearPatterns(): void {
    this.detectedPatterns = [];
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalPatterns: this.detectedPatterns.length,
      byType: {
        reversal: this.detectedPatterns.filter(p => p.type === 'reversal').length,
        continuation: this.detectedPatterns.filter(p => p.type === 'continuation').length,
        breakout: this.detectedPatterns.filter(p => p.type === 'breakout').length,
        anomaly: this.detectedPatterns.filter(p => p.type === 'anomaly').length,
        trend: this.detectedPatterns.filter(p => p.type === 'trend').length,
        cycle: this.detectedPatterns.filter(p => p.type === 'cycle').length,
      },
      avgConfidence: this.detectedPatterns.length > 0
        ? this.detectedPatterns.reduce((sum, p) => sum + p.confidence, 0) / this.detectedPatterns.length
        : 0,
    };
  }
}

// Export singleton
export const patternRecognizer = new PatternRecognizer();
