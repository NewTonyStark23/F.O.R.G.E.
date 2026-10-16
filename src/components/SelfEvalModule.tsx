import { useState, useEffect } from 'react';
import { Brain, RefreshCw, CheckCircle2, Zap, Shield, Play } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SelfEvalLoop, EvalResult } from '../engine';

export default function SelfEvalModule() {
  const [evalLoop, setEvalLoop] = useState<SelfEvalLoop | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<Array<{ iteration: number; score: number }>>([]);
  const [corrections, setCorrections] = useState<string[]>([]);
  const [failures, setFailures] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [targetScore] = useState(100);

  useEffect(() => {
    // Initialize eval loop with criteria
    const loop = new SelfEvalLoop({ maxIterations: 50, targetScore: 100 });
    
    loop.addCriteria({
      name: 'Accuracy',
      weight: 0.25,
      evaluate: (output: any) => ({
        score: output.accuracy ?? Math.random() * 100,
        passed: (output.accuracy ?? 0) >= 95,
        reason: (output.accuracy ?? 0) < 95 ? 'Below 95% threshold' : 'OK',
      }),
    });

    loop.addCriteria({
      name: 'Completeness',
      weight: 0.2,
      evaluate: (output: any) => ({
        score: output.completeness ?? Math.random() * 100,
        passed: (output.completeness ?? 0) >= 90,
        reason: (output.completeness ?? 0) < 90 ? 'Missing elements' : 'OK',
      }),
    });

    loop.addCriteria({
      name: 'Efficiency',
      weight: 0.15,
      evaluate: (output: any) => ({
        score: output.efficiency ?? Math.random() * 100,
        passed: (output.efficiency ?? 0) >= 85,
        reason: (output.efficiency ?? 0) < 85 ? 'Suboptimal performance' : 'OK',
      }),
    });

    loop.addCriteria({
      name: 'Security',
      weight: 0.2,
      evaluate: (output: any) => ({
        score: output.security ?? Math.random() * 100,
        passed: (output.security ?? 0) >= 95,
        reason: (output.security ?? 0) < 95 ? 'Vulnerabilities detected' : 'OK',
      }),
    });

    loop.addCriteria({
      name: 'Robustness',
      weight: 0.2,
      evaluate: (output: any) => ({
        score: output.robustness ?? Math.random() * 100,
        passed: (output.robustness ?? 0) >= 90,
        reason: (output.robustness ?? 0) < 90 ? 'Edge cases not handled' : 'OK',
      }),
    });

    setEvalLoop(loop);
  }, []);

  const runLoop = async () => {
    if (!evalLoop) return;
    setIsRunning(true);
    setHistory([]);
    setCorrections([]);
    setFailures([]);
    setLog([]);

    addLog('[SELF-EVAL] Starting self-evaluation loop...');
    addLog(`[SELF-EVAL] Target score: ${targetScore}/100`);
    addLog('[SELF-EVAL] Criteria: Accuracy, Completeness, Efficiency, Security, Robustness');

    // Simulate an output that improves over iterations
    let output = {
      accuracy: 40 + Math.random() * 20,
      completeness: 35 + Math.random() * 20,
      efficiency: 30 + Math.random() * 20,
      security: 45 + Math.random() * 15,
      robustness: 38 + Math.random() * 18,
    };

    const corrector = async (out: any, corrs: any[]) => {
      // Simulate improvement with each correction
      const improved = { ...out };
      const improvementFactor = 5 + Math.random() * 10;
      
      improved.accuracy = Math.min(100, out.accuracy + improvementFactor + Math.random() * 5);
      improved.completeness = Math.min(100, out.completeness + improvementFactor + Math.random() * 4);
      improved.efficiency = Math.min(100, out.efficiency + improvementFactor + Math.random() * 6);
      improved.security = Math.min(100, out.security + improvementFactor + Math.random() * 3);
      improved.robustness = Math.min(100, out.robustness + improvementFactor + Math.random() * 5);

      return improved;
    };

    try {
      // Run iterations manually to show progress
      let currentOutput = output;
      let evalResult = evalLoop.evaluate(currentOutput);
      let iterations = 0;

      while (!evalResult.passed && iterations < 50) {
        iterations++;
        
        setCurrentScore(evalResult.overallScore);
        setIteration(iterations);
        setHistory(prev => [...prev, { iteration: iterations, score: evalResult.overallScore }]);
        setFailures(evalResult.failures);
        setCorrections(evalResult.corrections.map(c => c.correction));

        addLog(`[SELF-EVAL] Iteration ${iterations}: Score ${evalResult.overallScore.toFixed(1)}/100`);
        
        if (evalResult.failures.length > 0) {
          evalResult.failures.forEach(f => addLog(`[FAIL] ${f}`));
        }
        if (evalResult.corrections.length > 0) {
          evalResult.corrections.forEach(c => addLog(`[CORRECT] ${c.correction}`));
        }

        if (!evalResult.passed) {
          currentOutput = await corrector(currentOutput, evalResult.corrections);
          evalResult = evalLoop.evaluate(currentOutput);
          
          // Small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      if (evalResult.passed) {
        addLog(`[SELF-EVAL] ✓ PASSED! Score: ${evalResult.overallScore.toFixed(1)}/100 in ${iterations} iterations`);
        setCurrentScore(evalResult.overallScore);
      } else {
        addLog(`[SELF-EVAL] ✗ Failed to reach target after ${iterations} iterations`);
      }
    } catch (error) {
      addLog(`[SELF-EVAL] Error: ${error}`);
    }

    setIsRunning(false);
  };

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));
  };

  const radarData = [
    { metric: 'Accuracy', value: currentScore > 0 ? Math.min(currentScore + Math.random() * 10, 100) : 0 },
    { metric: 'Completeness', value: currentScore > 0 ? Math.min(currentScore - 5 + Math.random() * 15, 100) : 0 },
    { metric: 'Efficiency', value: currentScore > 0 ? Math.min(currentScore - 10 + Math.random() * 12, 100) : 0 },
    { metric: 'Security', value: currentScore > 0 ? Math.min(currentScore + Math.random() * 8, 100) : 0 },
    { metric: 'Robustness', value: currentScore > 0 ? Math.min(currentScore - 3 + Math.random() * 10, 100) : 0 },
  ];

  const loopStats = evalLoop?.getStats() ?? { totalEvaluations: 0, averageScore: 0, improvementRate: 0, totalCorrections: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Self-Evaluation Loop — Live
          </h2>
          <p className="text-xs text-gray-500 mt-1">Brute-force self-correction until 100% win rate achieved</p>
        </div>
        <button
          onClick={runLoop}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-500 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Self-Eval Loop'}
        </button>
      </div>

      {/* Core Loop Status */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300">LOOP STATUS</h3>
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs text-purple-400">ITERATING</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500">CURRENT SCORE</div>
            <div className={`text-2xl font-bold ${
              currentScore >= 95 ? 'text-emerald-400' :
              currentScore >= 75 ? 'text-cyan-400' :
              currentScore >= 50 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {currentScore.toFixed(1)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500">ITERATION</div>
            <div className="text-2xl font-bold text-purple-400">{iteration}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500">TARGET</div>
            <div className="text-2xl font-bold text-emerald-400">{targetScore}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500">STATUS</div>
            <div className={`text-sm font-bold ${
              currentScore >= targetScore ? 'text-emerald-400' :
              isRunning ? 'text-purple-400' :
              'text-gray-400'
            }`}>
              {currentScore >= targetScore ? '✓ PASSED' : isRunning ? '⟳ RUNNING' : '○ IDLE'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden relative">
            <div
              className="absolute h-full bg-gray-600/30 rounded-full"
              style={{ width: '40%' }}
            />
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${currentScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-500">
            <span>0</span>
            <span>Target: {targetScore}</span>
            <span>100</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-gray-400 mb-2">PERFORMANCE METRICS</h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                <Radar name="Score" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-xs text-gray-400 mb-2">IMPROVEMENT TRAJECTORY</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="iteration" stroke="#4b5563" fontSize={9} />
                <YAxis stroke="#4b5563" fontSize={9} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="score" stroke="#a855f7" fill="url(#evalGrad)" strokeWidth={2} />
                <defs>
                  <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failures & Corrections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-red-400">✗</span> FAILURES DETECTED
          </h3>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {failures.length === 0 ? (
              <div className="text-xs text-gray-500">No failures detected</div>
            ) : (
              failures.map((f, i) => (
                <div key={i} className="text-[11px] text-red-400/80 p-1.5 rounded bg-red-900/10">
                  ⚠ {f}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> CORRECTIONS APPLIED
          </h3>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {corrections.length === 0 ? (
              <div className="text-xs text-gray-500">No corrections applied yet</div>
            ) : (
              corrections.map((c, i) => (
                <div key={i} className="text-[11px] text-emerald-400/80 p-1.5 rounded bg-emerald-900/10">
                  → {c}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Engine Log */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-3">EVALUATION LOG</h3>
        <div className="space-y-0.5 max-h-[200px] overflow-y-auto font-mono">
          {log.map((entry, i) => (
            <div key={i} className={`text-[11px] p-1 rounded ${
              entry.includes('[FAIL]') ? 'text-red-400/80' :
              entry.includes('[CORRECT]') ? 'text-emerald-400/80' :
              entry.includes('✓') ? 'text-emerald-400 font-bold' :
              'text-purple-400/80'
            }`}>
              {entry}
            </div>
          ))}
          {log.length === 0 && (
            <div className="text-[11px] text-gray-500">Click "Run Self-Eval Loop" to start...</div>
          )}
        </div>
      </div>

      {/* Protocol Info */}
      <div className="bg-gradient-to-r from-purple-900/20 to-emerald-900/20 border border-purple-800/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          BRUTE-FORCE WIN PROTOCOL
        </h3>
        <div className="text-[11px] text-gray-400">
          <span className="text-purple-400 font-bold">HOW IT WORKS:</span> The self-evaluation loop evaluates output against 5 criteria 
          (Accuracy, Completeness, Efficiency, Security, Robustness). If the weighted score is below 100, failures are identified, 
          corrections are generated and applied, then the output is re-evaluated. This loop continues until the score reaches the target. 
          No output exits the loop until it's a guaranteed win.
        </div>
      </div>
    </div>
  );
}
