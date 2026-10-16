import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Brain, Target, Shield, Zap, ArrowUp, ArrowDown, RefreshCw, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
  winRate: number;
  cycleCount: number;
}

export default function Dashboard({ winRate, cycleCount }: DashboardProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [chartData, setChartData] = useState<Array<{ time: string; winRate: number; confidence: number }>>([]);
  const [modules, setModules] = useState([
    { name: 'Trading Engine', status: 'active', winRate: 91.2, tasks: 34 },
    { name: 'Task Forge', status: 'active', winRate: 96.8, tasks: 12 },
    { name: 'Self-Eval Loop', status: 'processing', winRate: 87.5, tasks: 89 },
    { name: 'Code Forge', status: 'active', winRate: 94.1, tasks: 7 },
    { name: 'Pattern Scanner', status: 'scanning', winRate: 88.9, tasks: 156 },
  ]);

  useEffect(() => {
    const initialData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      winRate: 85 + Math.random() * 12,
      confidence: 80 + Math.random() * 15,
    }));
    setChartData(initialData);

    const logMessages = [
      '[FORGE] Self-evaluation cycle #1247 complete — Win rate: 87.3%',
      '[TRADING] BTC/USD pattern detected: Bullish divergence on 4H — Confidence: 78%',
      '[SCAN] News sentiment analysis: 67% positive for tech sector',
      '[FORGE] Strategy correction applied — Previous loss: -$2.3% → Adjusted entry',
      '[CODE] Task "API Integration" vetted — 3/3 tests passing — Score: 98/100',
      '[PATTERN] Recognized: Double bottom formation on ETH/USD — Signal: LONG',
      '[FORGE] Self-correction loop: Iteration 14/50 — Improving strategy parameters',
      '[TASK] Daily schedule optimized — 12 tasks prioritized — Est. completion: 94%',
      '[SCAN] Delayed ping detected: Market maker activity on SPY — Alert raised',
      '[FORGE] Brute-force optimization: Testing 1000 parameter combinations...',
    ];

    const interval = setInterval(() => {
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Active Strategies', value: '23', change: '+3', icon: Target, color: 'emerald' },
    { label: 'Self-Corrections', value: '847', change: '+12', icon: RefreshCw, color: 'cyan' },
    { label: 'Patterns Found', value: '156', change: '+8', icon: Eye, color: 'purple' },
    { label: 'Tasks Completed', value: '2,341', change: '+47', icon: CheckCircle2, color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold text-sm">FORGE PROTOCOL ACTIVE</span>
            <span className="text-gray-500 text-sm">|</span>
            <span className="text-gray-400 text-sm">All systems operational — Self-optimizing in real-time</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">SELF-VETTING: ON</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 hover:border-emerald-800/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              <span className="text-xs text-emerald-400">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win Rate Chart */}
        <div className="lg:col-span-2 bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300">WIN RATE TRAJECTORY</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">24H</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="winGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#4b5563" fontSize={10} />
              <YAxis stroke="#4b5563" fontSize={10} domain={[75, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="winRate" stroke="#10b981" fill="url(#winGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="confidence" stroke="#06b6d4" fill="url(#confGradient)" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module Status */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">MODULE STATUS</h3>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0d0d14] border border-gray-800/30">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    mod.status === 'active' ? 'bg-emerald-400' :
                    mod.status === 'processing' ? 'bg-amber-400 animate-pulse' :
                    'bg-cyan-400 animate-pulse'
                  }`} />
                  <span className="text-xs text-gray-300">{mod.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">{mod.winRate}%</div>
                  <div className="text-[10px] text-gray-500">{mod.tasks} tasks</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Log */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300">LIVE ACTIVITY LOG</h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] text-red-400">LIVE</span>
            </div>
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`text-[11px] font-mono p-1.5 rounded ${
                log.includes('FORGE') ? 'text-emerald-400/80 bg-emerald-900/10' :
                log.includes('TRADING') || log.includes('PATTERN') ? 'text-cyan-400/80 bg-cyan-900/10' :
                log.includes('SCAN') ? 'text-purple-400/80 bg-purple-900/10' :
                'text-gray-400/80 bg-gray-800/20'
              }`}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Self-Correction Cycles */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">SELF-CORRECTION ENGINE</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div>
                <div className="text-xs text-gray-400">Current Iteration</div>
                <div className="text-lg font-bold text-white">14 / 50</div>
              </div>
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div>
                <div className="text-xs text-gray-400">Losses Corrected</div>
                <div className="text-lg font-bold text-emerald-400">23 → 0</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div>
                <div className="text-xs text-gray-400">Strategy Confidence</div>
                <div className="text-lg font-bold text-cyan-400">94.7%</div>
              </div>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="p-3 rounded-lg bg-emerald-900/10 border border-emerald-800/30">
              <div className="text-xs text-emerald-400 font-bold mb-1">BRUTE-FORCE STATUS</div>
              <div className="text-[11px] text-gray-400">
                Testing 1,000 parameter combinations per cycle. Current best: 97.2% accuracy. 
                Auto-correcting until 100% threshold met.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
