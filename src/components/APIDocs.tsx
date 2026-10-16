import { BookOpen, Code2, Terminal, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function APIDocs() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    {
      title: 'Quick Start',
      description: 'Import and initialize FORGE Protocol in your AI agent',
      code: `import { forge, strategyEngine, taskPlanner, codeVetter, patternRecognizer, predictionEngine } from 'forge-protocol';

// Initialize with custom config
const engine = new ForgeEngine({
  targetScore: 100,
  maxIterations: 50,
  evaluationThreshold: 95,
  enableBruteForce: true,
  parameterSpace: 1000,
});`,
    },
    {
      title: 'Self-Evaluation Loop',
      description: 'Auto-correct any output until 100% score achieved',
      code: `import { createSelfEvalLoop } from 'forge-protocol';

const evalLoop = createSelfEvalLoop({ maxIterations: 50, targetScore: 100 });

// Add evaluation criteria
evalLoop.addCriteria({
  name: 'Code Quality',
  weight: 0.4,
  evaluate: (output) => ({
    score: output.qualityScore,
    passed: output.qualityScore >= 90,
    reason: output.qualityScore < 90 ? 'Below threshold' : 'OK'
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

// Run the loop - auto-corrects until passing
const result = await evalLoop.runLoop(initialOutput, async (output, corrections) => {
  // Apply corrections and return improved output
  return correctedOutput;
});

console.log(\`Passed in \${result.iterations} iterations with score \${result.finalEval.overallScore}\`);`,
    },
    {
      title: 'Trading Strategy Engine',
      description: 'Generate self-evaluating trading strategies',
      code: `import { strategyEngine, PriceData, SentimentData } from 'forge-protocol';

// Feed price data
const priceData: PriceData[] = [
  { timestamp: Date.now(), open: 67000, high: 67500, low: 66800, close: 67200, volume: 15000 },
  // ... more candles
];
strategyEngine.feedPriceData('BTC/USD', priceData);

// Feed sentiment data
strategyEngine.feedSentiment({
  source: 'Twitter',
  score: 0.67, // -1 to 1
  weight: 0.3,
  timestamp: Date.now(),
  dataPoints: 1000
});

// Generate strategy (auto-evaluates and self-corrects)
const strategy = strategyEngine.generateStrategy('BTC/USD', '4h');

if (strategy) {
  console.log(\`Strategy: \${strategy.type} \${strategy.direction}\`);
  console.log(\`Entry: $\${strategy.entry} | Target: $\${strategy.exit} | Stop: $\${strategy.stopLoss}\`);
  console.log(\`Confidence: \${strategy.confidence}% | R:R = \${strategy.riskRewardRatio}\`);
  console.log(\`Signals: \${strategy.patternMatches.join(', ')}\`);
}`,
    },
    {
      title: 'Task Planner',
      description: 'AI-optimized scheduling with self-correcting execution',
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
  dependencies: [task1], // Depends on task1
  maxAttempts: 3,
});

// Execute with self-correction
const result = await taskPlanner.executeTask(task1, async () => {
  // Your task logic here
  return await reviewReports();
}, (result) => ({
  passed: result.quality > 0.9,
  reason: result.quality <= 0.9 ? 'Quality too low' : undefined
}));

// Generate optimized daily schedule
const dayPlan = taskPlanner.generateDayPlan();
console.log(\`Plan: \${dayPlan.totalTasks} tasks, completion by \${dayPlan.estimatedCompletion}\`);
console.log(\`Success probability: \${dayPlan.successProbability}%\`);
console.log(\`Risk factors: \${dayPlan.riskFactors.join(', ')}\`);`,
    },
    {
      title: 'Code Vetter',
      description: 'Real-time code analysis with auto-correction',
      code: `import { codeVetter } from 'forge-protocol';

// Vet code in real-time
const vetResult = await codeVetter.vet(myCode, 'typescript');

console.log(\`Score: \${vetResult.overallScore}/100\`);
console.log(\`Passed: \${vetResult.passed}\`);
console.log(\`Win Probability: \${vetResult.winProbability}%\`);

if (!vetResult.passed) {
  console.log('Corrections needed:');
  vetResult.corrections.forEach(c => console.log(\`  → \${c}\`));
  
  // Apply corrections and re-vet
  const correctedCode = applyCorrections(myCode, vetResult.corrections);
  const reVet = await codeVetter.vet(correctedCode, 'typescript');
}

// Access detailed analysis
console.log('Security Score:', vetResult.analysis.metrics.securityScore);
console.log('Performance Score:', vetResult.analysis.metrics.performanceScore);
console.log('Issues:', vetResult.analysis.issues.length);`,
    },
    {
      title: 'Pattern Recognizer',
      description: 'Multi-dimensional pattern detection',
      code: `import { patternRecognizer, TimeSeriesPoint } from 'forge-protocol';

// Feed time series data
const data: TimeSeriesPoint[] = [
  { timestamp: Date.now() - 100000, value: 100, volume: 5000 },
  { timestamp: Date.now() - 90000, value: 102, volume: 5200 },
  // ... more data points
];

// Analyze for patterns
const patterns = patternRecognizer.analyze(data);

patterns.forEach(p => {
  console.log(\`[\${p.type}] \${p.name}\`);
  console.log(\`  Direction: \${p.direction} | Confidence: \${p.confidence}%\`);
});

// Get patterns by type
const trends = patternRecognizer.getPatternsByType('trend');
const reversals = patternRecognizer.getPatternsByType('reversal');
const breakouts = patternRecognizer.getPatternsByType('breakout');`,
    },
    {
      title: 'Prediction Engine',
      description: 'Win/loss prediction with self-calibration',
      code: `import { predictionEngine } from 'forge-protocol';

// Make a prediction
const prediction = predictionEngine.predict({
  features: {
    confidence: 85,
    riskReward: 2.5,
    sentimentScore: 0.7,
    patternStrength: 0.8,
    volumeConfirmation: 0.9,
  }
});

console.log(\`Outcome: \${prediction.outcome}\`);
console.log(\`Probability: \${prediction.probability}%\`);
console.log(\`Risk Level: \${prediction.riskLevel}\`);
console.log(\`Recommendation: \${prediction.recommendation}\`);

// Record actual outcome (self-calibrates model)
predictionEngine.recordOutcome(prediction, input, true); // actual win

// Get model stats
const stats = predictionEngine.getStats();
console.log(\`Model accuracy: \${stats.overallAccuracy}%\`);
console.log(\`Win/Loss ratio: \${predictionEngine.getWinLossRatio().ratio}\`);`,
    },
    {
      title: 'Forge Engine (Core)',
      description: 'Execute any task with automatic self-evaluation',
      code: `import { forge, ForgeEngine } from 'forge-protocol';

// Use singleton
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
const { bestParams, bestScore } = await forge.bruteForceOptimize(
  () => generateRandomParams(),
  (params) => evaluateParams(params),
  1000 // iterations
);

// Get stats
const stats = forge.getStats();
console.log(\`Win rate: \${stats.winRate}%\`);
console.log(\`Total iterations: \${stats.totalIterations}\`);`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          API Reference — FORGE Protocol
        </h2>
        <p className="text-xs text-gray-500 mt-1">Complete integration guide for AI agents. Import, configure, and execute.</p>
      </div>

      {/* Import Statement */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            INSTALL & IMPORT
          </h3>
          <button
            onClick={() => copyCode("import { forge, strategyEngine, taskPlanner, codeVetter, patternRecognizer, predictionEngine } from './engine';", 'import')}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-gray-800 text-gray-400 hover:text-emerald-400 transition-colors"
          >
            {copied === 'import' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied === 'import' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs text-emerald-400 overflow-x-auto">
          <code>{"import { forge, strategyEngine, taskPlanner, codeVetter, patternRecognizer, predictionEngine } from './engine';"}</code>
        </pre>
      </div>

      {/* Code Sections */}
      {sections.map((section, i) => (
        <div key={i} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
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

      {/* Architecture */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-emerald-300 mb-4">ARCHITECTURE OVERVIEW</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-xs font-bold text-emerald-400 mb-2">CORE LAYER</div>
            <div className="text-[11px] text-gray-400 space-y-1">
              <div>• ForgeEngine — Task execution with auto-eval</div>
              <div>• SelfEvalLoop — Brute-force correction to 100%</div>
              <div>• PredictionEngine — Win/loss probability</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-xs font-bold text-cyan-400 mb-2">DOMAIN LAYER</div>
            <div className="text-[11px] text-gray-400 space-y-1">
              <div>• StrategyEngine — Trading strategy generation</div>
              <div>• TaskPlanner — Schedule optimization</div>
              <div>• CodeVetter — Real-time code analysis</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-xs font-bold text-purple-400 mb-2">ANALYSIS LAYER</div>
            <div className="text-[11px] text-gray-400 space-y-1">
              <div>• PatternRecognizer — Multi-dimensional detection</div>
              <div>• Sentiment Analysis — Multi-source aggregation</div>
              <div>• Self-Calibration — Auto-improving models</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
          <div className="text-[11px] text-gray-400">
            <span className="text-emerald-400 font-bold">CORE PRINCIPLE:</span> Every output flows through the self-evaluation loop.
            If it doesn't score 100%, the system identifies failures, applies corrections, and re-tests.
            This loops until the result is a guaranteed win. No task exits until it passes.
          </div>
        </div>
      </div>
    </div>
  );
}
