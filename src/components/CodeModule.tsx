import { useState, useEffect } from 'react';
import { Code2, CheckCircle2, XCircle, AlertTriangle, Zap, Terminal, GitBranch, Shield, Eye, RefreshCw, Play, FileCode } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CodeTask {
  id: string;
  name: string;
  language: string;
  status: 'planning' | 'executing' | 'vetting' | 'passed' | 'correcting';
  progress: number;
  tests: { name: string; passed: boolean }[];
  vetScore: number;
  issues: string[];
  corrections: string[];
}

interface PredictionData {
  name: string;
  winRate: number;
  loseRate: number;
}

export default function CodeModule() {
  const [codeTasks, setCodeTasks] = useState<CodeTask[]>([
    {
      id: 'CF-001',
      name: 'REST API Authentication',
      language: 'Rust',
      status: 'passed',
      progress: 100,
      tests: [
        { name: 'JWT Token Validation', passed: true },
        { name: 'Rate Limiting', passed: true },
        { name: 'Session Management', passed: true },
        { name: 'OAuth2 Flow', passed: true },
        { name: 'Brute Force Protection', passed: true },
      ],
      vetScore: 98,
      issues: [],
      corrections: ['Added input sanitization', 'Fixed timing attack vulnerability'],
    },
    {
      id: 'CF-002',
      name: 'Database Migration Script',
      language: 'SQL',
      status: 'vetting',
      progress: 85,
      tests: [
        { name: 'Schema Validation', passed: true },
        { name: 'Data Integrity', passed: true },
        { name: 'Rollback Safety', passed: true },
        { name: 'Performance Benchmark', passed: false },
        { name: 'Concurrent Access', passed: false },
      ],
      vetScore: 72,
      issues: ['Query performance below threshold', 'Race condition in concurrent writes'],
      corrections: ['Adding index optimization', 'Implementing write-ahead logging'],
    },
    {
      id: 'CF-003',
      name: 'WebSocket Real-time Feed',
      language: 'TypeScript',
      status: 'executing',
      progress: 60,
      tests: [
        { name: 'Connection Handling', passed: true },
        { name: 'Message Serialization', passed: true },
        { name: 'Reconnection Logic', passed: false },
        { name: 'Backpressure', passed: false },
        { name: 'Memory Leak Test', passed: false },
      ],
      vetScore: 45,
      issues: ['Memory leak on disconnect', 'No backpressure handling', 'Reconnection timeout too aggressive'],
      corrections: ['Implementing cleanup on disconnect', 'Adding buffer queue', 'Adjusting retry intervals'],
    },
    {
      id: 'CF-004',
      name: 'ML Prediction Pipeline',
      language: 'Python',
      status: 'planning',
      progress: 15,
      tests: [
        { name: 'Data Ingestion', passed: false },
        { name: 'Feature Engineering', passed: false },
        { name: 'Model Training', passed: false },
        { name: 'Prediction Output', passed: false },
        { name: 'Accuracy Validation', passed: false },
      ],
      vetScore: 12,
      issues: ['Architecture not yet defined'],
      corrections: ['Planning phase — generating TODO list'],
    },
  ]);

  const [predictions, setPredictions] = useState<PredictionData[]>([
    { name: 'CF-001', winRate: 98, loseRate: 2 },
    { name: 'CF-002', winRate: 72, loseRate: 28 },
    { name: 'CF-003', winRate: 45, loseRate: 55 },
    { name: 'CF-004', winRate: 12, loseRate: 88 },
  ]);

  const [liveVetting, setLiveVetting] = useState<string[]>([]);
  const [vettingSpeed, setVettingSpeed] = useState(0);

  useEffect(() => {
    const vetMessages = [
      '[VET] Checking null safety on line 47...',
      '[VET] Analyzing time complexity: O(n log n) ✓',
      '[VET] Memory allocation pattern: stable',
      '[VET] Security scan: No vulnerabilities detected',
      '[VET] Test coverage: 94% — Above threshold',
      '[VET] Code style: Conforming to standards',
      '[VET] Edge case analysis: 12/12 handled',
      '[VET] Performance benchmark: 2.3ms avg response',
      '[VET] Dependency audit: All packages verified',
      '[VET] Pattern matching: Optimal algorithm selected',
      '[SELF-CORRECT] Issue found: Off-by-one error at line 89',
      '[SELF-CORRECT] Applying fix: Adjusting boundary condition',
      '[SELF-CORRECT] Re-running tests after correction...',
      '[PREDICT] Win probability: 94.7% — Above threshold',
      '[PREDICT] Failure modes analyzed: 3 identified, 3 mitigated',
    ];

    const interval = setInterval(() => {
      const msg = vetMessages[Math.floor(Math.random() * vetMessages.length)];
      setLiveVetting(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 12));
      setVettingSpeed(Math.floor(Math.random() * 50 + 10));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-emerald-400 bg-emerald-900/20 border-emerald-800/30';
      case 'vetting': return 'text-cyan-400 bg-cyan-900/20 border-cyan-800/30';
      case 'executing': return 'text-purple-400 bg-purple-900/20 border-purple-800/30';
      case 'planning': return 'text-amber-400 bg-amber-900/20 border-amber-800/30';
      case 'correcting': return 'text-red-400 bg-red-900/20 border-red-800/30';
      default: return 'text-gray-400 bg-gray-800/20 border-gray-700/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            Code Forge
          </h2>
          <p className="text-xs text-gray-500 mt-1">Plan → Execute → Vet → Self-Correct → Win. Real-time code validation.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-purple-900/20 border border-purple-800/30">
            <span className="text-xs text-purple-400">4 Active Tasks</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">1 Passed (100%)</span>
          </div>
        </div>
      </div>

      {/* Live Vetting Terminal */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            LIVE VETTING TERMINAL
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400">{vettingSpeed} checks/sec</span>
          </div>
        </div>
        <div className="bg-[#0a0a0f] rounded-lg p-3 font-mono max-h-[200px] overflow-y-auto">
          {liveVetting.map((msg, i) => (
            <div key={i} className={`text-[11px] mb-0.5 ${
              msg.includes('[VET]') ? 'text-cyan-400/80' :
              msg.includes('[SELF-CORRECT]') ? 'text-amber-400/80' :
              msg.includes('[PREDICT]') ? 'text-emerald-400/80' :
              'text-gray-500'
            }`}>
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Code Tasks */}
      <div className="space-y-4">
        {codeTasks.map((task) => (
          <div key={task.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{task.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-gray-800 text-gray-400 border border-gray-700/30">
                      {task.language}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">{task.id}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(task.status)}`}>
                {task.status === 'passed' ? '✓ PASSED' :
                 task.status === 'vetting' ? '⟳ VETTING' :
                 task.status === 'executing' ? '▶ EXECUTING' :
                 task.status === 'planning' ? '◎ PLANNING' :
                 '↻ CORRECTING'}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">PROGRESS</span>
                <span className="text-[10px] font-bold text-purple-400">{task.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* Tests */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-500 mb-2">TEST RESULTS:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {task.tests.map((test, i) => (
                  <div key={i} className={`flex items-center gap-2 p-1.5 rounded text-[11px] ${
                    test.passed ? 'bg-emerald-900/10 text-emerald-400' : 'bg-red-900/10 text-red-400'
                  }`}>
                    {test.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {test.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Issues & Corrections */}
            {(task.issues.length > 0 || task.corrections.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {task.issues.length > 0 && (
                  <div>
                    <div className="text-[10px] text-red-400 mb-1">ISSUES FOUND:</div>
                    {task.issues.map((issue, i) => (
                      <div key={i} className="text-[11px] text-red-400/70 pl-3 border-l border-red-800/30 mb-1">
                        ⚠ {issue}
                      </div>
                    ))}
                  </div>
                )}
                {task.corrections.length > 0 && (
                  <div>
                    <div className="text-[10px] text-emerald-400 mb-1">CORRECTIONS:</div>
                    {task.corrections.map((corr, i) => (
                      <div key={i} className="text-[11px] text-emerald-400/70 pl-3 border-l border-emerald-800/30 mb-1">
                        → {corr}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vet Score */}
            <div className="mt-3 pt-3 border-t border-gray-800/30 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">VET SCORE</span>
              <span className={`text-sm font-bold ${
                task.vetScore >= 90 ? 'text-emerald-400' :
                task.vetScore >= 70 ? 'text-cyan-400' :
                task.vetScore >= 50 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {task.vetScore}/100
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Win/Loss Prediction */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          WIN/LOSS PREDICTION ANALYSIS
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={predictions} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" stroke="#4b5563" fontSize={9} domain={[0, 100]} />
            <YAxis type="category" dataKey="name" stroke="#4b5563" fontSize={10} width={60} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }} />
            <Bar dataKey="winRate" stackId="a" fill="#10b981" name="Win Rate %" />
            <Bar dataKey="loseRate" stackId="a" fill="#ef4444" name="Lose Rate %" opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
          <div className="text-[11px] text-gray-400">
            <span className="text-cyan-400 font-bold">PREDICTION ENGINE:</span> Each code task is analyzed for potential failure modes.
            Win rate is calculated based on: test coverage, code quality metrics, security scan results, 
            performance benchmarks, and historical pattern matching. Tasks below 95% win rate are 
            automatically sent back through the self-correction loop.
          </div>
        </div>
      </div>

      {/* TODO Pipeline */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          EXECUTION PIPELINE
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { phase: 'PLAN', desc: 'Generate TODO list, define scope', icon: '◎', active: false },
            { phase: 'EXECUTE', desc: 'Write code, implement features', icon: '▶', active: true },
            { phase: 'VET', desc: 'Real-time validation & testing', icon: '⟳', active: true },
            { phase: 'WIN', desc: '100% pass rate confirmed', icon: '✓', active: false },
          ].map((phase, i) => (
            <div key={i} className={`p-3 rounded-lg border text-center transition-all ${
              phase.active
                ? 'bg-purple-900/20 border-purple-500/30 shadow-lg shadow-purple-500/5'
                : 'bg-[#0d0d14] border-gray-800/30'
            }`}>
              <div className="text-2xl mb-1">{phase.icon}</div>
              <div className={`text-xs font-bold ${phase.active ? 'text-purple-400' : 'text-gray-500'}`}>
                {phase.phase}
              </div>
              <div className="text-[9px] text-gray-500 mt-1">{phase.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
