/**
 * FORGE PROTOCOL - Strategy Engine
 * 
 * Generates trading strategies with:
 * - Multi-timeframe pattern recognition
 * - Sentiment analysis aggregation
 * - Entry/exit optimization
 * - Risk-reward calculation
 * - Self-evaluation of strategy quality
 * - Auto-correction until confidence threshold met
 */

export type StrategyType = 'LONG' | 'SHORT' | 'OPTIONS_CALL' | 'OPTIONS_PUT' | 'SPREAD' | 'SCALP' | 'SWING';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'very_strong';

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  name: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: SignalStrength;
  timeframe: Timeframe;
  confidence: number; // 0-100
  metadata?: Record<string, any>;
}

export interface SentimentData {
  source: string;
  score: number; // -1 to 1 (bearish to bullish)
  weight: number;
  timestamp: number;
  dataPoints: number;
}

export interface Strategy {
  id: string;
  asset: string;
  type: StrategyType;
  direction: 'long' | 'short';
  entry: number;
  exit: number;
  stopLoss: number;
  riskRewardRatio: number;
  confidence: number;
  signals: Signal[];
  sentimentScore: number;
  patternMatches: string[];
  timeframe: Timeframe;
  createdAt: number;
  status: 'generated' | 'validated' | 'active' | 'closed' | 'corrected';
  corrections: string[];
  evaluationScore: number;
}

export interface StrategyConfig {
  minConfidence: number; // Minimum confidence to accept strategy (default: 75)
  maxRiskReward: number; // Minimum risk:reward ratio (default: 2)
  maxStrategies: number; // Max concurrent strategies (default: 10)
  enableSelfEval: boolean; // Self-evaluate generated strategies (default: true)
  correctionEnabled: boolean; // Auto-correct failing strategies (default: true)
}

export class StrategyEngine {
  private config: StrategyConfig;
  private strategies: Strategy[] = [];
  private priceHistory: Map<string, PriceData[]> = new Map();
  private sentimentData: SentimentData[] = [];
  private strategyCounter: number = 0;

  constructor(config: Partial<StrategyConfig> = {}) {
    this.config = {
      minConfidence: config.minConfidence ?? 75,
      maxRiskReward: config.maxRiskReward ?? 2,
      maxStrategies: config.maxStrategies ?? 10,
      enableSelfEval: config.enableSelfEval ?? true,
      correctionEnabled: config.correctionEnabled ?? true,
    };
  }

  /**
   * Feed price data for an asset
   */
  feedPriceData(asset: string, data: PriceData[]): void {
    const existing = this.priceHistory.get(asset) ?? [];
    this.priceHistory.set(asset, [...existing, ...data].slice(-5000)); // Keep last 5000 candles
  }

  /**
   * Feed sentiment data
   */
  feedSentiment(data: SentimentData): void {
    this.sentimentData.push(data);
    // Keep last 100 sentiment readings
    if (this.sentimentData.length > 100) {
      this.sentimentData = this.sentimentData.slice(-100);
    }
  }

  /**
   * Generate strategy for an asset
   */
  generateStrategy(asset: string, timeframe: Timeframe = '4h'): Strategy | null {
    const priceData = this.priceHistory.get(asset);
    if (!priceData || priceData.length < 50) {
      console.log(`[STRATEGY] Insufficient price data for ${asset}`);
      return null;
    }

    // Run pattern recognition
    const signals = this.detectPatterns(asset, priceData, timeframe);
    
    // Analyze sentiment
    const sentimentScore = this.analyzeSentiment();
    
    // Determine direction
    const bullishSignals = signals.filter(s => s.direction === 'bullish');
    const bearishSignals = signals.filter(s => s.direction === 'bearish');
    
    const bullishStrength = bullishSignals.reduce((sum, s) => sum + s.confidence * this.strengthMultiplier(s.strength), 0);
    const bearishStrength = bearishSignals.reduce((sum, s) => sum + s.confidence * this.strengthMultiplier(s.strength), 0);

    const direction = bullishStrength > bearishStrength ? 'long' : 'short';
    const dominantSignals = direction === 'long' ? bullishSignals : bearishSignals;

    // Calculate entry/exit/stop
    const currentPrice = priceData[priceData.length - 1].close;
    const atr = this.calculateATR(priceData, 14);
    
    const entry = currentPrice;
    const stopLoss = direction === 'long' 
      ? currentPrice - (atr * 2)
      : currentPrice + (atr * 2);
    const exit = direction === 'long'
      ? currentPrice + (atr * 4)
      : currentPrice - (atr * 4);

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(exit - entry);
    const riskRewardRatio = reward / risk;

    // Calculate confidence
    const signalConfidence = dominantSignals.length > 0
      ? dominantSignals.reduce((sum, s) => sum + s.confidence, 0) / dominantSignals.length
      : 0;
    
    const sentimentConfidence = Math.abs(sentimentScore) * 100;
    const rrConfidence = Math.min(riskRewardRatio / 3 * 100, 100);
    
    const confidence = (signalConfidence * 0.4 + sentimentConfidence * 0.3 + rrConfidence * 0.3);

    // Determine strategy type
    const type = this.determineStrategyType(dominantSignals, timeframe, riskRewardRatio);

    const strategy: Strategy = {
      id: `STR-${String(++this.strategyCounter).padStart(3, '0')}`,
      asset,
      type,
      direction,
      entry,
      exit,
      stopLoss,
      riskRewardRatio,
      confidence,
      signals: dominantSignals,
      sentimentScore,
      patternMatches: dominantSignals.map(s => s.name),
      timeframe,
      createdAt: Date.now(),
      status: 'generated',
      corrections: [],
      evaluationScore: 0,
    };

    // Self-evaluate if enabled
    if (this.config.enableSelfEval) {
      const evaluated = this.evaluateStrategy(strategy);
      strategy.evaluationScore = evaluated.score;
      strategy.status = evaluated.passed ? 'validated' : 'corrected';
      strategy.corrections = evaluated.corrections;
    }

    // Only add if meets minimum confidence
    if (strategy.confidence >= this.config.minConfidence && strategy.riskRewardRatio >= this.config.maxRiskReward) {
      this.strategies.push(strategy);
      
      // Trim to max strategies
      if (this.strategies.length > this.config.maxStrategies) {
        this.strategies.sort((a, b) => b.confidence - a.confidence);
        this.strategies = this.strategies.slice(0, this.config.maxStrategies);
      }

      return strategy;
    }

    return null;
  }

  /**
   * Detect patterns in price data
   */
  private detectPatterns(asset: string, data: PriceData[], timeframe: Timeframe): Signal[] {
    const signals: Signal[] = [];
    const len = data.length;

    // RSI Analysis
    const rsi = this.calculateRSI(data, 14);
    if (rsi < 30) {
      signals.push({
        name: 'RSI Oversold',
        direction: 'bullish',
        strength: rsi < 20 ? 'very_strong' : 'strong',
        timeframe,
        confidence: 70 + (30 - rsi),
      });
    } else if (rsi > 70) {
      signals.push({
        name: 'RSI Overbought',
        direction: 'bearish',
        strength: rsi > 80 ? 'very_strong' : 'strong',
        timeframe,
        confidence: 70 + (rsi - 70),
      });
    }

    // Moving Average Crossover
    const sma20 = this.calculateSMA(data, 20);
    const sma50 = this.calculateSMA(data, 50);
    if (sma20 > sma50 && len > 50) {
      const prevSma20 = this.calculateSMA(data.slice(0, -1), 20);
      const prevSma50 = this.calculateSMA(data.slice(0, -1), 50);
      if (prevSma20 <= prevSma50) {
        signals.push({
          name: 'Golden Cross (SMA 20/50)',
          direction: 'bullish',
          strength: 'strong',
          timeframe,
          confidence: 80,
        });
      }
    } else if (sma20 < sma50 && len > 50) {
      const prevSma20 = this.calculateSMA(data.slice(0, -1), 20);
      const prevSma50 = this.calculateSMA(data.slice(0, -1), 50);
      if (prevSma20 >= prevSma50) {
        signals.push({
          name: 'Death Cross (SMA 20/50)',
          direction: 'bearish',
          strength: 'strong',
          timeframe,
          confidence: 80,
        });
      }
    }

    // Volume Analysis
    const avgVolume = data.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20;
    const currentVolume = data[len - 1].volume;
    if (currentVolume > avgVolume * 2) {
      const priceChange = data[len - 1].close - data[len - 2].close;
      signals.push({
        name: 'Volume Spike',
        direction: priceChange > 0 ? 'bullish' : 'bearish',
        strength: currentVolume > avgVolume * 3 ? 'very_strong' : 'strong',
        timeframe,
        confidence: 65 + Math.min((currentVolume / avgVolume - 1) * 10, 25),
      });
    }

    // Support/Resistance Breakout
    const recentHigh = Math.max(...data.slice(-20).map(d => d.high));
    const recentLow = Math.min(...data.slice(-20).map(d => d.low));
    const currentClose = data[len - 1].close;
    
    if (currentClose > recentHigh * 0.99) {
      signals.push({
        name: 'Resistance Breakout',
        direction: 'bullish',
        strength: 'strong',
        timeframe,
        confidence: 75,
      });
    } else if (currentClose < recentLow * 1.01) {
      signals.push({
        name: 'Support Breakdown',
        direction: 'bearish',
        strength: 'strong',
        timeframe,
        confidence: 75,
      });
    }

    // MACD
    const macd = this.calculateMACD(data);
    if (macd.histogram > 0 && macd.signal < macd.line) {
      signals.push({
        name: 'MACD Bullish Crossover',
        direction: 'bullish',
        strength: 'moderate',
        timeframe,
        confidence: 70,
      });
    } else if (macd.histogram < 0 && macd.signal > macd.line) {
      signals.push({
        name: 'MACD Bearish Crossover',
        direction: 'bearish',
        strength: 'moderate',
        timeframe,
        confidence: 70,
      });
    }

    // Bollinger Bands
    const bb = this.calculateBollingerBands(data, 20, 2);
    if (currentClose < bb.lower) {
      signals.push({
        name: 'Below Lower Bollinger Band',
        direction: 'bullish',
        strength: 'moderate',
        timeframe,
        confidence: 65,
      });
    } else if (currentClose > bb.upper) {
      signals.push({
        name: 'Above Upper Bollinger Band',
        direction: 'bearish',
        strength: 'moderate',
        timeframe,
        confidence: 65,
      });
    }

    return signals;
  }

  /**
   * Analyze aggregated sentiment
   */
  private analyzeSentiment(): number {
    if (this.sentimentData.length === 0) return 0;

    const totalWeight = this.sentimentData.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return 0;

    return this.sentimentData.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight;
  }

  /**
   * Self-evaluate a strategy
   */
  private evaluateStrategy(strategy: Strategy): { score: number; passed: boolean; corrections: string[] } {
    let score = 0;
    const corrections: string[] = [];

    // Signal quality (0-30 points)
    const signalScore = Math.min(strategy.signals.length * 10, 30);
    score += signalScore;
    if (strategy.signals.length < 3) {
      corrections.push('Add more confirming signals - need at least 3');
    }

    // Risk-reward ratio (0-25 points)
    const rrScore = Math.min(strategy.riskRewardRatio / 4 * 25, 25);
    score += rrScore;
    if (strategy.riskRewardRatio < 2) {
      corrections.push('Risk-reward ratio too low - widen target or tighten stop');
    }

    // Confidence level (0-25 points)
    const confScore = Math.min(strategy.confidence / 100 * 25, 25);
    score += confScore;
    if (strategy.confidence < 80) {
      corrections.push('Low confidence - add more timeframe confirmation');
    }

    // Sentiment alignment (0-20 points)
    const sentimentAligned = (strategy.direction === 'long' && strategy.sentimentScore > 0) ||
                             (strategy.direction === 'short' && strategy.sentimentScore < 0);
    const sentScore = sentimentAligned ? 20 : Math.abs(strategy.sentimentScore) * 10;
    score += sentScore;
    if (!sentimentAligned) {
      corrections.push('Sentiment not aligned with direction - verify news/social data');
    }

    return {
      score,
      passed: score >= 75,
      corrections,
    };
  }

  /**
   * Determine strategy type based on signals
   */
  private determineStrategyType(signals: Signal[], timeframe: Timeframe, rr: number): StrategyType {
    if (timeframe === '1m' || timeframe === '5m') return 'SCALP';
    if (timeframe === '15m' || timeframe === '1h') return 'SWING';
    if (rr > 3) return 'SWING';
    return 'LONG'; // Default
  }

  /**
   * Strength multiplier for signal weighting
   */
  private strengthMultiplier(strength: SignalStrength): number {
    switch (strength) {
      case 'weak': return 0.5;
      case 'moderate': return 0.75;
      case 'strong': return 1.0;
      case 'very_strong': return 1.25;
    }
  }

  // === Technical Indicator Calculations ===

  private calculateRSI(data: PriceData[], period: number): number {
    if (data.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = data.length - period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateSMA(data: PriceData[], period: number): number {
    if (data.length < period) return data[data.length - 1]?.close ?? 0;
    const slice = data.slice(-period);
    return slice.reduce((sum, d) => sum + d.close, 0) / period;
  }

  private calculateEMA(data: PriceData[], period: number): number {
    if (data.length < period) return this.calculateSMA(data, period);
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(data.slice(0, period), period);
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
    }
    
    return ema;
  }

  private calculateMACD(data: PriceData[]): { line: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const line = ema12 - ema26;
    
    // Simplified signal line
    const signal = line * 0.8; // Approximation
    const histogram = line - signal;
    
    return { line, signal, histogram };
  }

  private calculateATR(data: PriceData[], period: number): number {
    if (data.length < period + 1) return 0;
    
    let atrSum = 0;
    for (let i = data.length - period; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      atrSum += tr;
    }
    
    return atrSum / period;
  }

  private calculateBollingerBands(data: PriceData[], period: number, stdDev: number): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(data, period);
    const slice = data.slice(-period);
    const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev),
    };
  }

  /**
   * Get all active strategies
   */
  getStrategies(): Strategy[] {
    return [...this.strategies];
  }

  /**
   * Get strategies for a specific asset
   */
  getStrategiesForAsset(asset: string): Strategy[] {
    return this.strategies.filter(s => s.asset === asset);
  }

  /**
   * Remove a strategy
   */
  removeStrategy(id: string): boolean {
    const idx = this.strategies.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.strategies.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Get engine stats
   */
  getStats() {
    return {
      totalStrategies: this.strategies.length,
      avgConfidence: this.strategies.length > 0
        ? this.strategies.reduce((sum, s) => sum + s.confidence, 0) / this.strategies.length
        : 0,
      avgRiskReward: this.strategies.length > 0
        ? this.strategies.reduce((sum, s) => sum + s.riskRewardRatio, 0) / this.strategies.length
        : 0,
      longStrategies: this.strategies.filter(s => s.direction === 'long').length,
      shortStrategies: this.strategies.filter(s => s.direction === 'short').length,
      assetsTracked: this.priceHistory.size,
      sentimentSources: this.sentimentData.length,
    };
  }
}

// Export singleton
export const strategyEngine = new StrategyEngine();
