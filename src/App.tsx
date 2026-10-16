import { Flame, BookOpen, Code2, Terminal, Copy, CheckCircle2, Zap, Brain, Target, Shield } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    {
      title: 'Prompt Clarifier — Clean Messy Input',
      description: 'Takes sloppy, typo-ridden user input and re-organizes it into a clean structured prompt. Shows what the AI understood.',
      code: `import { promptClarifier } from 'forge-protocol';

// User sends messy input
const messyInput = "i wanna strading btc/usd on the 4h timefram make me a plan with entry and exit strats also check the news and sentemint";

// Clarify it
const result = promptClarifier.clarify(messyInput);

// What the AI understood:
console.log(result.interpretation.summary);
// → "The user wants to trade involving BTC/USD in the trading domain with 1 constraint(s)."

console.log(result.interpretation.keyPoints);
// → ["Intent: trade btc/usd", "Domain: trading", "Action: trade", "Priority: medium"]

console.log(result.interpretation.ambiguities);
// → ["No timeframe specified - assuming user wants general strategy"]

console.log(result.interpretation.suggestedClarifications);
// → ["Which specific asset(s)?", "What timeframe?"]

// Cleaned version:
console.log(result.cleaned);
// → "I want trading BTC/USD on the 4h timeframe. Make me a plan with entry and exit strategies. Also check the news and sentiment."

// Structured data for your AI agent:
console.log(result.structured);
// {
//   intent: "trade btc/usd",
//   domain: "trading",
//   entities: [{text: "btc/usd", type: "asset", normalized: "BTC/USD"}],
//   constraints: ["check the news and sentiment"],
//   action: "trade",
//   priority: "medium"
// }

// Corrections applied:
result.corrections.forEach(c => {
  console.log(\`[\${c.type}] "\${c.original}" → "\${c.corrected}"\`);
});
// [typo] "strading" → "trading"
// [typo] "timefram" → "timeframe"
// [typo] "sentemint" → "sentiment"`,
    },
    {
      title: 'Self-Evaluation Loop — Brute Force to 100%',
      description: 'Any output goes through eval → grade → correct → re-test until it hits 100%. No task exits until it passes.',
      code: `import { createSelfEvalLoop } from 'forge-protocol';

const evalLoop = createSelfEvalLoop({ maxIterations: 50, targetScore: 100 });

// Define what "passing" means for your task
evalLoop.addCriteria({
  name: 'Code Quality',
  weight: 0.4,
  evaluate: (output) => ({
    score: output.qualityScore,
    passed: output.qualityScore >= 95,
    reason: output.qualityScore < 95 ? 'Below threshold' : 'OK'
  })
});

evalLoop.addCriteria({
  name: 'Test Coverage',
  weight: 0.3,
  evaluate: (output) => ({
    score: output.coverage,
    passed: output.coverage >= 80,
    reason: output.coverage < 80 ? 'Insufficient tests' : 'OK'
  })
});

evalLoop.addCriteria({
  name: 'Security',
  weight: 0.3,
  evaluate: (output) => ({
    score: output.securityScore,
    passed: output.securityScore >= 90,
    reason: output.securityScore < 90 ? 'Vulnerabilities found' : 'OK'
  })
});

// Run the loop - auto-corrects until passing
const result = await evalLoop.runLoop(initialOutput, async (output, corrections) => {
  // Your AI agent applies corrections here
  // corrections = [{issue: "...", correction: "...", priority: "high"}]
  
  // Apply fixes and return improved output
  return correctedOutput;
});

// Result:
console.log(\`Passed in \${result.iterations} iterations\`);
console.log(\`Final score: \${result.finalEval.overallScore}/100\`);
console.log(\`Corrections applied: \${result.finalEval.corrections.length}\`);`,
    },
    {
      title: 'Trading Strategy Engine',
      description: 'Generates self-evaluating strategies with pattern recognition, sentiment analysis, and auto-correction.',
      code: `import { strategyEngine } from 'forge-protocol';

// Feed price data (OHLCV candles)
strategyEngine.feedPriceData('BTC/USD', priceData);

// Feed sentiment from multiple sources
strategyEngine.feedSentiment({
  source: 'Twitter',
  score: 0.67, // -1 (bearish) to 1 (bullish)
  weight: 0.3,
  timestamp: Date.now(),
  dataPoints: 1000
});

strategyEngine.feedSentiment({
  source: 'News API',
  score: 0.45,
  weight: 0.4,
  timestamp: Date.now(),
  dataPoints: 500
});

// Generate strategy (auto-evaluates and self-corrects)
const strategy = strategyEngine.generateStrategy('BTC/USD', '4h');

if (strategy) {
  console.log(\`Type: \${strategy.type} \${strategy.direction}\`);
  console.log(\`Entry: $\${strategy.entry} | Target: $\${strategy.exit} | Stop: $\${strategy.stopLoss}\`);
  console.log(\`Confidence: \${strategy.confidence}% | R:R: \${strategy.riskRewardRatio}\`);
  console.log(\`Signals: \${strategy.patternMatches.join(', ')}\`);
  console.log(\`Evaluation: \${strategy.evaluationScore}/100\`);
  
  // If corrections were needed:
  strategy.corrections.forEach(c => console.log(\`[CORRECT] \${c}\`));
}`,
    },
    {
      title: 'Task Planner — Self-Correcting Execution',
      description: 'Plans tasks, resolves dependencies, generates optimized schedules. Failed tasks auto-retry with corrections.',
      code: `import { taskPlanner } from 'forge-protocol';

// Add tasks
const task1 = taskPlanner.addTask({
  title: 'Review Q4 financial reports',
  priority: 'critical',
  category: 'finance',
  estimatedMinutes: 45,
  dependencies: [],
  maxAttempts: 3,
});

const task2 = taskPlanner.addTask({
  title: 'Prepare client presentation',
  priority: 'high',
  category: 'work',
  estimatedMinutes: 90,
  dependencies: [task1], // Must complete task1 first
  maxAttempts: 3,
});

// Execute with self-correction (retries on failure)
try {
  const result = await taskPlanner.executeTask(task1, async () => {
    return await reviewReports();
  }, (result) => ({
    passed: result.quality > 0.9,
    reason: result.quality <= 0.9 ? 'Quality too low' : undefined
  }));
} catch (error) {
  // Failed after max attempts
  console.log('Task failed:', error);
}

// Generate optimized daily schedule
const dayPlan = taskPlanner.generateDayPlan();
console.log(\`Tasks: \${dayPlan.totalTasks}\`);
console.log(\`Completion by: \${dayPlan.estimatedCompletion}\`);
console.log(\`Success probability: \${dayPlan.successProbability}%\`);
console.log(\`Risks: \${dayPlan.riskFactors.join(', ')}\`);`,
    },
    {
      title: 'Code Vetter — Real-Time Analysis',
      description: 'Analyzes code for security, performance, quality. Generates corrections. Predicts win probability.',
      code: `import { codeVetter } from 'forge-protocol';

// Vet any code
const result = await codeVetter.vet(myCode, 'typescript');

console.log(\`Score: \${result.overallScore}/100\`);
console.log(\`Passed: \${result.passed}\`);
console.log(\`Win Probability: \${result.winProbability}%\`);

// Detailed metrics
console.log('Security:', result.analysis.metrics.securityScore);
console.log('Performance:', result.analysis.metrics.performanceScore);
console.log('Complexity:', result.analysis.metrics.complexity);

// Issues found
result.analysis.issues.forEach(issue => {
  console.log(\`[\${issue.severity}] \${issue.message}\`);
  if (issue.suggestion) console.log(\`  → \${issue.suggestion}\`);
});

// Corrections needed
if (!result.passed) {
  result.corrections.forEach(c => {
    console.log(\`[FIX] \${c}\`);
  });
  
  // Apply corrections and re-vet
  const fixed = applyCorrections(myCode, result.corrections);
  const reVet = await codeVetter.vet(fixed, 'typescript');
}`,
    },
    {
      title: 'Pattern Recognizer',
      description: 'Detects trends, reversals, breakouts, anomalies, cycles in time-series data.',
      code: `import { patternRecognizer } from 'forge-protocol';

// Feed time-series data
const data = [
  { timestamp: Date.now() - 100000, value: 100, volume: 5000 },
  { timestamp: Date.now() - 90000, value: 102, volume: 5200 },
  // ... more points
];

// Analyze for patterns
const patterns = patternRecognizer.analyze(data);

patterns.forEach(p => {
  console.log(\`[\${p.type}] \${p.name}\`);
  console.log(\`  Direction: \${p.direction} | Confidence: \${p.confidence}%\`);
});

// Filter by type
const trends = patternRecognizer.getPatternsByType('trend');
const breakouts = patternRecognizer.getPatternsByType('breakout');
const anomalies = patternRecognizer.getPatternsByType('anomaly');`,
    },
    {
      title: 'Prediction Engine — Win/Loss Forecasting',
      description: 'Predicts outcomes with self-calibrating models. Records actual outcomes to improve accuracy.',
      code: `import { predictionEngine } from 'forge-protocol';

// Make prediction
const prediction = predictionEngine.predict({
  features: {
    confidence: 85,
    riskReward: 2.5,
    sentimentScore: 0.7,
    patternStrength: 0.8,
    volumeConfirmation: 0.9,
  }
});

console.log(\`Outcome: \${prediction.outcome}\`); // 'win' or 'loss'
console.log(\`Probability: \${prediction.probability}%\`);
console.log(\`Risk Level: \${prediction.riskLevel}\`);
console.log(\`Recommendation: \${prediction.recommendation}\`);

// After execution, record actual outcome (model self-calibrates)
predictionEngine.recordOutcome(prediction, input, true); // actual = win

// Get model stats
const stats = predictionEngine.getStats();
console.log(\`Model accuracy: \${stats.overallAccuracy}%\`);
console.log(\`Win/Loss: \${predictionEngine.getWinLossRatio()}\`);`,
    },
    {
      title: 'Forge Engine — Core Task Execution',
      description: 'Execute any task with automatic self-evaluation. Brute-force parameter optimization.',
      code: `import { forge } from 'forge-protocol';

// Execute task with auto-evaluation
const result = await forge.executeTask(
  'my-task-001',
  async () => {
    // Your task logic
    return await doSomething();
  },
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
const { bestParams, bestScore, attempts } = await forge.bruteForceOptimize(
  () => generateRandomParams(),
  (params) => evaluateParams(params),
  1000 // test 1000 combinations
);

console.log(\`Best score: \${bestScore} after \${attempts} attempts\`);

// Get overall stats
const stats = forge.getStats();
console.log(\`Win rate: \${stats.winRate}%\`);
console.log(\`Total iterations: \${stats.totalIterations}\`);`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-mono">
      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-[#0d0d14]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-emerald-400">FORGE</span>
                <span className="text-gray-400 ml-2">PROTOCOL</span>
                <span className="text-gray-600 text-xs ml-2">v1.0.0</span>
              </h1>
              <p className="text-xs text-gray-500 tracking-wider uppercase mt-0.5">
                Forced Optimization • Relentless • Guaranteed Execution
              </p>
              <p className="text-[11px] text-gray-600 mt-1">
                A tool library for AI agents. Not a user panel — import and use in your agent code.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Core Principle */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/30 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            CORE PRINCIPLE
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Every output flows through the <span className="text-emerald-400 font-bold">self-evaluation loop</span>.
            If it doesn't score 100%, the system identifies failures, applies corrections, and re-tests.
            This loops until the result is a <span className="text-emerald-400 font-bold">guaranteed win</span>.
            No task exits until it passes.
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {['EVALUATE', 'GRADE', 'IDENTIFY FAIL', 'CORRECT', 'RE-TEST'].map((step, i) => (
              <div key={i} className="p-2 rounded bg-[#0d0d14] border border-gray-800/30 text-center">
                <div className="text-[10px] font-bold text-purple-400">{step}</div>
                {i < 4 && <div className="text-[10px] text-gray-600 mt-0.5">→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* What This Is */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            WHAT THIS IS
          </h2>
          <div className="text-sm text-gray-400 space-y-2">
            <p>• A <span className="text-emerald-400">tool library</span> for AI agents to import and use in their code</p>
            <p>• <span className="text-emerald-400">Not a user panel</span> — there's no UI for humans to click</p>
            <p>• Includes a <span className="text-emerald-400">Prompt Clarifier</span> that understands typos, slop, and messy input</p>
            <p>• Re-organizes messy prompts into clean structured format so the AI can see what it understood</p>
            <p>• Every engine self-evaluates and self-corrects until 100% score is achieved</p>
          </div>
        </div>

        {/* Quick Import */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              QUICK IMPORT
            </h3>
            <button
              onClick={() => copyCode("import { forge, promptClarifier, strategyEngine, taskPlanner, codeVetter, patternRecognizer, predictionEngine, createSelfEvalLoop } from 'forge-protocol';", 'quick-import')}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-gray-800 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              {copied === 'quick-import' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === 'quick-import' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-[#0a0a0f] rounded-lg p-4 text-xs text-emerald-400 overflow-x-auto">
            <code>{"import { forge, promptClarifier, strategyEngine, taskPlanner, codeVetter, patternRecognizer, predictionEngine, createSelfEvalLoop } from 'forge-protocol';"}</code>
          </pre>
        </div>

        {/* API Sections */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            API REFERENCE
          </h2>
          
          {sections.map((section, i) => (
            <div key={i} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-400" />
                    {section.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">{section.description}</p>
                </div>
                <button
                  onClick={() => copyCode(section.code, `section-${i}`)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-gray-800 text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {copied === `section-${i}` ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === `section-${i}` ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#0a0a0f] rounded-lg p-4 text-[11px] text-gray-300 overflow-x-auto leading-relaxed">
                <code>{section.code}</code>
              </pre>
            </div>
          ))}
        </div>

        {/* Architecture */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-emerald-900/20 border border-purple-800/30 rounded-xl p-6">
          <h2 className="text-sm font-bold text-purple-300 mb-4">ARCHITECTURE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div className="text-xs font-bold text-emerald-400 mb-2">CORE LAYER</div>
              <div className="text-[11px] text-gray-400 space-y-1">
                <div>• <span className="text-emerald-400">ForgeEngine</span> — Task execution with auto-eval</div>
                <div>• <span className="text-emerald-400">SelfEvalLoop</span> — Brute-force correction to 100%</div>
                <div>• <span className="text-emerald-400">PredictionEngine</span> — Win/loss probability</div>
                <div>• <span className="text-emerald-400">PromptClarifier</span> — Clean messy input</div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div className="text-xs font-bold text-cyan-400 mb-2">DOMAIN LAYER</div>
              <div className="text-[11px] text-gray-400 space-y-1">
                <div>• <span className="text-cyan-400">StrategyEngine</span> — Trading strategies</div>
                <div>• <span className="text-cyan-400">TaskPlanner</span> — Schedule optimization</div>
                <div>• <span className="text-cyan-400">CodeVetter</span> — Real-time code analysis</div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div className="text-xs font-bold text-purple-400 mb-2">ANALYSIS LAYER</div>
              <div className="text-[11px] text-gray-400 space-y-1">
                <div>• <span className="text-purple-400">PatternRecognizer</span> — Multi-dimensional detection</div>
                <div>• Sentiment aggregation from multiple sources</div>
                <div>• Self-calibrating prediction models</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600 pb-8">
          <p>FORGE Protocol v1.0.0 — A tool for AI agents, not a panel for users.</p>
          <p className="mt-1">Forced Optimization. Relentless. Guaranteed Execution.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
