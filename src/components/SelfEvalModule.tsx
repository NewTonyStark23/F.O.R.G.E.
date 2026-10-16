import { useState, useEffect } from 'react';
import { Brain, RefreshCw, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Zap, Target, Shield, Eye } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface EvalCycle {
  id: number;
  task: string;
  initialScore: number;
  currentScore: number;
  targetScore: number;
  iterations: number;
  maxIterations: number;
  status: 'passing' | 'correcting' | 'failed' | 'optimizing';
  corrections: string[];
}

export default function SelfEvalModule() {
  const [cycles, setCycles] = useState<EvalCycle[]>([
    {
      id: 1,
      task: 'Trading Strategy: BTC Long',
      initialScore: 62,
      currentScore: 94,
      targetScore: 100,
      iterations: 14,
      maxIterations: 50,
      status: 'optimizing',
      corrections: ['Adjusted entry point by -0.3%', 'Added volume confirmation filter', 'Tightened stop-loss by 1.2%', 'Added sentiment threshold gate'],
    },
    {
      id: 2,
      task: 'Code Review: Auth Module',
      initialScore: 45,
      currentScore: 100,
      targetScore: 100,
      iterations: 8,
      maxIterations: 50,
      status: 'passing',
      corrections: ['Fixed SQL injection vulnerability', 'Added rate limiting', 'Implemented proper error handling', 'Added input validation'],
    },
    {
      id: 3,
      task: 'Daily Schedule Optimization',
      initialScore: 71,
      currentScore: 88,
      targetScore: 100,
      iterations: 6,
      maxIterations: 50,
      status: 'correcting',
      corrections: ['Reordered tasks by dependency', 'Added buffer time between meetings', 'Moved low-priority tasks to afternoon'],
    },
    {
      id: 4,
      task: 'Pattern Recognition: ETH Setup',
      initialScore: 55,
      currentScore: 97,
      targetScore: 100,
      iterations: 22,
      maxIterations: 50,
      status: 'optimizing',
      corrections: ['Added multi-timeframe confirmation', 'Filtered false signals with ATR', 'Added order flow analysis', 'Cross-referenced with whale movements'],
    },
    {
      id: 5,
      task: 'Options Strategy: SPY Call Spread',
      initialScore: 78,
      currentScore: 100,
      targetScore: 100,
      iterations: 5,
      maxIterations: 50,
      status: 'passing',
      corrections: ['Adjusted strike selection', 'Optimized expiration date', 'Added delta hedge ratio'],
    },
  ]);

  const [radarData, setRadarData] = useState([
    { metric: 'Accuracy', value: 94 },
    { metric: 'Speed', value: 87 },
    { metric: 'Risk Mgmt', value: 91 },
    { metric: 'Pattern Match', value: 88 },
    { metric: 'Self-Correct', value: 96 },
    { metric: 'Prediction', value: 85 },
  ]);

  const [historyData, setHistoryData] = useState<Array<{ cycle: number; score: number; improvement: number }>>([]);
  const [activeLoop, setActiveLoop] = useState(0);
  const [loopSpeed, setLoopSpeed] = useState(0);

  useEffect(() => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      cycle: i + 1,
      score: 60 + (i * 2) + Math.random() * 5,
      improvement: 2 + Math.random() * 3,
    }));
    setHistoryData(history);

    const interval = setInterval(() => {
      setActiveLoop(prev => (prev + 1) % 100);
      setLoopSpeed(Math.floor(Math.random() * 500 + 200));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Self-Evaluation Loop
          </h2>
          <p className="text-xs text-gray-500 mt-1">Brute-force self-correction until 100% win rate achieved</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-purple-900/20 border border-purple-800/30">
            <span className="text-xs text-purple-400">5 Active Loops</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">2/5 Passed (100%)</span>
          </div>
        </div>
      </div>

      {/* Core Loop Visualization */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300">CORE SELF-CORRECTION ENGINE</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-400">RUNNING — Cycle #{activeLoop}</span>
          </div>
        </div>
        
        {/* Loop Visualization */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {['EVALUATE', 'GRADE', 'IDENTIFY FAIL', 'CORRECT', 'RE-TEST'].map((step, i) => (
            <div key={i} className={`p-3 rounded-lg border text-center transition-all ${
              activeLoop % 5 === i 
                ? 'bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                : 'bg-[#0d0d14] border-gray-800/30'
            }`}>
              <div className={`text-[10px] font-bold ${
                activeLoop % 5 === i ? 'text-purple-400' : 'text-gray-500'
              }`}>
                {step}
              </div>
              {activeLoop % 5 === i && (
                <div className="mt-1 text-[9px] text-purple-300 animate-pulse">ACTIVE</div>
              )}
            </div>
          ))}
        </div>

        {/* Performance Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs text-gray-400 mb-2">PERFORMANCE METRICS</h4>
            <ResponsiveContainer width="100%" height={250}>
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
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="cycle" stroke="#4b5563" fontSize={9} />
                <YAxis stroke="#4b5563" fontSize={9} domain={[50, 100]} />
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

      {/* Active Evaluation Cycles */}
      <div className="space-y-4">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {cycle.status === 'passing' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : cycle.status === 'correcting' ? (
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                ) : cycle.status === 'optimizing' ? (
                  <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <span className="text-sm font-bold text-white">{cycle.task}</span>
                  <span className={`ml-2 text-[10px] px-2 py-0.5 rounded ${
                    cycle.status === 'passing' ? 'bg-emerald-900/30 text-emerald-400' :
                    cycle.status === 'correcting' ? 'bg-amber-900/30 text-amber-400' :
                    cycle.status === 'optimizing' ? 'bg-purple-900/30 text-purple-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {cycle.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Iteration {cycle.iterations}/{cycle.maxIterations}</div>
              </div>
            </div>

            {/* Score Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">
                  Initial: <span className="text-red-400">{cycle.initialScore}%</span> → Current: <span className="text-emerald-400">{cycle.currentScore}%</span> → Target: <span className="text-cyan-400">{cycle.targetScore}%</span>
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                <div
                  className="absolute h-full bg-red-500/30 rounded-full"
                  style={{ width: `${cycle.initialScore}%` }}
                />
                <div
                  className="absolute h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${cycle.currentScore}%` }}
                />
              </div>
            </div>

            {/* Corrections Log */}
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 mb-1">SELF-CORRECTIONS APPLIED:</div>
              {cycle.corrections.map((correction, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400 pl-3 border-l border-purple-800/30">
                  <span className="text-purple-400">→</span>
                  {correction}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Brute Force Stats */}
      <div className="bg-gradient-to-r from-purple-900/20 to-emerald-900/20 border border-purple-800/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          BRUTE-FORCE WIN PROTOCOL
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-[10px] text-gray-500">WIN TARGET</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">1,000</div>
            <div className="text-[10px] text-gray-500">PARAMS/CYCLE</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{loopSpeed}ms</div>
            <div className="text-[10px] text-gray-500">LOOP SPEED</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">0</div>
            <div className="text-[10px] text-gray-500">UNRESOLVED LOSSES</div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
          <div className="text-[11px] text-gray-400">
            <span className="text-purple-400 font-bold">PROTOCOL:</span> Every task is evaluated → graded → if below 100%, 
            the system identifies failure points → applies corrections → re-tests → repeats until 
            the score reaches 100%. No task exits the loop until it's a guaranteed win.
          </div>
        </div>
      </div>
    </div>
  );
}
