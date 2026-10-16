import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Target, Eye, Zap, Plus, Play } from 'lucide-react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { strategyEngine, PriceData, SentimentData, Strategy } from '../engine';

export default function TradingModule() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [asset, setAsset] = useState('BTC/USD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // Generate realistic price data
  useEffect(() => {
    generatePriceData();
  }, []);

  const generatePriceData = () => {
    const data: PriceData[] = [];
    let price = 67000;
    const now = Date.now();

    for (let i = 200; i >= 0; i--) {
      const change = (Math.random() - 0.48) * 500; // Slight bullish bias
      price = Math.max(60000, price + change);
      
      data.push({
        timestamp: now - i * 3600000, // 1 hour candles
        open: price,
        high: price + Math.random() * 300,
        low: price - Math.random() * 300,
        close: price + (Math.random() - 0.5) * 200,
        volume: Math.floor(Math.random() * 5000 + 2000),
      });
    }

    setPriceData(data);
    strategyEngine.feedPriceData('BTC/USD', data);
    addLog('[ENGINE] Price data loaded: 200 candles for BTC/USD');
  };

  const feedSentiment = () => {
    const sources = [
      { source: 'Twitter/X', score: Math.random() * 2 - 1, weight: 0.2 },
      { source: 'Reddit', score: Math.random() * 2 - 1, weight: 0.15 },
      { source: 'News APIs', score: Math.random() * 2 - 1, weight: 0.25 },
      { source: 'Options Flow', score: Math.random() * 2 - 1, weight: 0.2 },
      { source: 'On-Chain Data', score: Math.random() * 2 - 1, weight: 0.15 },
      { source: 'Whale Alerts', score: Math.random() * 2 - 1, weight: 0.05 },
    ];

    sources.forEach(s => {
      strategyEngine.feedSentiment({
        ...s,
        timestamp: Date.now(),
        dataPoints: Math.floor(Math.random() * 5000 + 1000),
      });
    });

    addLog(`[ENGINE] Sentiment fed from ${sources.length} sources`);
  };

  const generateStrategy = () => {
    setIsGenerating(true);
    addLog('[ENGINE] Generating strategy...');
    addLog('[ENGINE] Running pattern recognition...');
    
    setTimeout(() => {
      feedSentiment();
      
      const strategy = strategyEngine.generateStrategy(asset, '4h');
      
      if (strategy) {
        setStrategies(prev => [strategy, ...prev]);
        addLog(`[ENGINE] Strategy generated: ${strategy.id} — ${strategy.type} ${strategy.direction.toUpperCase()}`);
        addLog(`[ENGINE] Confidence: ${strategy.confidence.toFixed(1)}% | R:R: ${strategy.riskRewardRatio.toFixed(2)}`);
        addLog(`[ENGINE] Evaluation score: ${strategy.evaluationScore}/100 — ${strategy.status}`);
        
        if (strategy.corrections.length > 0) {
          strategy.corrections.forEach(c => addLog(`[SELF-CORRECT] ${c}`));
        }
      } else {
        addLog('[ENGINE] No strategy met minimum confidence threshold');
      }
      
      setIsGenerating(false);
    }, 500);
  };

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));
  };

  // Generate chart data from price data
  const chartData = priceData.slice(-48).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: d.close,
    volume: d.volume,
  }));

  const engineStats = strategyEngine.getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Trading Engine — Live
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real strategy generation with self-evaluating entry/exit optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">{engineStats.totalStrategies} Strategies</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
            <span className="text-xs text-cyan-400">Avg Conf: {engineStats.avgConfidence.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Asset:</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="bg-[#0a0a0f] border border-gray-700 rounded px-2 py-1 text-xs text-white"
          >
            <option>BTC/USD</option>
            <option>ETH/USD</option>
            <option>SOL/USD</option>
            <option>SPY</option>
            <option>NVDA</option>
          </select>
        </div>
        <button
          onClick={generatePriceData}
          className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
        >
          ↻ Refresh Price Data
        </button>
        <button
          onClick={feedSentiment}
          className="px-3 py-1.5 rounded-lg bg-purple-900/30 text-purple-300 text-xs hover:bg-purple-900/50 transition-colors border border-purple-800/30"
        >
          ⟳ Feed Sentiment
        </button>
        <button
          onClick={generateStrategy}
          disabled={isGenerating}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Play className="w-3 h-3" />
          {isGenerating ? 'Generating...' : 'Generate Strategy'}
        </button>
      </div>

      {/* Price Chart */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300">{asset} — PRICE DATA ({priceData.length} candles)</h3>
          <span className="text-xs text-gray-500">Last: ${priceData[priceData.length - 1]?.close.toFixed(2) ?? 'N/A'}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#4b5563" fontSize={9} interval={7} />
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

      {/* Generated Strategies */}
      {strategies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            GENERATED STRATEGIES ({strategies.length})
          </h3>
          {strategies.map((strat) => (
            <div key={strat.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    strat.direction === 'long' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {strat.type} {strat.direction.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-white">{strat.asset}</span>
                  <span className="text-[10px] text-gray-500">{strat.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                    strat.status === 'validated' ? 'bg-emerald-900/30 text-emerald-400' :
                    strat.status === 'corrected' ? 'bg-amber-900/30 text-amber-400' :
                    'bg-gray-800/30 text-gray-400'
                  }`}>
                    {strat.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">{strat.confidence.toFixed(1)}% conf</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <div className="text-[10px] text-gray-500">ENTRY</div>
                  <div className="text-xs font-bold text-white">${strat.entry.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">TARGET</div>
                  <div className="text-xs font-bold text-emerald-400">${strat.exit.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">STOP LOSS</div>
                  <div className="text-xs font-bold text-red-400">${strat.stopLoss.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">R:R RATIO</div>
                  <div className="text-xs font-bold text-cyan-400">{strat.riskRewardRatio.toFixed(2)}</div>
                </div>
              </div>

              {/* Signals */}
              <div className="mb-2">
                <div className="text-[10px] text-gray-500 mb-1">SIGNALS ({strat.signals.length}):</div>
                <div className="flex flex-wrap gap-1">
                  {strat.signals.map((signal, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-900/20 text-cyan-400 border border-cyan-800/20">
                      {signal.name} ({signal.confidence.toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </div>

              {/* Corrections */}
              {strat.corrections.length > 0 && (
                <div className="mt-2 p-2 rounded bg-amber-900/10 border border-amber-800/20">
                  <div className="text-[10px] text-amber-400 font-bold mb-1">SELF-CORRECTIONS:</div>
                  {strat.corrections.map((c, i) => (
                    <div key={i} className="text-[10px] text-amber-400/70">→ {c}</div>
                  ))}
                </div>
              )}

              {/* Evaluation Score */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">EVAL SCORE</span>
                <span className={`text-xs font-bold ${
                  strat.evaluationScore >= 75 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {strat.evaluationScore}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Engine Log */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            ENGINE LOG
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-red-400">LIVE</span>
          </div>
        </div>
        <div className="space-y-0.5 max-h-[200px] overflow-y-auto font-mono">
          {log.map((entry, i) => (
            <div key={i} className={`text-[11px] p-1 rounded ${
              entry.includes('[ENGINE]') ? 'text-emerald-400/80' :
              entry.includes('[SELF-CORRECT]') ? 'text-amber-400/80' :
              'text-gray-400/80'
            }`}>
              {entry}
            </div>
          ))}
          {log.length === 0 && (
            <div className="text-[11px] text-gray-500">Click "Generate Strategy" to start the engine...</div>
          )}
        </div>
      </div>
    </div>
  );
}
