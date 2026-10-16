import { useState, useEffect } from 'react';
import { Activity, Brain, TrendingUp, Code2, Calendar, Shield, Flame, BookOpen } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TradingModule from './components/TradingModule';
import TaskModule from './components/TaskModule';
import SelfEvalModule from './components/SelfEvalModule';
import CodeModule from './components/CodeModule';
import APIDocs from './components/APIDocs';
import { forge, strategyEngine, taskPlanner, codeVetter, patternRecognizer, predictionEngine } from './engine';

type Tab = 'dashboard' | 'trading' | 'tasks' | 'selfeval' | 'code' | 'docs';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [pulse, setPulse] = useState(false);
  const [stats, setStats] = useState({
    winRate: 0,
    cycles: 0,
    strategies: 0,
    tasks: 0,
    patterns: 0,
    predictions: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
      
      // Pull real stats from engines
      const forgeStats = forge.getStats();
      const stratStats = strategyEngine.getStats();
      const taskStats = taskPlanner.getStats();
      const patternStats = patternRecognizer.getStats();
      const predStats = predictionEngine.getStats();

      setStats({
        winRate: forgeStats.winRate,
        cycles: forgeStats.totalIterations,
        strategies: stratStats.totalStrategies,
        tasks: taskStats.totalTasks,
        patterns: patternStats.totalPatterns,
        predictions: predStats.totalPredictions,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Command Center', icon: Activity },
    { id: 'trading' as Tab, label: 'Trading Engine', icon: TrendingUp },
    { id: 'tasks' as Tab, label: 'Task Forge', icon: Calendar },
    { id: 'selfeval' as Tab, label: 'Self-Eval Loop', icon: Brain },
    { id: 'code' as Tab, label: 'Code Forge', icon: Code2 },
    { id: 'docs' as Tab, label: 'API Reference', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-mono">
      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-[#0d0d14]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center ${pulse ? 'shadow-lg shadow-emerald-500/30' : ''} transition-all duration-1000`}>
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-emerald-400">FORGE</span>
                <span className="text-gray-400 text-sm ml-2">PROTOCOL</span>
                <span className="text-gray-600 text-[10px] ml-2">v1.0.0</span>
              </h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Forced Optimization • Relentless • Guaranteed Execution</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${pulse ? 'bg-emerald-400' : 'bg-emerald-600'} transition-all duration-1000`} />
              <span className="text-xs text-emerald-400">ENGINE ACTIVE</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">WIN RATE</div>
              <div className="text-lg font-bold text-emerald-400">{stats.winRate.toFixed(1)}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">CYCLES</div>
              <div className="text-lg font-bold text-cyan-400">{stats.cycles.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800/50 bg-[#0b0b12]">
        <div className="max-w-[1800px] mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4">
        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'trading' && <TradingModule />}
        {activeTab === 'tasks' && <TaskModule />}
        {activeTab === 'selfeval' && <SelfEvalModule />}
        {activeTab === 'code' && <CodeModule />}
        {activeTab === 'docs' && <APIDocs />}
      </main>
    </div>
  );
}

export default App;
