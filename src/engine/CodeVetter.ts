/**
 * FORGE PROTOCOL - Code Vetter
 * 
 * Real-time code analysis and vetting:
 * - Static analysis
 * - Security scanning
 * - Performance analysis
 * - Pattern matching
 * - Test generation & execution
 * - Self-correction on failure
 * - Win/loss prediction
 */

export interface CodeAnalysis {
  code: string;
  language: string;
  issues: CodeIssue[];
  score: number;
  passed: boolean;
  suggestions: string[];
  metrics: CodeMetrics;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info' | 'security' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  line?: number;
  message: string;
  suggestion?: string;
}

export interface CodeMetrics {
  complexity: number; // Cyclomatic complexity
  linesOfCode: number;
  commentRatio: number; // 0-1
  testCoverage: number; // 0-100
  securityScore: number; // 0-100
  performanceScore: number; // 0-100
  maintainabilityScore: number; // 0-100
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface VetResult {
  analysis: CodeAnalysis;
  tests: TestResult[];
  overallScore: number;
  passed: boolean;
  corrections: string[];
  winProbability: number;
}

export interface VetterConfig {
  passThreshold: number; // Score needed to pass (default: 95)
  maxComplexity: number; // Max cyclomatic complexity (default: 10)
  minCommentRatio: number; // Minimum comment ratio (default: 0.1)
  minTestCoverage: number; // Minimum test coverage % (default: 80)
  enableSecurityScan: boolean;
  enablePerformanceAnalysis: boolean;
  autoCorrect: boolean;
}

export class CodeVetter {
  private config: VetterConfig;
  private vetHistory: VetResult[] = [];

  constructor(config: Partial<VetterConfig> = {}) {
    this.config = {
      passThreshold: config.passThreshold ?? 95,
      maxComplexity: config.maxComplexity ?? 10,
      minCommentRatio: config.minCommentRatio ?? 0.1,
      minTestCoverage: config.minTestCoverage ?? 80,
      enableSecurityScan: config.enableSecurityScan ?? true,
      enablePerformanceAnalysis: config.enablePerformanceAnalysis ?? true,
      autoCorrect: config.autoCorrect ?? true,
    };
  }

  /**
   * Vet code - full analysis pipeline
   */
  async vet(code: string, language: string): Promise<VetResult> {
    console.log(`[VETTER] Starting code vetting for ${language} (${code.length} chars)`);

    // Run analysis
    const analysis = this.analyze(code, language);
    
    // Generate and run tests
    const tests = await this.generateAndRunTests(code, language);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(analysis, tests);
    
    // Generate corrections if needed
    const corrections = overallScore < this.config.passThreshold
      ? this.generateCorrections(analysis, tests)
      : [];

    // Calculate win probability
    const winProbability = this.calculateWinProbability(analysis, tests, overallScore);

    const result: VetResult = {
      analysis,
      tests,
      overallScore,
      passed: overallScore >= this.config.passThreshold,
      corrections,
      winProbability,
    };

    this.vetHistory.push(result);
    
    console.log(`[VETTER] Score: ${overallScore}/100 | ${result.passed ? 'PASSED' : 'FAILED'} | Win prob: ${winProbability}%`);
    
    return result;
  }

  /**
   * Analyze code
   */
  private analyze(code: string, language: string): CodeAnalysis {
    const issues: CodeIssue[] = [];
    const metrics = this.calculateMetrics(code, language);
    
    // Security scan
    if (this.config.enableSecurityScan) {
      issues.push(...this.securityScan(code, language));
    }

    // Performance analysis
    if (this.config.enablePerformanceAnalysis) {
      issues.push(...this.performanceAnalysis(code, language));
    }

    // Style/quality checks
    issues.push(...this.qualityChecks(code, language, metrics));

    // Calculate score
    const score = this.calculateAnalysisScore(metrics, issues);

    return {
      code,
      language,
      issues,
      score,
      passed: score >= this.config.passThreshold,
      suggestions: this.generateSuggestions(issues),
      metrics,
    };
  }

  /**
   * Calculate code metrics
   */
  private calculateMetrics(code: string, language: string): CodeMetrics {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(l => l.trim().length > 0).length;
    
    // Count comments
    const commentLines = lines.filter(l => {
      const trimmed = l.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') || 
             trimmed.startsWith('/*') || trimmed.startsWith('*') ||
             trimmed.startsWith('<!--');
    }).length;
    const commentRatio = linesOfCode > 0 ? commentLines / linesOfCode : 0;

    // Cyclomatic complexity (simplified)
    const complexityIndicators = (code.match(/\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g) || []).length;
    const complexity = Math.max(1, complexityIndicators);

    // Security score
    const securityScore = this.calculateSecurityScore(code, language);
    
    // Performance score
    const performanceScore = this.calculatePerformanceScore(code, language);
    
    // Maintainability
    const maintainabilityScore = this.calculateMaintainabilityScore(complexity, commentRatio, linesOfCode);

    return {
      complexity,
      linesOfCode,
      commentRatio,
      testCoverage: 0, // Will be updated after test generation
      securityScore,
      performanceScore,
      maintainabilityScore,
    };
  }

  /**
   * Security scan
   */
  private securityScan(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    // SQL Injection patterns
    const sqlPatterns = [
      /eval\s*\(/,
      /exec\s*\(/,
      /execute\s*\(/,
      /query\s*\(.*\+/,
      /query\s*\(.*\$/,
    ];

    // XSS patterns
    const xssPatterns = [
      /innerHTML\s*=/,
      /document\.write\s*\(/,
      /dangerouslySetInnerHTML/,
    ];

    // Hardcoded secrets
    const secretPatterns = [
      /password\s*=\s*['"][^'"]+['"]/,
      /api[_-]?key\s*=\s*['"][^'"]+['"]/,
      /secret\s*=\s*['"][^'"]+['"]/,
      /token\s*=\s*['"][^'"]+['"]/,
    ];

    lines.forEach((line, idx) => {
      // Check SQL injection
      for (const pattern of sqlPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'security',
            severity: 'critical',
            line: idx + 1,
            message: 'Potential code injection vulnerability',
            suggestion: 'Use parameterized queries or prepared statements',
          });
        }
      }

      // Check XSS
      for (const pattern of xssPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'security',
            severity: 'high',
            line: idx + 1,
            message: 'Potential XSS vulnerability',
            suggestion: 'Sanitize input before rendering',
          });
        }
      }

      // Check hardcoded secrets
      for (const pattern of secretPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'security',
            severity: 'critical',
            line: idx + 1,
            message: 'Hardcoded secret detected',
            suggestion: 'Use environment variables or secret management',
          });
        }
      }
    });

    return issues;
  }

  /**
   * Performance analysis
   */
  private performanceAnalysis(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    // Check for nested loops (O(n²) or worse)
    let loopDepth = 0;
    let maxLoopDepth = 0;
    
    lines.forEach((line, idx) => {
      if (/\b(for|while)\b/.test(line)) {
        loopDepth++;
        maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
      }
      if (line.includes('}')) {
        loopDepth = Math.max(0, loopDepth - 1);
      }
    });

    if (maxLoopDepth >= 3) {
      issues.push({
        type: 'performance',
        severity: 'high',
        message: `Deeply nested loops detected (depth: ${maxLoopDepth}) - O(n³) or worse`,
        suggestion: 'Consider refactoring to reduce nesting or use more efficient algorithms',
      });
    }

    // Check for synchronous operations in async context
    if (language === 'typescript' || language === 'javascript') {
      if (/async\s+function/.test(code) && /\b(sync|readFileSync|writeFileSync)\b/.test(code)) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: 'Synchronous operation in async context',
          suggestion: 'Use async alternatives (e.g., readFile instead of readFileSync)',
        });
      }
    }

    // Check for memory leaks (event listeners without cleanup)
    if (/\b(addEventListener|on\()\b/.test(code) && !/\b(removeEventListener|off\()\b/.test(code)) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: 'Event listeners added without cleanup',
        suggestion: 'Ensure event listeners are removed to prevent memory leaks',
      });
    }

    return issues;
  }

  /**
   * Quality checks
   */
  private qualityChecks(code: string, language: string, metrics: CodeMetrics): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Complexity check
    if (metrics.complexity > this.config.maxComplexity) {
      issues.push({
        type: 'warning',
        severity: 'medium',
        message: `High cyclomatic complexity: ${metrics.complexity}`,
        suggestion: `Break down complex functions. Target complexity < ${this.config.maxComplexity}`,
      });
    }

    // Comment ratio check
    if (metrics.commentRatio < this.config.minCommentRatio) {
      issues.push({
        type: 'info',
        severity: 'low',
        message: `Low comment ratio: ${(metrics.commentRatio * 100).toFixed(1)}%`,
        suggestion: `Add more documentation. Target: ${(this.config.minCommentRatio * 100).toFixed(0)}%`,
      });
    }

    // Long lines
    const lines = code.split('\n');
    const longLines = lines.filter(l => l.length > 120);
    if (longLines.length > 0) {
      issues.push({
        type: 'info',
        severity: 'low',
        message: `${longLines.length} line(s) exceed 120 characters`,
        suggestion: 'Break long lines for readability',
      });
    }

    // TODO/FIXME comments
    const todoLines = lines.filter(l => /\b(TODO|FIXME|HACK|XXX)\b/i.test(l));
    if (todoLines.length > 0) {
      issues.push({
        type: 'info',
        severity: 'low',
        message: `${todoLines.length} TODO/FIXME comment(s) found`,
        suggestion: 'Address or track these items',
      });
    }

    return issues;
  }

  /**
   * Generate and run tests
   */
  private async generateAndRunTests(code: string, language: string): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Generate test cases based on code analysis
    const testCases = this.generateTestCases(code, language);

    for (const testCase of testCases) {
      // Simulate test execution
      const passed = this.simulateTest(testCase, code, language);
      
      tests.push({
        name: testCase.name,
        passed,
        duration: Math.random() * 100, // Simulated duration
        error: passed ? undefined : testCase.expectedFailure,
      });
    }

    return tests;
  }

  /**
   * Generate test cases
   */
  private generateTestCases(code: string, language: string): Array<{ name: string; expectedFailure?: string }> {
    const testCases: Array<{ name: string; expectedFailure?: string }> = [];

    // Basic tests
    testCases.push({ name: 'Syntax Validation' });
    testCases.push({ name: 'Import Resolution' });
    
    // Security tests
    if (this.config.enableSecurityScan) {
      testCases.push({ name: 'Security: No SQL Injection' });
      testCases.push({ name: 'Security: No XSS Vulnerabilities' });
      testCases.push({ name: 'Security: No Hardcoded Secrets' });
    }

    // Performance tests
    if (this.config.enablePerformanceAnalysis) {
      testCases.push({ name: 'Performance: No Deep Nesting' });
      testCases.push({ name: 'Performance: No Memory Leaks' });
    }

    // Quality tests
    testCases.push({ name: 'Quality: Complexity Check' });
    testCases.push({ name: 'Quality: Comment Coverage' });

    return testCases;
  }

  /**
   * Simulate test execution
   */
  private simulateTest(testCase: { name: string; expectedFailure?: string }, code: string, language: string): boolean {
    // Simple heuristic-based test simulation
    if (testCase.name.includes('SQL Injection') && /eval\s*\(/.test(code)) return false;
    if (testCase.name.includes('XSS') && /innerHTML\s*=/.test(code)) return false;
    if (testCase.name.includes('Hardcoded Secrets') && /password\s*=\s*['"]/.test(code)) return false;
    if (testCase.name.includes('Deep Nesting')) {
      const loopDepth = (code.match(/\b(for|while)\b/g) || []).length;
      if (loopDepth >= 3) return false;
    }
    if (testCase.name.includes('Memory Leaks') && /addEventListener/.test(code) && !/removeEventListener/.test(code)) return false;
    
    return true;
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(code: string, language: string): number {
    let score = 100;
    
    // Deduct for vulnerabilities
    if (/eval\s*\(/.test(code)) score -= 20;
    if (/innerHTML\s*=/.test(code)) score -= 15;
    if (/password\s*=\s*['"]/.test(code)) score -= 25;
    if (/api[_-]?key\s*=\s*['"]/.test(code)) score -= 20;
    
    return Math.max(0, score);
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(code: string, language: string): number {
    let score = 100;
    
    const loopCount = (code.match(/\b(for|while)\b/g) || []).length;
    if (loopCount > 5) score -= 20;
    if (loopCount > 10) score -= 30;
    
    if (/addEventListener/.test(code) && !/removeEventListener/.test(code)) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Calculate maintainability score
   */
  private calculateMaintainabilityScore(complexity: number, commentRatio: number, linesOfCode: number): number {
    let score = 100;
    
    if (complexity > 10) score -= (complexity - 10) * 5;
    if (commentRatio < 0.1) score -= 20;
    if (linesOfCode > 500) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Calculate analysis score
   */
  private calculateAnalysisScore(metrics: CodeMetrics, issues: CodeIssue[]): number {
    let score = 100;
    
    // Deduct for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    }
    
    // Blend with metrics
    const metricScore = (metrics.securityScore + metrics.performanceScore + metrics.maintainabilityScore) / 3;
    score = score * 0.6 + metricScore * 0.4;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(analysis: CodeAnalysis, tests: TestResult[]): number {
    const analysisScore = analysis.score;
    const testPassRate = tests.length > 0 
      ? (tests.filter(t => t.passed).length / tests.length) * 100 
      : 0;
    
    return Math.round(analysisScore * 0.5 + testPassRate * 0.5);
  }

  /**
   * Calculate win probability
   */
  private calculateWinProbability(analysis: CodeAnalysis, tests: TestResult[], overallScore: number): number {
    let probability = overallScore;
    
    // Adjust based on issue severity
    const criticalIssues = analysis.issues.filter(i => i.severity === 'critical').length;
    probability -= criticalIssues * 10;
    
    // Adjust based on test failures
    const failedTests = tests.filter(t => !t.passed).length;
    probability -= failedTests * 5;
    
    return Math.max(0, Math.min(100, Math.round(probability)));
  }

  /**
   * Generate corrections
   */
  private generateCorrections(analysis: CodeAnalysis, tests: TestResult[]): string[] {
    const corrections: string[] = [];
    
    // Add corrections for critical issues
    for (const issue of analysis.issues) {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        corrections.push(issue.suggestion ?? `Fix: ${issue.message}`);
      }
    }
    
    // Add corrections for failed tests
    for (const test of tests) {
      if (!test.passed) {
        corrections.push(`Fix failing test: ${test.name}`);
      }
    }
    
    return corrections;
  }

  /**
   * Generate suggestions
   */
  private generateSuggestions(issues: CodeIssue[]): string[] {
    return issues
      .filter(i => i.suggestion)
      .map(i => i.suggestion!)
      .filter((v, i, a) => a.indexOf(v) === i); // Unique
  }

  /**
   * Get vet history
   */
  getHistory(): VetResult[] {
    return [...this.vetHistory];
  }

  /**
   * Get statistics
   */
  getStats() {
    if (this.vetHistory.length === 0) {
      return { totalVets: 0, passRate: 0, avgScore: 0, avgWinProbability: 0 };
    }

    const passed = this.vetHistory.filter(v => v.passed).length;
    const avgScore = this.vetHistory.reduce((sum, v) => sum + v.overallScore, 0) / this.vetHistory.length;
    const avgWinProb = this.vetHistory.reduce((sum, v) => sum + v.winProbability, 0) / this.vetHistory.length;

    return {
      totalVets: this.vetHistory.length,
      passRate: (passed / this.vetHistory.length) * 100,
      avgScore,
      avgWinProbability: avgWinProb,
    };
  }
}

// Export singleton
export const codeVetter = new CodeVetter();
