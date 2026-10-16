import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Circle, AlertTriangle, Target, Plus, Play } from 'lucide-react';
import { taskPlanner, Task, DayPlan } from '../engine';

export default function TaskModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskTime, setNewTaskTime] = useState(30);
  const [log, setLog] = useState<string[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    refreshTasks();
    generatePlan();
  }, []);

  const refreshTasks = () => {
    setTasks(taskPlanner.getTasks());
  };

  const generatePlan = () => {
    const plan = taskPlanner.generateDayPlan();
    setDayPlan(plan);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const id = taskPlanner.addTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      category: 'work',
      estimatedMinutes: newTaskTime,
      dependencies: [],
      maxAttempts: 3,
    });

    addLog(`[PLANNER] Task added: ${id} — "${newTaskTitle}" (${newTaskPriority})`);
    setNewTaskTitle('');
    refreshTasks();
    generatePlan();
  };

  const executeTask = async (taskId: string) => {
    setExecuting(taskId);
    addLog(`[PLANNER] Executing task ${taskId}...`);

    try {
      await taskPlanner.executeTask(
        taskId,
        async () => {
          // Simulate task execution with random success/failure
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 70% chance of success on first try
          if (Math.random() > 0.3) {
            return { success: true, quality: 0.95 };
          } else {
            throw new Error('Task execution failed — quality below threshold');
          }
        },
        (result) => ({
          passed: result.quality > 0.85,
          reason: result.quality <= 0.85 ? 'Quality below 85% threshold' : undefined,
        })
      );

      addLog(`[PLANNER] Task ${taskId} completed successfully!`);
    } catch (error) {
      addLog(`[PLANNER] Task ${taskId} failed after max retries: ${error}`);
    }

    setExecuting(null);
    refreshTasks();
    generatePlan();
  };

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-800/30';
      case 'high': return 'text-amber-400 bg-amber-900/20 border-amber-800/30';
      case 'medium': return 'text-cyan-400 bg-cyan-900/20 border-cyan-800/30';
      case 'low': return 'text-gray-400 bg-gray-800/20 border-gray-700/30';
      default: return 'text-gray-400 bg-gray-800/20 border-gray-700/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'in-progress': return <div className="w-4 h-4 rounded-full border-2 border-cyan-400 animate-spin border-t-transparent" />;
      case 'retrying': return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'failed': return <div className="w-4 h-4 rounded-full border-2 border-red-400" />;
      default: return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const stats = taskPlanner.getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Task Forge — Live Engine
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real task planning with dependency resolution and self-correcting execution</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">{stats.completed}/{stats.totalTasks} Done</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
            <span className="text-xs text-cyan-400">Success: {stats.successRate.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-300 mb-3">ADD NEW TASK</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="flex-1 min-w-[200px] bg-[#0a0a0f] border border-gray-700 rounded px-3 py-1.5 text-xs text-white placeholder-gray-500"
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as any)}
            className="bg-[#0a0a0f] border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(Number(e.target.value))}
              className="w-16 bg-[#0a0a0f] border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
              min={5}
              max={480}
            />
            <span className="text-[10px] text-gray-500">min</span>
          </div>
          <button
            onClick={addTask}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Task
          </button>
        </div>
      </div>

      {/* Day Plan */}
      {dayPlan && (
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              OPTIMIZED SCHEDULE — {dayPlan.date}
            </h3>
            <button
              onClick={generatePlan}
              className="px-2 py-1 rounded text-[10px] bg-gray-800 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              ↻ Regenerate
            </button>
          </div>
          
          {dayPlan.blocks.length > 0 ? (
            <div className="space-y-2">
              {dayPlan.blocks.map((block, i) => {
                const task = tasks.find(t => t.id === block.taskId);
                return (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-lg bg-[#0d0d14] border border-gray-800/20">
                    <span className="text-xs font-mono text-gray-500 w-12">{block.startTime}</span>
                    <span className="text-xs flex-1 text-gray-300">{task?.title ?? block.taskId}</span>
                    <span className="text-[10px] text-gray-500">{block.duration}m</span>
                    {task && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No tasks scheduled. Add tasks above.</div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-2 rounded bg-[#0d0d14] border border-gray-800/30">
              <div className="text-[10px] text-gray-500">COMPLETION</div>
              <div className="text-xs font-bold text-emerald-400">{dayPlan.estimatedCompletion}</div>
            </div>
            <div className="p-2 rounded bg-[#0d0d14] border border-gray-800/30">
              <div className="text-[10px] text-gray-500">SUCCESS PROB</div>
              <div className="text-xs font-bold text-cyan-400">{dayPlan.successProbability.toFixed(0)}%</div>
            </div>
            <div className="p-2 rounded bg-[#0d0d14] border border-gray-800/30">
              <div className="text-[10px] text-gray-500">RISK FACTORS</div>
              <div className="text-xs font-bold text-amber-400">{dayPlan.riskFactors.length}</div>
            </div>
          </div>

          {dayPlan.riskFactors.length > 0 && (
            <div className="mt-2 p-2 rounded bg-amber-900/10 border border-amber-800/20">
              <div className="text-[10px] text-amber-400">
                ⚠ Risks: {dayPlan.riskFactors.join(' | ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task List */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          TASK QUEUE — SELF-CORRECTING EXECUTION
        </h3>
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-xs text-gray-500 p-3">No tasks yet. Add tasks above to begin.</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-3 rounded-lg bg-[#0d0d14] border border-gray-800/20 hover:border-gray-700/40 transition-all">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'
                      }`}>
                        {task.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500">⏱ {task.estimatedMinutes}m</span>
                      <span className="text-[10px] text-gray-500">Attempt #{task.attempts}/{task.maxAttempts}</span>
                      <span className={`text-[10px] ${
                        task.confidence > 85 ? 'text-emerald-400' :
                        task.confidence > 70 ? 'text-cyan-400' :
                        'text-amber-400'
                      }`}>
                        Confidence: {task.confidence}%
                      </span>
                    </div>
                  </div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => executeTask(task.id)}
                      disabled={executing === task.id}
                      className="px-2 py-1 rounded text-[10px] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Execute
                    </button>
                  )}
                  {executing === task.id && (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 animate-spin border-t-transparent" />
                  )}
                </div>
                {task.status === 'retrying' && task.corrections.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-amber-900/10 border border-amber-800/20">
                    <div className="text-[10px] text-amber-400 font-bold mb-1">SELF-CORRECTING:</div>
                    {task.corrections.map((c, i) => (
                      <div key={i} className="text-[10px] text-amber-400/70">→ {c}</div>
                    ))}
                  </div>
                )}
                {task.failureReason && task.status === 'failed' && (
                  <div className="mt-2 p-2 rounded bg-red-900/10 border border-red-800/20">
                    <div className="text-[10px] text-red-400">✗ Failed: {task.failureReason}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Engine Log */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-3">ENGINE LOG</h3>
        <div className="space-y-0.5 max-h-[150px] overflow-y-auto font-mono">
          {log.map((entry, i) => (
            <div key={i} className="text-[11px] text-emerald-400/80 p-1 rounded">
              {entry}
            </div>
          ))}
          {log.length === 0 && (
            <div className="text-[11px] text-gray-500">Add and execute tasks to see engine activity...</div>
          )}
        </div>
      </div>
    </div>
  );
}
