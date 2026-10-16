/**
 * FORGE PROTOCOL - Prediction Engine
 * 
 * Win/loss prediction with:
 * - Historical pattern matching
 * - Bayesian probability
 * - Confidence intervals
 * - Risk assessment
 * - Self-calibrating accuracy
 */

export interface PredictionInput {
  features: Record<string, number>; // Feature vector
  context?: string;
  historicalData?: Array<{ features: Record<string, number>; outcome: boolean }>;
}

export interface Prediction {
  outcome: 'win' | 'loss';
  probability: number; // 0-100
  confidence: number; // 0-100
  factors: Array<{ name: string; impact: number; direction: 'positive' | 'negative' }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  timestamp: number;
}

export interface PredictionModel {
  name: string;
  weights: Record<string, number>;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
}

export interface PredictionConfig {
  minConfidence: number; // Minimum confidence to make prediction (default: 70)
  riskThreshold: number; // Probability threshold for "win" (default: 60)
  enableBayesian: boolean; // Use Bayesian updating (default: true)
  selfCalibrate: boolean; // Auto-calibrate based on outcomes (default: true)
  historySize: number; // Max history to keep (default: 1000)
}

export class PredictionEngine {
  private config: PredictionConfig;
  private models: Map<string, PredictionModel> = new Map();
  private history: Array<{ prediction: Prediction; actual: boolean; input: PredictionInput }> = [];
  private defaultModel: PredictionModel;

  constructor(config: Partial<PredictionConfig> = {}) {
    this.config = {
      minConfidence: config.minConfidence ?? 70,
      riskThreshold: config.riskThreshold ?? 60,
      enableBayesian: config.enableBayesian ?? true,
      selfCalibrate: config.selfCalibrate ?? true,
      historySize: config.historySize ?? 1000,
    };

    // Initialize default model with equal weights
    this.defaultModel = {
      name: 'default',
      weights: {},
      accuracy: 50,
      totalPredictions: 0,
      correctPredictions: 0,
    };
    this.models.set('default', this.defaultModel);
  }

  /**
   * Make a prediction
   */
  predict(input: PredictionInput, modelName: string = 'default'): Prediction {
    const model = this.models.get(modelName) ?? this.defaultModel;
    
    // Calculate weighted score from features
    let score = 0;
    const factors: Prediction['factors'] = [];

    for (const [feature, value] of Object.entries(input.features)) {
      const weight = model.weights[feature] ?? 1; // Default weight of 1
      const contribution = value * weight;
      score += contribution;

      factors.push({
        name: feature,
        impact: Math.abs(contribution),
        direction: contribution > 0 ? 'positive' : 'negative',
      });
    }

    // Normalize score to probability (0-100)
    const rawProbability = this.sigmoid(score);
    const probability = rawProbability * 100;

    // Calculate confidence based on model accuracy and data quality
    const dataQuality = Object.keys(input.features).length > 0 ? 1 : 0;
    const confidence = model.accuracy * dataQuality;

    // Determine outcome
    const outcome: Prediction['outcome'] = probability >= this.config.riskThreshold ? 'win' : 'loss';

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(probability, confidence);

    // Generate recommendation
    const recommendation = this.generateRecommendation(probability, confidence, riskLevel);

    const prediction: Prediction = {
      outcome,
      probability,
      confidence,
      factors: factors.sort((a, b) => b.impact - a.impact),
      riskLevel,
      recommendation,
      timestamp: Date.now(),
    };

    // Store in history
    this.history.push({ prediction, actual: false, input });
    if (this.history.length > this.config.historySize) {
      this.history = this.history.slice(-this.config.historySize);
    }

    model.totalPredictions++;

    console.log(`[PREDICT] ${outcome.toUpperCase()} | Prob: ${probability.toFixed(1)}% | Confidence: ${confidence.toFixed(1)}% | Risk: ${riskLevel}`);

    return prediction;
  }

  /**
   * Record actual outcome and update model
   */
  recordOutcome(prediction: Prediction, input: PredictionInput, actualWin: boolean): void {
    // Find and update the prediction in history
    const historyEntry = this.history.find(h => h.prediction === prediction);
    if (historyEntry) {
      historyEntry.actual = actualWin;
    }

    // Update model accuracy
    const model = this.defaultModel;
    const wasCorrect = (prediction.outcome === 'win' && actualWin) || 
                       (prediction.outcome === 'loss' && !actualWin);
    
    if (wasCorrect) {
      model.correctPredictions++;
    }

    model.accuracy = model.totalPredictions > 0
      ? (model.correctPredictions / model.totalPredictions) * 100
      : 50;

    // Self-calibrate weights if enabled
    if (this.config.selfCalibrate && this.history.length >= 10) {
      this.calibrateModel(model);
    }

    console.log(`[PREDICT] Outcome recorded: ${actualWin ? 'WIN' : 'LOSS'} | Model accuracy: ${model.accuracy.toFixed(1)}%`);
  }

  /**
   * Calibrate model weights based on historical performance
   */
  private calibrateModel(model: PredictionModel): void {
    // Get recent history with actual outcomes
    const recentHistory = this.history
      .filter(h => h.actual !== undefined)
      .slice(-100);

    if (recentHistory.length < 10) return;

    // Calculate feature importance based on correlation with outcomes
    const featureCorrelations: Record<string, number> = {};

    for (const entry of recentHistory) {
      const outcome = entry.actual ? 1 : -1;
      
      for (const [feature, value] of Object.entries(entry.input.features)) {
        if (!featureCorrelations[feature]) {
          featureCorrelations[feature] = 0;
        }
        featureCorrelations[feature] += value * outcome;
      }
    }

    // Normalize and update weights
    const totalCorrelation = Object.values(featureCorrelations).reduce((sum, c) => sum + Math.abs(c), 0);
    
    if (totalCorrelation > 0) {
      for (const feature of Object.keys(featureCorrelations)) {
        model.weights[feature] = featureCorrelations[feature] / totalCorrelation;
      }
    }

    console.log(`[PREDICT] Model calibrated with ${recentHistory.length} samples`);
  }

  /**
   * Sigmoid function for normalization
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(probability: number, confidence: number): Prediction['riskLevel'] {
    if (probability >= 80 && confidence >= 80) return 'low';
    if (probability >= 60 && confidence >= 60) return 'medium';
    if (probability >= 40) return 'high';
    return 'critical';
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(probability: number, confidence: number, riskLevel: string): string {
    if (probability >= 80 && confidence >= 75) {
      return 'STRONG EXECUTE - High probability with good confidence';
    }
    if (probability >= 65 && confidence >= 60) {
      return 'EXECUTE - Favorable odds with acceptable risk';
    }
    if (probability >= 50 && confidence >= 50) {
      return 'CAUTIOUS EXECUTE - Marginal edge, proceed with caution';
    }
    if (probability >= 40) {
      return 'HOLD - Insufficient edge, wait for better setup';
    }
    return 'AVOID - Negative expected value, do not proceed';
  }

  /**
   * Create a new prediction model
   */
  createModel(name: string, initialWeights?: Record<string, number>): PredictionModel {
    const model: PredictionModel = {
      name,
      weights: initialWeights ?? {},
      accuracy: 50,
      totalPredictions: 0,
      correctPredictions: 0,
    };
    this.models.set(name, model);
    return model;
  }

  /**
   * Get model by name
   */
  getModel(name: string): PredictionModel | undefined {
    return this.models.get(name);
  }

  /**
   * Get all models
   */
  getModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Get prediction history
   */
  getHistory(): Array<{ prediction: Prediction; actual: boolean; input: PredictionInput }> {
    return [...this.history];
  }

  /**
   * Get statistics
   */
  getStats() {
    const models = Array.from(this.models.values());
    const totalPredictions = models.reduce((sum, m) => sum + m.totalPredictions, 0);
    const totalCorrect = models.reduce((sum, m) => sum + m.correctPredictions, 0);
    const avgAccuracy = models.length > 0
      ? models.reduce((sum, m) => sum + m.accuracy, 0) / models.length
      : 50;

    return {
      totalModels: models.length,
      totalPredictions,
      totalCorrect,
      overallAccuracy: totalPredictions > 0 ? (totalCorrect / totalPredictions) * 100 : 50,
      avgAccuracy,
      historySize: this.history.length,
    };
  }

  /**
   * Batch predict multiple inputs
   */
  batchPredict(inputs: PredictionInput[], modelName: string = 'default'): Prediction[] {
    return inputs.map(input => this.predict(input, modelName));
  }

  /**
   * Get win/loss ratio from history
   */
  getWinLossRatio(): { wins: number; losses: number; ratio: number } {
    const actualResults = this.history.filter(h => h.actual !== undefined);
    const wins = actualResults.filter(h => h.actual).length;
    const losses = actualResults.filter(h => !h.actual).length;
    const ratio = losses > 0 ? wins / losses : wins;

    return { wins, losses, ratio };
  }
}

// Export singleton
export const predictionEngine = new PredictionEngine();
