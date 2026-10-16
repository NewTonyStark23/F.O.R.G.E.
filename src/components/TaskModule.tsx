import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Circle, AlertTriangle, Zap, Target, TrendingUp, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'retrying';
  category: string;
  dependencies: string[];
  confidence: number;
  attempts: number;
}

export default function TaskModule() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'T-001', title: 'Review Q4 financial reports', priority: 'critical', estimatedTime: 45, status: 'in-progress', category: 'Finance', dependencies: [], confidence: 92, attempts: 1 },
    { id: 'T-002', title: 'Prepare client presentation deck', priority: 'high', estimatedTime: 90, status: 'pending', category: 'Work', dependencies: ['T-001'], confidence: 88, attempts: 1 },
    { id: 'T-003', title: 'Schedule dentist appointment', priority: 'medium', estimatedTime: 15, status: 'completed', category: 'Personal', dependencies: [], confidence: 100, attempts: 1 },
    { id: 'T-004', title: 'Debug authentication flow', priority: 'high', estimatedTime: 60, status: 'retrying', category: 'Development', dependencies: [], confidence: 76, attempts: 3 },
    { id: 'T-005', title: 'Write unit tests for payment module', priority: 'high', estimatedTime: 120, status: 'pending', category: 'Development', dependencies: ['T-004'], confidence: 84, attempts: 1 },
    { id: 'T-006', title: 'Grocery shopping', priority: 'low', estimatedTime: 30, status: 'pending', category: 'Personal', dependencies: [], confidence: 95, attempts: 1 },
    { id: 'T-007', title: 'Team standup meeting', priority: 'medium', estimatedTime: 15, status: 'completed', category: 'Work', dependencies: [], confidence: 100, attempts: 1 },
    { id: 'T-008', title: 'Optimize database queries', priority: 'critical', estimatedTime: 90, status: 'pending', category: 'Development', dependencies: ['T-004'], confidence: 71, attempts: 1 },
  ]);

  const [schedule, setSchedule] = useState<Array<{ time: string; task: string; duration: number; status: string }>>([]);
  const [dayProgress, setDayProgress] = useState(0);
  const [expandedDay, setExpandedDay] = useState(true);

  useEffect(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    setDayProgress((completed / tasks.length) * 100);

    const scheduleItems = [
      { time: '08:00', task: 'Team standup meeting', duration: 15, status: 'done' },
      { time: '08:30', task: 'Review Q4 financial reports', duration: 45, status: 'active' },
      { time: '09:15', task: 'Debug authentication flow', duration: 60, status: 'retrying' },
      { time: '10:15', task: 'Optimize database queries', duration: 90, status: 'queued' },
      { time: '11:45', task: 'Write unit tests for payment module', duration: 120, status: 'queued' },
      { time: '14:00', task: 'Prepare client presentation deck', duration: 90, status: 'queued' },
      { time: '15:30', task: 'Grocery shopping', duration: 30, status: 'queued' },
    ];
    setSchedule(scheduleItems);
  }, [tasks]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Task Forge — Daily Planner
          </h2>
          <p className="text-xs text-gray-500 mt-1">AI-optimized scheduling with self-correcting task execution</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
            <span className="text-xs text-emerald-400">{tasks.filter(t => t.status === 'completed').length}/{tasks.length} Done</span>
          </div>
        </div>
      </div>

      {/* Day Progress */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300">DAY PROGRESS</h3>
          <span className="text-sm font-bold text-emerald-400">{dayProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${dayProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
          <span>Start of Day</span>
          <span>Optimal Completion Window</span>
          <span>End of Day</span>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setExpandedDay(!expandedDay)}>
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            OPTIMIZED SCHEDULE
          </h3>
          {expandedDay ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
        {expandedDay && (
          <div className="space-y-2">
            {schedule.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#0d0d14] border border-gray-800/20 hover:border-gray-700/40 transition-all">
                <span className="text-xs font-mono text-gray-500 w-12">{item.time}</span>
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'done' ? 'bg-emerald-400' :
                  item.status === 'active' ? 'bg-cyan-400 animate-pulse' :
                  item.status === 'retrying' ? 'bg-amber-400 animate-pulse' :
                  'bg-gray-600'
                }`} />
                <span className={`text-xs flex-1 ${
                  item.status === 'done' ? 'text-gray-500 line-through' :
                  item.status === 'active' ? 'text-cyan-400 font-medium' :
                  item.status === 'retrying' ? 'text-amber-400' :
                  'text-gray-300'
                }`}>
                  {item.task}
                </span>
                <span className="text-[10px] text-gray-500">{item.duration}m</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  item.status === 'done' ? 'bg-emerald-900/20 text-emerald-400' :
                  item.status === 'active' ? 'bg-cyan-900/20 text-cyan-400' :
                  item.status === 'retrying' ? 'bg-amber-900/20 text-amber-400' :
                  'bg-gray-800/30 text-gray-500'
                }`}>
                  {item.status === 'done' ? '✓ DONE' : item.status === 'active' ? '⟳ NOW' : item.status === 'retrying' ? '↻ RETRY' : '○ QUEUED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          TASK QUEUE — SELF-CORRECTING
        </h3>
        <div className="space-y-2">
          {tasks.map((task) => (
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
                    <span className="text-[10px] text-gray-500">{task.category}</span>
                    <span className="text-[10px] text-gray-500">⏱ {task.estimatedTime}m</span>
                    {task.dependencies.length > 0 && (
                      <span className="text-[10px] text-purple-400">Depends: {task.dependencies.join(', ')}</span>
                    )}
                    {task.attempts > 1 && (
                      <span className="text-[10px] text-amber-400">Attempt #{task.attempts}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">Confidence</div>
                  <div className={`text-xs font-bold ${
                    task.confidence > 90 ? 'text-emerald-400' :
                    task.confidence > 75 ? 'text-cyan-400' :
                    'text-amber-400'
                  }`}>
                    {task.confidence}%
                  </div>
                </div>
              </div>
              {task.status === 'retrying' && (
                <div className="mt-2 p-2 rounded bg-amber-900/10 border border-amber-800/20">
                  <div className="text-[10px] text-amber-400">
                    ⚡ SELF-CORRECTING: Failed {task.attempts - 1}x — Adjusting approach — Trying alternative method...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Analysis */}
      <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          COMPLETION PREDICTION ANALYSIS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500 mb-1">PREDICTED COMPLETION</div>
            <div className="text-lg font-bold text-emerald-400">15:45</div>
            <div className="text-[10px] text-gray-500">2h 15m before EOD</div>
          </div>
          <div className="p-4 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500 mb-1">SUCCESS PROBABILITY</div>
            <div className="text-lg font-bold text-cyan-400">94.2%</div>
            <div className="text-[10px] text-gray-500">Based on historical patterns</div>
          </div>
          <div className="p-4 rounded-lg bg-[#0d0d14] border border-gray-800/30">
            <div className="text-[10px] text-gray-500 mb-1">RISK FACTORS</div>
            <div className="text-lg font-bold text-amber-400">2</div>
            <div className="text-[10px] text-gray-500">Dependency chain, retry task</div>
          </div>
        </div>
      </div>
    </div>
  );
}
