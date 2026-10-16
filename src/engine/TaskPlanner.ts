/**
 * FORGE PROTOCOL - Task Planner
 * 
 * AI-powered task planning with:
 * - Dependency resolution
 * - Priority optimization
 * - Time estimation
 * - Schedule generation
 * - Self-correcting retry on failure
 * - Completion prediction
 */

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'retrying';
export type TaskCategory = 'work' | 'personal' | 'development' | 'finance' | 'health' | 'learning';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number;
  dependencies: string[]; // IDs of tasks that must complete first
  status: TaskStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: any;
  failureReason?: string;
  corrections: string[];
  confidence: number; // 0-100 predicted success rate
}

export interface ScheduleBlock {
  taskId: string;
  startTime: string; // HH:MM format
  endTime: string;
  duration: number;
  buffer: number; // Buffer time in minutes
}

export interface DayPlan {
  date: string;
  blocks: ScheduleBlock[];
  totalTasks: number;
  estimatedCompletion: string;
  successProbability: number;
  riskFactors: string[];
}

export interface PlannerConfig {
  workDayStart: string; // HH:MM
  workDayEnd: string; // HH:MM
  breakDuration: number; // Minutes
  bufferBetweenTasks: number; // Minutes buffer between tasks
  maxRetries: number; // Max retry attempts for failed tasks
  enablePrediction: boolean; // Enable completion prediction
}

export class TaskPlanner {
  private config: PlannerConfig;
  private tasks: Map<string, Task> = new Map();
  private taskCounter: number = 0;
  private completedHistory: Task[] = [];

  constructor(config: Partial<PlannerConfig> = {}) {
    this.config = {
      workDayStart: config.workDayStart ?? '08:00',
      workDayEnd: config.workDayEnd ?? '18:00',
      breakDuration: config.breakDuration ?? 30,
      bufferBetweenTasks: config.bufferBetweenTasks ?? 5,
      maxRetries: config.maxRetries ?? 3,
      enablePrediction: config.enablePrediction ?? true,
    };
  }

  /**
   * Add a new task
   */
  addTask(task: Omit<Task, 'id' | 'attempts' | 'corrections' | 'status' | 'createdAt' | 'confidence'>): string {
    const id = `T-${String(++this.taskCounter).padStart(3, '0')}`;
    
    const newTask: Task = {
      ...task,
      id,
      status: 'pending',
      attempts: 0,
      corrections: [],
      createdAt: Date.now(),
      confidence: this.calculateConfidence(task),
    };

    this.tasks.set(id, newTask);
    return id;
  }

  /**
   * Execute a task with self-correction on failure
   */
  async executeTask(
    taskId: string,
    executor: () => Promise<any>,
    validator?: (result: any) => { passed: boolean; reason?: string }
  ): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    // Check dependencies
    const unmetDeps = task.dependencies.filter(depId => {
      const dep = this.tasks.get(depId);
      return !dep || dep.status !== 'completed';
    });

    if (unmetDeps.length > 0) {
      throw new Error(`Task ${taskId} has unmet dependencies: ${unmetDeps.join(', ')}`);
    }

    task.status = 'in-progress';
    task.startedAt = Date.now();
    task.attempts++;

    try {
      const result = await executor();

      // Validate if validator provided
      if (validator) {
        const validation = validator(result);
        if (!validation.passed) {
          throw new Error(validation.reason ?? 'Validation failed');
        }
      }

      // Success
      task.status = 'completed';
      task.completedAt = Date.now();
      task.result = result;
      this.completedHistory.push({ ...task });
      
      console.log(`[PLANNER] Task ${taskId} completed successfully on attempt ${task.attempts}`);
      return result;

    } catch (error) {
      task.failureReason = String(error);
      
      // Self-correct and retry if under max attempts
      if (task.attempts < task.maxAttempts) {
        task.status = 'retrying';
        const correction = this.generateCorrection(task, String(error));
        task.corrections.push(correction);
        
        console.log(`[PLANNER] Task ${taskId} failed attempt ${task.attempts}. Correction: ${correction}. Retrying...`);
        
        // Recursive retry
        return this.executeTask(taskId, executor, validator);
      } else {
        task.status = 'failed';
        console.log(`[PLANNER] Task ${taskId} failed after ${task.attempts} attempts`);
        throw error;
      }
    }
  }

  /**
   * Generate optimized daily schedule
   */
  generateDayPlan(date?: string): DayPlan {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending' || t.status === 'retrying');

    // Topological sort for dependencies
    const sorted = this.topologicalSort(pendingTasks);
    
    // Generate schedule blocks
    const blocks: ScheduleBlock[] = [];
    let currentTime = this.timeToMinutes(this.config.workDayStart);
    const dayEnd = this.timeToMinutes(this.config.workDayEnd);

    for (const task of sorted) {
      const taskDuration = task.estimatedMinutes;
      const buffer = this.config.bufferBetweenTasks;
      
      if (currentTime + taskDuration + buffer > dayEnd) {
        break; // Can't fit more tasks today
      }

      const startTime = this.minutesToTime(currentTime);
      currentTime += taskDuration + buffer;
      const endTime = this.minutesToTime(currentTime - buffer);

      blocks.push({
        taskId: task.id,
        startTime,
        endTime,
        duration: taskDuration,
        buffer,
      });
    }

    // Calculate success probability
    const successProbability = this.calculateDaySuccessProbability(sorted, blocks);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(sorted);

    return {
      date: date ?? new Date().toISOString().split('T')[0],
      blocks,
      totalTasks: blocks.length,
      estimatedCompletion: blocks.length > 0 ? blocks[blocks.length - 1].endTime : this.config.workDayStart,
      successProbability,
      riskFactors,
    };
  }

  /**
   * Topological sort tasks by dependencies
   */
  private topologicalSort(tasks: Task[]): Task[] {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const visited = new Set<string>();
    const result: Task[] = [];

    const visit = (task: Task) => {
      if (visited.has(task.id)) return;
      visited.add(task.id);

      // Visit dependencies first
      for (const depId of task.dependencies) {
        const dep = taskMap.get(depId);
        if (dep) visit(dep);
      }

      result.push(task);
    };

    // Sort by priority first, then resolve dependencies
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    for (const task of sorted) {
      visit(task);
    }

    return result;
  }

  /**
   * Calculate confidence for a task
   */
  private calculateConfidence(task: Omit<Task, 'id' | 'attempts' | 'corrections' | 'status' | 'createdAt' | 'confidence'>): number {
    let confidence = 85; // Base confidence

    // Reduce for complexity (longer tasks = less confident)
    if (task.estimatedMinutes > 120) confidence -= 10;
    else if (task.estimatedMinutes > 60) confidence -= 5;

    // Reduce for dependencies
    confidence -= task.dependencies.length * 3;

    // Priority adjustment
    if (task.priority === 'critical') confidence -= 5; // Critical tasks are harder

    return Math.max(50, Math.min(100, confidence));
  }

  /**
   * Generate correction for a failed task
   */
  private generateCorrection(task: Task, error: string): string {
    // Analyze error and suggest correction
    if (error.includes('timeout')) {
      return 'Increase timeout threshold or break task into smaller subtasks';
    }
    if (error.includes('dependency')) {
      return 'Reorder execution sequence to satisfy dependencies';
    }
    if (error.includes('validation')) {
      return 'Adjust approach to meet validation criteria';
    }
    if (error.includes('resource')) {
      return 'Allocate additional resources or optimize resource usage';
    }
    return `Apply alternative approach: ${error}`;
  }

  /**
   * Calculate day success probability
   */
  private calculateDaySuccessProbability(tasks: Task[], blocks: ScheduleBlock[]): number {
    if (tasks.length === 0) return 100;

    const avgConfidence = tasks.reduce((sum, t) => sum + t.confidence, 0) / tasks.length;
    
    // Reduce for tight schedule
    const totalTime = blocks.reduce((sum, b) => sum + b.duration + b.buffer, 0);
    const availableTime = this.timeToMinutes(this.config.workDayEnd) - this.timeToMinutes(this.config.workDayStart);
    const schedulePressure = totalTime / availableTime;
    
    let probability = avgConfidence;
    
    // Reduce for high schedule pressure
    if (schedulePressure > 0.9) probability -= 15;
    else if (schedulePressure > 0.7) probability -= 5;

    // Reduce for dependency chains
    const maxChainLength = this.getDependencyChainLength(tasks);
    if (maxChainLength > 3) probability -= 10;

    return Math.max(0, Math.min(100, probability));
  }

  /**
   * Get longest dependency chain
   */
  private getDependencyChainLength(tasks: Task[]): number {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    const getChainLength = (task: Task, visited: Set<string> = new Set()): number => {
      if (visited.has(task.id)) return 0;
      visited.add(task.id);

      let maxLen = 0;
      for (const depId of task.dependencies) {
        const dep = taskMap.get(depId);
        if (dep) {
          maxLen = Math.max(maxLen, getChainLength(dep, visited));
        }
      }

      return maxLen + 1;
    };

    return Math.max(...tasks.map(t => getChainLength(t)));
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(tasks: Task[]): string[] {
    const risks: string[] = [];

    // Check for critical tasks
    const criticalTasks = tasks.filter(t => t.priority === 'critical');
    if (criticalTasks.length > 0) {
      risks.push(`${criticalTasks.length} critical priority task(s)`);
    }

    // Check for long dependency chains
    const maxChain = this.getDependencyChainLength(tasks);
    if (maxChain > 3) {
      risks.push(`Long dependency chain (${maxChain} tasks)`);
    }

    // Check for retrying tasks
    const retryingTasks = tasks.filter(t => t.status === 'retrying');
    if (retryingTasks.length > 0) {
      risks.push(`${retryingTasks.length} task(s) in retry mode`);
    }

    // Check for low confidence tasks
    const lowConfTasks = tasks.filter(t => t.confidence < 70);
    if (lowConfTasks.length > 0) {
      risks.push(`${lowConfTasks.length} task(s) with low confidence (<70%)`);
    }

    return risks;
  }

  /**
   * Utility: Convert HH:MM to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Utility: Convert minutes to HH:MM
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Get completed tasks
   */
  getCompletedTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'completed');
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending');
  }

  /**
   * Remove task
   */
  removeTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * Get planner statistics
   */
  getStats() {
    const allTasks = Array.from(this.tasks.values());
    const completed = allTasks.filter(t => t.status === 'completed');
    const failed = allTasks.filter(t => t.status === 'failed');
    const retrying = allTasks.filter(t => t.status === 'retrying');

    return {
      totalTasks: allTasks.length,
      completed: completed.length,
      failed: failed.length,
      retrying: retrying.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      avgConfidence: allTasks.length > 0
        ? allTasks.reduce((sum, t) => sum + t.confidence, 0) / allTasks.length
        : 0,
      totalAttempts: allTasks.reduce((sum, t) => sum + t.attempts, 0),
      successRate: completed.length + failed.length > 0
        ? (completed.length / (completed.length + failed.length)) * 100
        : 0,
    };
  }
}

// Export singleton
export const taskPlanner = new TaskPlanner();
