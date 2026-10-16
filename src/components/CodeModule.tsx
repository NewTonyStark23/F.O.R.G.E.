import { useState } from 'react';
import { Code2, CheckCircle2, XCircle, Zap, Play, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { codeVetter, VetResult } from '../engine';

export default function CodeModule() {
  const [code, setCode] = useState(`function authenticateUser(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  const apiKey = "sk-1234567890abcdef";
  
  if (password != null) {
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < roles.length; j++) {
        for (let k = 0; k < permissions.length; k++) {
          if (users[i].role === roles[j].name) {
            // TODO: fix this later
            document.getElementById('output').innerHTML = users[i].data;
          }
        }
      }
    }
  }
  
  return eval(query);
}`);
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState<VetResult | null>(null);
  const [isVetting, setIsVetting] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [history, setHistory] = useState<VetResult[]>([]);

  const vetCode = async () => {
    setIsVetting(true);
    setResult(null);
    setLog([]);

    addLog('[VETTER] Starting code analysis...');
    addLog(`[VETTER] Language: ${language} | Size: ${code.length} chars`);

    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('[VETTER] Running security scan...');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('[VETTER] Running performance analysis...');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('[VETTER] Calculating metrics...');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    addLog('[VETTER] Generating tests...');

    const vetResult = await codeVetter.vet(code, language);
    setResult(vetResult);
    setHistory(prev => [vetResult, ...prev].slice(0, 10));

    addLog(`[VETTER] Analysis complete — Score: ${vetResult.overallScore}/100`);
    addLog(`[VETTER] ${vetResult.passed ? '✓ PASSED' : '✗ FAILED'} — Win probability: ${vetResult.winProbability}%`);
    
    if (vetResult.analysis.issues.length > 0) {
      addLog(`[VETTER] Found ${vetResult.analysis.issues.length} issues`);
      vetResult.analysis.issues.forEach(issue => {
        addLog(`[${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }

    if (vetResult.corrections.length > 0) {
      addLog(`[VETTER] ${vetResult.corrections.length} corrections needed:`);
      vetResult.corrections.forEach(c => addLog(`[CORRECT] ${c}`));
    }

    vetResult.tests.forEach(test => {
      addLog(`[TEST] ${test.passed ? '✓' : '✗'} ${test.name} (${test.duration.toFixed(0)}ms)`);
    });

    setIsVetting(false);
  };

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const vetStats = codeVetter.getStats();

  const chartData = history.slice(0, 5).reverse().map((v, i) => ({
    name: `Vet #${i + 1}`,
    score: v.overallScore,
    winProb: v.winProbability,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            Code Forge — Live Vetter
          </h2>
          <p className="text-xs text-gray-500 mt-1">Paste code → Real-time analysis → Self-correcting validation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-purple-900/20 border border-purple-800/30">
            <span className="text-xs text-purple-400">{vetStats.totalVets} Reviews</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">Pass Rate: {vetStats.passRate.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Code Input */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300">INPUT CODE</h3>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#0a0a0f] border border-gray-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="sql">SQL</option>
            </select>
            <button
              onClick={vetCode}
              disabled={isVetting || !code.trim()}
              className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              {isVetting ? 'Vetting...' : 'Vet Code'}
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-[200px] bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-xs text-gray-300 font-mono resize-y focus:border-purple-500 focus:outline-none"
          placeholder="Paste your code here..."
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-[10px] text-gray-500">OVERALL SCORE</div>
              <div className={`text-3xl font-bold ${
                result.overallScore >= 95 ? 'text-emerald-400' :
                result.overallScore >= 75 ? 'text-cyan-400' :
                result.overallScore >= 50 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {result.overallScore}
              </div>
            </div>
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-[10px] text-gray-500">WIN PROBABILITY</div>
              <div className={`text-3xl font-bold ${
                result.winProbability >= 80 ? 'text-emerald-400' :
                result.winProbability >= 60 ? 'text-cyan-400' :
                'text-amber-400'
              }`}>
                {result.winProbability}%
              </div>
            </div>
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-[10px] text-gray-500">ISSUES FOUND</div>
              <div className={`text-3xl font-bold ${
                result.analysis.issues.length === 0 ? 'text-emerald-400' :
                result.analysis.issues.length <= 3 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {result.analysis.issues.length}
              </div>
            </div>
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-[10px] text-gray-500">STATUS</div>
              <div className={`text-xl font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.passed ? '✓ PASS' : '✗ FAIL'}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-300 mb-3">CODE METRICS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Complexity', value: result.analysis.metrics.complexity, max: 20 },
                { label: 'Lines', value: result.analysis.metrics.linesOfCode, max: 1000 },
                { label: 'Comments', value: `${(result.analysis.metrics.commentRatio * 100).toFixed(0)}%`, max: 100 },
                { label: 'Security', value: result.analysis.metrics.securityScore, max: 100 },
                { label: 'Performance', value: result.analysis.metrics.performanceScore, max: 100 },
                { label: 'Maintainability', value: result.analysis.metrics.maintainabilityScore, max: 100 },
                { label: 'Tests', value: `${result.tests.filter(t => t.passed).length}/${result.tests.length}`, max: result.tests.length },
              ].map((metric, i) => (
                <div key={i} className="p-2 rounded-lg bg-[#0d0d14] border border-gray-800/30">
                  <div className="text-[9px] text-gray-500">{metric.label}</div>
                  <div className={`text-sm font-bold ${
                    typeof metric.value === 'number' && metric.max === 100
                      ? metric.value >= 80 ? 'text-emerald-400' : metric.value >= 60 ? 'text-amber-400' : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          {result.analysis.issues.length > 0 && (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-300 mb-3">ISSUES DETECTED</h3>
              <div className="space-y-2">
                {result.analysis.issues.map((issue, i) => (
                  <div key={i} className={`p-2 rounded-lg border ${
                    issue.severity === 'critical' ? 'bg-red-900/10 border-red-800/30' :
                    issue.severity === 'high' ? 'bg-amber-900/10 border-amber-800/30' :
                    issue.severity === 'medium' ? 'bg-cyan-900/10 border-cyan-800/30' :
                    'bg-gray-800/10 border-gray-700/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        issue.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                        issue.severity === 'high' ? 'bg-amber-900/30 text-amber-400' :
                        issue.severity === 'medium' ? 'bg-cyan-900/30 text-cyan-400' :
                        'bg-gray-800/30 text-gray-400'
                      }`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        issue.type === 'security' ? 'bg-red-900/20 text-red-400' :
                        issue.type === 'performance' ? 'bg-amber-900/20 text-amber-400' :
                        'bg-gray-800/20 text-gray-400'
                      }`}>
                        {issue.type}
                      </span>
                      {issue.line && <span className="text-[9px] text-gray-500">Line {issue.line}</span>}
                    </div>
                    <div className="text-[11px] text-gray-300 mt-1">{issue.message}</div>
                    {issue.suggestion && (
                      <div className="text-[10px] text-emerald-400/70 mt-1">→ {issue.suggestion}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tests */}
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-300 mb-3">TEST RESULTS ({result.tests.filter(t => t.passed).length}/{result.tests.length} passed)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.tests.map((test, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded text-[11px] ${
                  test.passed ? 'bg-emerald-900/10 text-emerald-400' : 'bg-red-900/10 text-red-400'
                }`}>
                  {test.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span className="flex-1">{test.name}</span>
                  <span className="text-[9px] text-gray-500">{test.duration.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          </div>

          {/* Corrections */}
          {result.corrections.length > 0 && (
            <div className="bg-[#12121a] border border-amber-800/30 rounded-xl p-5">
              <h3 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                CORRECTIONS NEEDED ({result.corrections.length})
              </h3>
              <div className="space-y-1">
                {result.corrections.map((c, i) => (
                  <div key={i} className="text-[11px] text-amber-400/80 p-1.5 rounded bg-amber-900/10">
                    → {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* History Chart */}
      {history.length > 1 && (
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-3">VETTING HISTORY</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#4b5563" fontSize={9} />
              <YAxis stroke="#4b5563" fontSize={9} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#a855f7" name="Score" />
              <Bar dataKey="winProb" fill="#10b981" name="Win Prob" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Engine Log */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-3">VETTER LOG</h3>
        <div className="space-y-0.5 max-h-[200px] overflow-y-auto font-mono">
          {log.map((entry, i) => (
            <div key={i} className={`text-[11px] p-1 rounded ${
              entry.includes('[CORRECT]') ? 'text-amber-400/80' :
              entry.includes('✗') || entry.includes('[FAIL]') ? 'text-red-400/80' :
              entry.includes('✓') || entry.includes('PASSED') ? 'text-emerald-400/80' :
              entry.includes('[TEST]') ? 'text-cyan-400/80' :
              entry.includes('[SECURITY]') || entry.includes('[CRITICAL]') ? 'text-red-400/80' :
              entry.includes('[HIGH]') ? 'text-amber-400/80' :
              'text-purple-400/80'
            }`}>
              {entry}
            </div>
          ))}
          {log.length === 0 && (
            <div className="text-[11px] text-gray-500">Paste code and click "Vet Code" to start analysis...</div>
          )}
        </div>
      </div>
    </div>
  );
}
