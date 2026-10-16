/**
 * FORGE PROTOCOL
 * Forced Optimization. Relentless. Guaranteed Execution.
 * 
 * A self-correcting AI agent framework that brute-forces wins through
 * continuous self-evaluation, pattern recognition, and automatic correction.
 * 
 * @module forge-protocol
 */

// Core Engine
export { ForgeEngine, forge } from './ForgeEngine';
export type { ForgeConfig, EvaluationResult, TaskExecution } from './ForgeEngine';

// Self-Evaluation Loop
export { SelfEvalLoop, createSelfEvalLoop } from './SelfEvalLoop';
export type { EvalCriteria, EvalResult, CorrectionStrategy } from './SelfEvalLoop';

// Strategy Engine (Trading)
export { StrategyEngine, strategyEngine } from './StrategyEngine';
export type { 
  Strategy, StrategyType, Timeframe, Signal, SignalStrength,
  PriceData, SentimentData, StrategyConfig 
} from './StrategyEngine';

// Task Planner
export { TaskPlanner, taskPlanner } from './TaskPlanner';
export type { 
  Task, TaskPriority, TaskStatus, TaskCategory,
  ScheduleBlock, DayPlan, PlannerConfig 
} from './TaskPlanner';

// Code Vetter
export { CodeVetter, codeVetter } from './CodeVetter';
export type { 
  CodeAnalysis, CodeIssue, CodeMetrics, TestResult, VetResult, VetterConfig 
} from './CodeVetter';

// Pattern Recognizer
export { PatternRecognizer, patternRecognizer } from './PatternRecognizer';
export type { 
  Pattern, TimeSeriesPoint, PatternConfig 
} from './PatternRecognizer';

// Prediction Engine
export { PredictionEngine, predictionEngine } from './PredictionEngine';
export type { 
  Prediction, PredictionInput, PredictionModel, PredictionConfig 
} from './PredictionEngine';

// Version
export const VERSION = '1.0.0';
