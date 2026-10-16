import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Eye, Zap, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';

interface Strategy {
  id: string;
  asset: string;
  type: 'LONG' | 'SHORT' | 'OPTIONS' | 'SCALP';
  entry: number;
  exit: number;
  stopLoss: number;
  confidence: number;
  status: 'active' | 'pending' | 'executed' | 'correcting';
  pnl: number;
  signals: string[];
}

export default function TradingModule() {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: 'STR-001',
      asset: 'BTC/USD',
      type: 'LONG',
      entry: 67420,
      exit: 72800,
      stopLoss: 65100,
      confidence: 87,
      status: 'active',
      pnl: 3.2,
      signals: ['Bullish Divergence 4H', 'RSI Oversold Bounce', 'Volume Spike', 'News: ETF Approval'],
    },
    {
      id: 'STR-002',
      asset: 'ETH/USD',
      type: 'SHORT',
      entry: 3890,
      exit: 3520,
      stopLoss: 4050,
      confidence: 74,
      status: 'pending',
      pnl: 0,
      signals: ['Bearish Engulfing Daily', 'Resistance Rejection', 'Sentiment: -0.34', 'Whale Sell Detected'],
    },
    {
      id: 'STR-003',
      asset: 'SPY',
      type: 'OPTIONS',
      entry: 512,
      exit: 528,
      stopLoss: 505,
      confidence: 91,
      status: 'active',
      pnl: 5.7,
      signals: ['Call Spread', 'VIX Compression', 'Earnings Catalyst', 'Flow Analysis: Bullish'],
    },
    {
      id: 'STR-004',
      asset: 'SOL/USD',
      type: 'SCALP',
      entry: 178.4,
      exit: 182.1,
      stopLoss: 176.0,
      confidence: 82,
      status: 'executed',
      pnl: 2.1,
      signals: ['15m Breakout', 'Momentum Surge', 'Order Book Imbalance', 'Delayed Ping: Buy Pressure'],
    },
    {
      id: 'STR-005',
      asset: 'NVDA',
      type: 'LONG',
      entry: 875,
      exit: 920,
      stopLoss: 855,
      confidence: 93,
      status: 'active',
      pnl: 2.8,
      signals: ['AI Catalyst', 'Earnings Beat', 'Institutional Flow', 'Pattern: Cup & Handle'],
    },
  ]);

  const [priceData, setPriceData] = useState<Array<{ time: string; price: number; volume: number; signal: number }>>([]);
  const [sentimentData, setSentimentData] = useState<Array<{ source: string; score: number; impact: string }>>([]);

  useEffect(() => {
    const data = Array.from({ length: 48 }, (_, i) => ({
      time: `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      price: 67000 + Math.sin(i / 5) * 2000 + Math.random() * 1000,
      volume: Math.floor(Math.random() * 5000 + 2000),
      signal: Math.random() > 0.8 ? 1 : 0,
    }));
    setPriceData(data);

    setSentimentData([
      { source: 'Twitter/X', score: 0.67, impact: 'Bullish' },
      { source: 'Reddit', score: 0.54, impact: 'Neutral-Bullish' },
      { source: 'News APIs', score: 0.72, impact: 'Bullish' },
      { source: 'Fear & Greed', score: 73, impact: 'Greed' },
      { source: 'Options Flow', score: 0.81, impact: 'Strong Bullish' },
      { source: 'Whale Alerts', score: 0.45, impact: 'Neutral' },
      { source: 'On-Chain Data', score: 0.63, impact: 'Bullish' },
      { source: 'Delayed Pings', score: 0.58, impact: 'Mild Bullish' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Trading Engine
          </h2>
          <p className="text-xs text-gray-500 mt-1">Multi-asset strategy generation with self-correcting entry/exit optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">5 Active Strategies</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
            <span className="text-xs text-cyan-400">Avg Confidence: 85.4%</span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300">BTC/USD — LIVE ANALYSIS</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400">● Entry: $67,420</span>
            <span className="text-cyan-400">● Target: $72,800</span>
            <span className="text-red-400">● Stop: $65,100</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#4b5563" fontSize={9} interval={5} />
            <YAxis stroke="#4b5563" fontSize={9} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGrad)" strokeWidth={2} />
            <Bar dataKey="volume" fill="#374151" opacity={0.3} />
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {strategies.map((strat) => (
          <div key={strat.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 hover:border-emerald-800/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  strat.type === 'LONG' ? 'bg-emerald-900/30 text-emerald-400' :
                  strat.type === 'SHORT' ? 'bg-red-900/30 text-red-400' :
                  strat.type === 'OPTIONS' ? 'bg-purple-900/30 text-purple-400' :
                  'bg-amber-900/30 text-amber-400'
                }`}>
                  {strat.type}
                </span>
                <span className="text-sm font-bold text-white">{strat.asset}</span>
                <span className="text-[10px] text-gray-500">{strat.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {strat.status === 'correcting' && (
                  <span className="text-[10px] text-amber-400 animate-pulse">⟳ CORRECTING</span>
                )}
                <span className={`text-xs font-bold ${strat.pnl > 0 ? 'text-emerald-400' : strat.pnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {strat.pnl > 0 ? '+' : ''}{strat.pnl}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <div className="text-[10px] text-gray-500">ENTRY</div>
                <div className="text-xs font-bold text-white">${strat.entry.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500">TARGET</div>
                <div className="text-xs font-bold text-emerald-400">${strat.exit.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500">STOP LOSS</div>
                <div className="text-xs font-bold text-red-400">${strat.stopLoss.toLocaleString()}</div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">CONFIDENCE</span>
                <span className="text-[10px] font-bold text-cyan-400">{strat.confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    strat.confidence > 90 ? 'bg-emerald-400' :
                    strat.confidence > 75 ? 'bg-cyan-400' :
                    'bg-amber-400'
                  }`}
                  style={{ width: `${strat.confidence}%` }}
                />
              </div>
            </div>

            {/* Signals */}
            <div className="flex flex-wrap gap-1">
              {strat.signals.map((signal, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-gray-800/50 text-gray-400 border border-gray-700/30">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          MULTI-SOURCE SENTIMENT ANALYSIS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sentimentData.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/30">
              <div className="text-[10px] text-gray-500 mb-1">{item.source}</div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${
                  typeof item.score === 'number' && item.score > 60 ? 'text-emerald-400' :
                  typeof item.score === 'number' && item.score > 0.6 ? 'text-emerald-400' :
                  'text-amber-400'
                }`}>
                  {typeof item.score === 'number' && item.score > 1 ? item.score : (item.score * 100).toFixed(0)}
                </span>
                <span className="text-[9px] text-gray-500">{item.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Execution Plan */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          EXECUTION PLAN — SELF-OPTIMIZING
        </h3>
        <div className="space-y-2">
          {[
            { step: '1', action: 'Scan all data feeds (price, volume, order book, delayed pings)', status: 'complete' },
            { step: '2', action: 'Analyze sentiment across 8+ sources (news, social, on-chain, flow)', status: 'complete' },
            { step: '3', action: 'Run pattern recognition (12 patterns, multi-timeframe)', status: 'complete' },
            { step: '4', action: 'Generate entry/exit with risk-reward optimization', status: 'complete' },
            { step: '5', action: 'Self-evaluate strategy against historical outcomes', status: 'active' },
            { step: '6', action: 'Brute-force parameter optimization (1000 combinations)', status: 'pending' },
            { step: '7', action: 'Final validation — Confirm 95%+ confidence threshold', status: 'pending' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[#0d0d14] border border-gray-800/20">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                item.status === 'complete' ? 'bg-emerald-900/30 text-emerald-400' :
                item.status === 'active' ? 'bg-cyan-900/30 text-cyan-400 animate-pulse' :
                'bg-gray-800/30 text-gray-500'
              }`}>
                {item.step}
              </div>
              <span className={`text-xs flex-1 ${
                item.status === 'complete' ? 'text-gray-400' :
                item.status === 'active' ? 'text-cyan-400' :
                'text-gray-600'
              }`}>
                {item.action}
              </span>
              <span className={`text-[10px] ${
                item.status === 'complete' ? 'text-emerald-400' :
                item.status === 'active' ? 'text-cyan-400' :
                'text-gray-600'
              }`}>
                {item.status === 'complete' ? '✓ DONE' : item.status === 'active' ? '⟳ RUNNING' : '○ WAITING'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
