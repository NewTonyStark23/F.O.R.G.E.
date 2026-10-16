/**
 * FORGE PROTOCOL - Self-Evaluation Loop
 * 
 * Core self-correction engine that:
 * 1. Evaluates any output/task
 * 2. Grades it against criteria
 * 3. Identifies specific failures
 * 4. Generates corrections
 * 5. Re-tests until 100% score
 * 6. Never exits the loop until guaranteed win
 */

export interface EvalCriteria {
  name: string;
  weight: number; // 0-1 importance weight
  evaluate: (output: any) => { score: number; passed: boolean; reason: string };
}

export interface EvalResult {
  overallScore: number;
  passed: boolean;
  criteriaResults: Array<{
    name: string;
    score: number;
    weight: number;
    passed: boolean;
    reason: string;
  }>;
  failures: string[];
  corrections: Array<{
    issue: string;
    correction: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
  iteration: number;
  timestamp: number;
}

export interface CorrectionStrategy {
  name: string;
  detect: (output: any, evalResult: EvalResult) => boolean;
  apply: (output: any, failures: string[]) => any;
}

export class SelfEvalLoop {
  private criteria: EvalCriteria[] = [];
  private correctionStrategies: CorrectionStrategy[] = [];
  private history: EvalResult[] = [];
  private maxIterations: number;
  private targetScore: number;
  private currentIteration: number = 0;

  constructor(config: { maxIterations?: number; targetScore?: number } = {}) {
    this.maxIterations = config.maxIterations ?? 50;
    this.targetScore = config.targetScore ?? 100;
  }

  /**
   * Add evaluation criteria
   */
  addCriteria(criteria: EvalCriteria): SelfEvalLoop {
    this.criteria.push(criteria);
    return this;
  }

  /**
   * Add correction strategy
   */
  addCorrectionStrategy(strategy: CorrectionStrategy): SelfEvalLoop {
    this.correctionStrategies.push(strategy);
    return this;
  }

  /**
   * Evaluate output against all criteria
   */
  evaluate(output: any): EvalResult {
    this.currentIteration++;
    
    const criteriaResults = this.criteria.map(criterion => {
      const result = criterion.evaluate(output);
      return {
        name: criterion.name,
        score: result.score,
        weight: criterion.weight,
        passed: result.passed,
        reason: result.reason,
      };
    });

    // Calculate weighted overall score
    const totalWeight = this.criteria.reduce((sum, c) => sum + c.weight, 0);
    const overallScore = totalWeight > 0
      ? criteriaResults.reduce((sum, r) => sum + (r.score * r.weight), 0) / totalWeight
      : 0;

    const passed = overallScore >= this.targetScore;
    const failures = criteriaResults
      .filter(r => !r.passed)
      .map(r => `${r.name}: ${r.reason}`);

    // Generate corrections
    const corrections = this.generateCorrections(output, {
      overallScore,
      passed,
      criteriaResults,
      failures,
      corrections: [],
      iteration: this.currentIteration,
      timestamp: Date.now(),
    });

    const result: EvalResult = {
      overallScore,
      passed,
      criteriaResults,
      failures,
      corrections,
      iteration: this.currentIteration,
      timestamp: Date.now(),
    };

    this.history.push(result);
    return result;
  }

  /**
   * Run the full self-correction loop on an output
   * Returns the corrected output when it passes
   */
  async runLoop<T>(
    initialOutput: T,
    corrector: (output: T, corrections: EvalResult['corrections']) => Promise<T>
  ): Promise<{ output: T; finalEval: EvalResult; iterations: number }> {
    let currentOutput = initialOutput;
    let evalResult = this.evaluate(currentOutput);
    let iterations = 0;

    while (!evalResult.passed && iterations < this.maxIterations) {
      iterations++;
      
      if (evalResult.corrections.length === 0) {
        throw new Error(`Self-eval loop stuck at score ${evalResult.overallScore} with no corrections available`);
      }

      // Apply corrections
      currentOutput = await corrector(currentOutput, evalResult.corrections);
      
      // Re-evaluate
      evalResult = this.evaluate(currentOutput);
    }

    if (!evalResult.passed) {
      throw new Error(`Self-eval loop failed to reach target score ${this.targetScore} after ${iterations} iterations. Final score: ${evalResult.overallScore}`);
    }

    return { output: currentOutput, finalEval: evalResult, iterations };
  }

  /**
   * Generate corrections based on failures
   */
  private generateCorrections(output: any, evalResult: EvalResult): EvalResult['corrections'] {
    const corrections: EvalResult['corrections'] = [];

    // Run each correction strategy
    for (const strategy of this.correctionStrategies) {
      if (strategy.detect(output, evalResult)) {
        // Strategy detected an applicable correction
        const correctedOutput = strategy.apply(output, evalResult.failures);
        corrections.push({
          issue: `Detected by: ${strategy.name}`,
          correction: `Applied strategy: ${strategy.name}`,
          priority: 'high',
        });
      }
    }

    // Generate corrections for each failed criterion
    for (const result of evalResult.criteriaResults) {
      if (!result.passed) {
        corrections.push({
          issue: `${result.name} failed: ${result.reason}`,
          correction: this.suggestCorrection(result.name, result.reason),
          priority: result.score < 50 ? 'critical' : result.score < 75 ? 'high' : 'medium',
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    corrections.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return corrections;
  }

  /**
   * Suggest a correction based on the failure
   */
  private suggestCorrection(criterionName: string, reason: string): string {
    // AI agents should override this with domain-specific correction logic
    // This is a generic fallback
    return `Fix ${criterionName}: ${reason}`;
  }

  /**
   * Get evaluation history
   */
  getHistory(): EvalResult[] {
    return [...this.history];
  }

  /**
   * Get improvement trajectory
   */
  getImprovementTrajectory(): Array<{ iteration: number; score: number }> {
    return this.history.map(h => ({
      iteration: h.iteration,
      score: h.overallScore,
    }));
  }

  /**
   * Get current iteration
   */
  getCurrentIteration(): number {
    return this.currentIteration;
  }

  /**
   * Reset the loop
   */
  reset(): void {
    this.history = [];
    this.currentIteration = 0;
  }

  /**
   * Get statistics about the loop performance
   */
  getStats() {
    if (this.history.length === 0) {
      return {
        totalEvaluations: 0,
        averageScore: 0,
        improvementRate: 0,
        totalCorrections: 0,
      };
    }

    const firstScore = this.history[0].overallScore;
    const lastScore = this.history[this.history.length - 1].overallScore;
    const totalCorrections = this.history.reduce((sum, h) => sum + h.corrections.length, 0);

    return {
      totalEvaluations: this.history.length,
      averageScore: this.history.reduce((sum, h) => sum + h.overallScore, 0) / this.history.length,
      improvementRate: lastScore - firstScore,
      totalCorrections,
      firstScore,
      lastScore,
      currentIteration: this.currentIteration,
    };
  }
}

// Factory function for quick setup
export function createSelfEvalLoop(config?: { maxIterations?: number; targetScore?: number }): SelfEvalLoop {
  return new SelfEvalLoop(config);
}
