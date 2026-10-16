# FORGE Protocol

**Forced Optimization. Relentless. Guaranteed Execution.**

A self-correcting AI agent tool library that brute-forces wins through continuous self-evaluation, pattern recognition, and automatic correction.

## What This Is

This is **NOT** a user panel or dashboard. This is a **tool library for AI agents** to import and use in their code.

- ✅ Import and use in your AI agent code
- ✅ Every engine self-evaluates and self-corrects until 100% score
- ✅ Includes Prompt Clarifier that understands typos and messy input
- ✅ Re-organizes sloppy prompts into clean structured format
- ❌ No UI for humans to click
- ❌ No interactive dashboard

## Core Principle

Every output flows through the **self-evaluation loop**:

```
EVALUATE → GRADE → IDENTIFY FAIL → CORRECT → RE-TEST
```

If it doesn't score 100%, the system identifies failures, applies corrections, and re-tests. This loops until the result is a **guaranteed win**. No task exits until it passes.

## Installation

```bash
npm install forge-protocol
```

## Quick Start

```typescript
import { 
  forge, 
  promptClarifier, 
  strategyEngine, 
  taskPlanner, 
  codeVetter, 
  patternRecognizer, 
  predictionEngine,
  createSelfEvalLoop 
} from 'forge-protocol';
```

## Features

### 1. Prompt Clarifier — Clean Messy Input

Takes sloppy, typo-ridden user input and re-organizes it into a clean structured prompt. Shows what the AI understood.

```typescript
const messyInput = "i wanna strading btc/usd on the 4h timefram make me a plan with entry and exit strats also check the news and sentemint";

const result = promptClarifier.clarify(messyInput);

// What the AI understood:
console.log(result.interpretation.summary);
// → "The user wants to trade involving BTC/USD in the trading domain..."

console.log(result.cleaned);
// → "I want trading BTC/USD on the 4h timeframe. Make me a plan with entry and exit strategies. Also check the news and sentiment."

console.log(result.structured);
// {
//   intent: "trade btc/usd",
//   domain: "trading",
//   entities: [{text: "btc/usd", type: "asset", normalized: "BTC/USD"}],
//   action: "trade",
//   priority: "medium"
// }
```

### 2. Self-Evaluation Loop — Brute Force to 100%

Any output goes through eval → grade → correct → re-test until it hits 100%.

```typescript
const evalLoop = createSelfEvalLoop({ maxIterations: 50, targetScore: 100 });

evalLoop.addCriteria({
  name: 'Code Quality',
  weight: 0.4,
  evaluate: (output) => ({
    score: output.qualityScore,
    passed: output.qualityScore >= 95,
    reason: output.qualityScore < 95 ? 'Below threshold' : 'OK'
  })
});

const result = await evalLoop.runLoop(initialOutput, async (output, corrections) => {
  // Apply corrections and return improved output
  return correctedOutput;
});

console.log(`Passed in ${result.iterations} iterations with score ${result.finalEval.overallScore}`);
```

### 3. Trading Strategy Engine

Generates self-evaluating strategies with pattern recognition, sentiment analysis, and auto-correction.

```typescript
strategyEngine.feedPriceData('BTC/USD', priceData);
strategyEngine.feedSentiment({ source: 'Twitter', score: 0.67, weight: 0.3, timestamp: Date.now(), dataPoints: 1000 });

const strategy = strategyEngine.generateStrategy('BTC/USD', '4h');

console.log(`Entry: $${strategy.entry} | Target: $${strategy.exit} | Stop: $${strategy.stopLoss}`);
console.log(`Confidence: ${strategy.confidence}% | R:R: ${strategy.riskRewardRatio}`);
```

### 4. Task Planner — Self-Correcting Execution

Plans tasks, resolves dependencies, generates optimized schedules. Failed tasks auto-retry with corrections.

```typescript
const taskId = taskPlanner.addTask({
  title: 'Review Q4 financial reports',
  priority: 'critical',
  category: 'finance',
  estimatedMinutes: 45,
  dependencies: [],
  maxAttempts: 3,
});

await taskPlanner.executeTask(taskId, async () => {
  return await reviewReports();
}, (result) => ({
  passed: result.quality > 0.9,
  reason: result.quality <= 0.9 ? 'Quality too low' : undefined
}));

const dayPlan = taskPlanner.generateDayPlan();
console.log(`Success probability: ${dayPlan.successProbability}%`);
```

### 5. Code Vetter — Real-Time Analysis

Analyzes code for security, performance, quality. Generates corrections. Predicts win probability.

```typescript
const result = await codeVetter.vet(myCode, 'typescript');

console.log(`Score: ${result.overallScore}/100`);
console.log(`Win Probability: ${result.winProbability}%`);

if (!result.passed) {
  result.corrections.forEach(c => console.log(`[FIX] ${c}`));
}
```

### 6. Pattern Recognizer

Detects trends, reversals, breakouts, anomalies, cycles in time-series data.

```typescript
const patterns = patternRecognizer.analyze(timeSeriesData);

patterns.forEach(p => {
  console.log(`[${p.type}] ${p.name} — Confidence: ${p.confidence}%`);
});
```

### 7. Prediction Engine — Win/Loss Forecasting

Predicts outcomes with self-calibrating models. Records actual outcomes to improve accuracy.

```typescript
const prediction = predictionEngine.predict({
  features: {
    confidence: 85,
    riskReward: 2.5,
    sentimentScore: 0.7,
  }
});

console.log(`Outcome: ${prediction.outcome} | Probability: ${prediction.probability}%`);

// Record actual outcome (model self-calibrates)
predictionEngine.recordOutcome(prediction, input, true);
```

### 8. Forge Engine — Core Task Execution

Execute any task with automatic self-evaluation. Brute-force parameter optimization.

```typescript
const result = await forge.executeTask(
  'my-task-001',
  async () => await doSomething(),
  (result) => ({
    score: calculateScore(result),
    passed: calculateScore(result) >= 95,
    issues: findIssues(result),
    corrections: generateCorrections(result),
    iteration: 1,
    timestamp: Date.now()
  })
);

// Brute-force optimize parameters
const { bestParams, bestScore } = await forge.bruteForceOptimize(
  () => generateRandomParams(),
  (params) => evaluateParams(params),
  1000
);
```

## Architecture

### Core Layer
- **ForgeEngine** — Task execution with auto-eval
- **SelfEvalLoop** — Brute-force correction to 100%
- **PredictionEngine** — Win/loss probability
- **PromptClarifier** — Clean messy input

### Domain Layer
- **StrategyEngine** — Trading strategies
- **TaskPlanner** — Schedule optimization
- **CodeVetter** — Real-time code analysis

### Analysis Layer
- **PatternRecognizer** — Multi-dimensional detection
- Sentiment aggregation from multiple sources
- Self-calibrating prediction models

## Philosophy

This tool exists because AI agents need to:

1. **Understand messy human input** — Users make typos, write run-on sentences, use ambiguous pronouns
2. **Self-correct until perfect** — No output should exit until it's a guaranteed win
3. **Brute-force optimization** — Test 1000 parameter combinations if needed
4. **Learn from outcomes** — Record wins/losses and self-calibrate models
5. **Plan and execute autonomously** — Resolve dependencies, optimize schedules, retry on failure

Every engine in FORGE Protocol follows the same principle: **evaluate → grade → correct → re-test → repeat until 100%**.

## License

MIT

## Version

1.0.0
