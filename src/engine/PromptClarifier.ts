/**
 * FORGE PROTOCOL - Prompt Clarifier
 * 
 * Takes messy, typo-ridden, sloppy user input and:
 * 1. Detects and corrects typos (edit distance + dictionary)
 * 2. Fixes grammar and punctuation
 * 3. Breaks run-on sentences
 * 4. Identifies intent and entities
 * 5. Re-organizes into clean structured prompt
 * 6. Shows interpretation so AI can verify understanding
 * 
 * This is for AI agents to use - not a user-facing panel.
 */

export interface ClarifiedPrompt {
  original: string;
  cleaned: string;
  structured: StructuredPrompt;
  interpretation: Interpretation;
  corrections: Correction[];
  confidence: number; // 0-100 how confident we are in the interpretation
  qualityScore: number; // 0-100 quality of original input
}

export interface StructuredPrompt {
  intent: string;
  domain: string;
  entities: Entity[];
  constraints: string[];
  questions: string[];
  action: string;
  context: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface Entity {
  text: string;
  type: 'asset' | 'action' | 'timeframe' | 'quantity' | 'target' | 'tool' | 'concept' | 'person' | 'location';
  normalized: string;
}

export interface Interpretation {
  summary: string;
  keyPoints: string[];
  assumptions: string[];
  ambiguities: string[];
  suggestedClarifications: string[];
}

export interface Correction {
  original: string;
  corrected: string;
  type: 'typo' | 'grammar' | 'punctuation' | 'runon' | 'ambiguous' | 'slop';
  position: number;
  confidence: number;
}

// Common typo dictionary - maps misspellings to corrections
const TYPO_DICT: Record<string, string> = {
  // Common misspellings
  'teh': 'the',
  'adn': 'and',
  'taht': 'that',
  'wiht': 'with',
  'thier': 'their',
  'recieve': 'receive',
  'seperate': 'separate',
  'occured': 'occurred',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'neccessary': 'necessary',
  'wether': 'whether',
  'alot': 'a lot',
  
  // Trading/finance
  'strading': 'trading',
  'crytpo': 'crypto',
  'stockes': 'stocks',
  'optoins': 'options',
  'futrues': 'futures',
  'porftolio': 'portfolio',
  
  // Tech/coding
  'funciton': 'function',
  'varible': 'variable',
  'paramater': 'parameter',
  'algorithim': 'algorithm',
  'databse': 'database',
  'apii': 'api',
  'reponse': 'response',
  'reqeust': 'request',
  
  // General slop
  'plz': 'please',
  'thx': 'thanks',
  'ur': 'your',
  'im': 'i\'m',
  'dont': 'don\'t',
  'cant': 'can\'t',
  'wont': 'won\'t',
  'didnt': 'didn\'t',
  'doesnt': 'doesn\'t',
  'wasnt': 'wasn\'t',
  'isnt': 'isn\'t',
  'wouldnt': 'wouldn\'t',
  'shouldnt': 'shouldn\'t',
  'couldnt': 'couldn\'t',
  
  // Common word confusions
  'analitical': 'analytical',
  'analitcal': 'analytical',
  'analitycal': 'analytical',
  'schedulings': 'scheduling',
  'schedulin': 'scheduling',
  'predic': 'predict',
  'rpedic': 'predict',
  'prediciton': 'prediction',
  'sucess': 'success',
  'succes': 'success',
  
  // Specific typos
  'delyed': 'delayed',
  'analysys': 'analysis',
  'helpo': 'help',
  'somthing': 'something',
  'achive': 'achieve',
  'brut': 'brute',
  'forc': 'force',
};

// Domain detection keywords
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'trading': ['trade', 'stock', 'crypto', 'option', 'short', 'long', 'entry', 'exit', 'stop', 'target', 'position', 'order', 'market', 'limit', 'candle', 'chart', 'indicator', 'rsi', 'macd', 'bollinger', 'support', 'resistance', 'breakout', 'momentum'],
  'coding': ['code', 'function', 'variable', 'api', 'database', 'server', 'client', 'frontend', 'backend', 'deploy', 'test', 'debug', 'refactor', 'optimize', 'implement', 'build', 'compile', 'runtime', 'error', 'bug', 'fix'],
  'planning': ['plan', 'schedule', 'task', 'todo', 'deadline', 'priority', 'meeting', 'appointment', 'calendar', 'organize', 'prepare', 'review', 'complete', 'finish'],
  'analysis': ['analyze', 'analysis', 'data', 'pattern', 'trend', 'predict', 'forecast', 'evaluate', 'assess', 'measure', 'metric', 'statistic', 'report'],
  'ai_agent': ['agent', 'ai', 'prompt', 'model', 'llm', 'neural', 'train', 'inference', 'token', 'embedding', 'vector', 'rag', 'chain', 'tool', 'function'],
};

export class PromptClarifier {
  private customDictionary: Map<string, string> = new Map();
  private domainContext: string = '';

  constructor() {
    // Load custom dictionary
    Object.entries(TYPO_DICT).forEach(([k, v]) => this.customDictionary.set(k, v));
  }

  /**
   * Main entry point - clarify a messy prompt
   */
  clarify(rawInput: string): ClarifiedPrompt {
    const qualityScore = this.assessQuality(rawInput);
    const corrections = this.detectCorrections(rawInput);
    const cleaned = this.applyCorrections(rawInput, corrections);
    const sentences = this.splitSentences(cleaned);
    const structured = this.extractStructure(sentences, cleaned);
    const interpretation = this.buildInterpretation(structured, corrections);
    const confidence = this.calculateConfidence(corrections, qualityScore);

    return {
      original: rawInput,
      cleaned,
      structured,
      interpretation,
      corrections,
      confidence,
      qualityScore,
    };
  }

  /**
   * Assess quality of raw input (0-100)
   */
  private assessQuality(input: string): number {
    let score = 100;
    
    // Check for excessive typos
    const words = input.toLowerCase().split(/\s+/);
    const typoCount = words.filter(w => this.customDictionary.has(w)).length;
    score -= Math.min(typoCount * 5, 30);

    // Check for run-on sentences (no punctuation for long stretches)
    const avgSentenceLength = input.length / (input.split(/[.!?]+/).length || 1);
    if (avgSentenceLength > 100) score -= 20;
    else if (avgSentenceLength > 60) score -= 10;

    // Check for missing capitalization
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uncapitalized = sentences.filter(s => s.trim()[0] && s.trim()[0] === s.trim()[0].toLowerCase()).length;
    if (uncapitalized > sentences.length * 0.5) score -= 15;

    // Check for excessive filler words
    const fillers = (input.match(/\b(um|uh|like|basically|actually|just|so|well)\b/gi) || []).length;
    score -= Math.min(fillers * 3, 15);

    // Check for repeated characters (slop indicator)
    if (/([a-z])\1{3,}/i.test(input)) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Detect all corrections needed
   */
  private detectCorrections(input: string): Correction[] {
    const corrections: Correction[] = [];
    const lower = input.toLowerCase();
    const words = lower.split(/\b/);

    // Detect typos
    words.forEach((word, i) => {
      const cleanWord = word.replace(/[^a-z']/g, '');
      if (this.customDictionary.has(cleanWord)) {
        corrections.push({
          original: cleanWord,
          corrected: this.customDictionary.get(cleanWord)!,
          type: 'typo',
          position: input.toLowerCase().indexOf(cleanWord),
          confidence: 95,
        });
      }
    });

    // Detect run-on sentences (no punctuation for > 80 chars)
    const segments = input.split(/(?<=[.!?])\s+/);
    segments.forEach(segment => {
      if (segment.length > 100 && !/[.!?]/.test(segment.slice(0, -1))) {
        corrections.push({
          original: segment,
          corrected: this.breakRunOn(segment),
          type: 'runon',
          position: input.indexOf(segment),
          confidence: 80,
        });
      }
    });

    // Detect missing punctuation between clauses
    const clausePattern = /([a-z]+)\s+(and|but|so|because|although|while|when|if)\s+([a-z]+)/gi;
    let match;
    while ((match = clausePattern.exec(input)) !== null) {
      // Check if there's already punctuation
      if (!input.slice(Math.max(0, match.index - 5), match.index).match(/[.!,;]/)) {
        // This is a soft correction - we note it but may not apply
        corrections.push({
          original: match[0],
          corrected: `${match[1]}, ${match[2]} ${match[3]}`,
          type: 'punctuation',
          position: match.index,
          confidence: 70,
        });
      }
    }

    // Detect ambiguous references
    const ambiguous = input.match(/\b(it|this|that|they|them|these|those)\b/gi);
    if (ambiguous && ambiguous.length > 2) {
      corrections.push({
        original: ambiguous.join(', '),
        corrected: 'Replace pronouns with specific references',
        type: 'ambiguous',
        position: -1,
        confidence: 60,
      });
    }

    return corrections;
  }

  /**
   * Break a run-on sentence into multiple sentences
   */
  private breakRunOn(segment: string): string {
    // Insert periods at natural break points
    const breakPoints = [' and then ', ' and also ', ' plus ', ' also ', ' then ', ' next ', ' after that '];
    let result = segment;
    
    breakPoints.forEach(bp => {
      result = result.replace(new RegExp(bp, 'gi'), '. ');
    });

    // Capitalize after periods
    result = result.replace(/\. ([a-z])/g, (_, letter) => `. ${letter.toUpperCase()}`);
    
    return result;
  }

  /**
   * Apply corrections to input
   */
  private applyCorrections(input: string, corrections: Correction[]): string {
    let result = input;

    // Apply typo corrections (word-level replacement)
    const words = result.split(/\b/);
    const correctedWords = words.map(word => {
      const lower = word.toLowerCase();
      if (this.customDictionary.has(lower)) {
        return this.customDictionary.get(lower)!;
      }
      return word;
    });
    result = correctedWords.join('');

    // Apply run-on corrections
    corrections
      .filter(c => c.type === 'runon')
      .forEach(c => {
        result = result.replace(c.original, c.corrected);
      });

    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    // Fix capitalization
    result = result.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());

    return result;
  }

  /**
   * Split into clean sentences
   */
  private splitSentences(cleaned: string): string[] {
    return cleaned
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Extract structured information from sentences
   */
  private extractStructure(sentences: string[], fullText: string): StructuredPrompt {
    const lower = fullText.toLowerCase();
    
    // Detect domain
    const domain = this.detectDomain(lower);
    
    // Detect intent
    const intent = this.detectIntent(sentences, lower);
    
    // Extract entities
    const entities = this.extractEntities(fullText, domain);
    
    // Extract constraints
    const constraints = this.extractConstraints(sentences);
    
    // Extract questions
    const questions = sentences.filter(s => /\?/.test(s) || /^(what|how|why|when|where|which|can|could|should|would|is|are|do|does)\b/i.test(s));
    
    // Detect action
    const action = this.detectAction(lower);
    
    // Extract context
    const context = this.extractContext(sentences);
    
    // Detect priority
    const priority = this.detectPriority(lower);

    return {
      intent,
      domain,
      entities,
      constraints,
      questions,
      action,
      context,
      priority,
    };
  }

  /**
   * Detect domain from text
   */
  private detectDomain(text: string): string {
    let bestDomain = 'general';
    let bestScore = 0;

    Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
      const score = keywords.filter(k => text.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    });

    return bestDomain;
  }

  /**
   * Detect primary intent
   */
  private detectIntent(sentences: string[], text: string): string {
    // Look for action verbs
    const actionVerbs = ['create', 'build', 'make', 'generate', 'analyze', 'plan', 'optimize', 'fix', 'implement', 'design', 'write', 'develop', 'trade', 'buy', 'sell', 'schedule', 'organize'];
    
    for (const verb of actionVerbs) {
      if (text.includes(verb)) {
        return `${verb} ${this.extractObject(text, verb)}`;
      }
    }

    // Look for question patterns
    if (/\?/.test(text) || /^(what|how|why|when|where)\b/i.test(text)) {
      return 'answer question';
    }

    // Default
    return 'process request';
  }

  /**
   * Extract object of an action verb
   */
  private extractObject(text: string, verb: string): string {
    const idx = text.indexOf(verb);
    if (idx === -1) return '';
    
    const afterVerb = text.slice(idx + verb.length).trim();
    const words = afterVerb.split(/\s+/).slice(0, 5);
    return words.join(' ');
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string, domain: string): Entity[] {
    const entities: Entity[] = [];
    const lower = text.toLowerCase();

    // Asset detection (trading domain)
    const assetPatterns = [
      /\b(btc|bitcoin|eth|ethereum|sol|solana|spy|aapl|tsla|nvda|amd|msft)\b/gi,
      /\b([a-z]{2,5}\/usd)\b/gi,
    ];

    assetPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: 'asset',
          normalized: match[0].toUpperCase(),
        });
      }
    });

    // Action detection
    const actions = ['buy', 'sell', 'short', 'long', 'enter', 'exit', 'hold', 'create', 'build', 'fix', 'optimize', 'analyze', 'plan', 'schedule'];
    actions.forEach(action => {
      if (lower.includes(action)) {
        entities.push({
          text: action,
          type: 'action',
          normalized: action,
        });
      }
    });

    // Timeframe detection
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', 'daily', 'weekly', 'hourly', 'today', 'tomorrow', 'this week', 'next week'];
    timeframes.forEach(tf => {
      if (lower.includes(tf)) {
        entities.push({
          text: tf,
          type: 'timeframe',
          normalized: tf,
        });
      }
    });

    // Tool/technology detection
    const tools = ['rust', 'python', 'typescript', 'javascript', 'react', 'node', 'docker', 'kubernetes', 'aws', 'gcp', 'api', 'database', 'sql'];
    tools.forEach(tool => {
      if (lower.includes(tool)) {
        entities.push({
          text: tool,
          type: 'tool',
          normalized: tool,
        });
      }
    });

    return entities;
  }

  /**
   * Extract constraints from sentences
   */
  private extractConstraints(sentences: string[]): string[] {
    const constraints: string[] = [];
    const constraintPatterns = [
      /must\s+(.+)/i,
      /should\s+(.+)/i,
      /need\s+to\s+(.+)/i,
      /require(s|d)?\s+(.+)/i,
      /without\s+(.+)/i,
      /avoid\s+(.+)/i,
      /don'?t\s+(.+)/i,
      /ensure\s+(.+)/i,
    ];

    sentences.forEach(sentence => {
      constraintPatterns.forEach(pattern => {
        const match = sentence.match(pattern);
        if (match) {
          constraints.push(match[0]);
        }
      });
    });

    return constraints;
  }

  /**
   * Detect primary action
   */
  private detectAction(text: string): string {
    const actionPatterns = [
      { pattern: /\b(create|build|make|generate)\b/i, action: 'create' },
      { pattern: /\b(analyze|evaluate|assess)\b/i, action: 'analyze' },
      { pattern: /\b(plan|schedule|organize)\b/i, action: 'plan' },
      { pattern: /\b(optimize|improve|enhance)\b/i, action: 'optimize' },
      { pattern: /\b(fix|debug|repair|correct)\b/i, action: 'fix' },
      { pattern: /\b(trade|buy|sell|short|long)\b/i, action: 'trade' },
      { pattern: /\b(predict|forecast|estimate)\b/i, action: 'predict' },
    ];

    for (const { pattern, action } of actionPatterns) {
      if (pattern.test(text)) {
        return action;
      }
    }

    return 'process';
  }

  /**
   * Extract context from sentences
   */
  private extractContext(sentences: string[]): string {
    // Context is usually the background/setup information
    const contextIndicators = ['for', 'in', 'with', 'using', 'based on', 'because', 'since', 'given'];
    
    const contextSentences = sentences.filter(s => 
      contextIndicators.some(ind => s.toLowerCase().includes(ind))
    );

    return contextSentences.join(' ').slice(0, 200);
  }

  /**
   * Detect priority level
   */
  private detectPriority(text: string): 'critical' | 'high' | 'medium' | 'low' {
    if (/\b(urgent|asap|immediately|critical|emergency)\b/i.test(text)) return 'critical';
    if (/\b(important|soon|quickly|fast)\b/i.test(text)) return 'high';
    if (/\b(when you can|no rush|eventually)\b/i.test(text)) return 'low';
    return 'medium';
  }

  /**
   * Build interpretation of what the user meant
   */
  private buildInterpretation(structured: StructuredPrompt, corrections: Correction[]): Interpretation {
    const summary = this.generateSummary(structured);
    const keyPoints = this.extractKeyPoints(structured);
    const assumptions = this.identifyAssumptions(structured);
    const ambiguities = this.identifyAmbiguities(structured, corrections);
    const suggestedClarifications = this.generateClarificationQuestions(structured, ambiguities);

    return {
      summary,
      keyPoints,
      assumptions,
      ambiguities,
      suggestedClarifications,
    };
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(structured: StructuredPrompt): string {
    const parts: string[] = [];
    
    parts.push(`The user wants to ${structured.action}`);
    
    if (structured.entities.length > 0) {
      const assetEntities = structured.entities.filter(e => e.type === 'asset');
      const toolEntities = structured.entities.filter(e => e.type === 'tool');
      
      if (assetEntities.length > 0) {
        parts.push(`involving ${assetEntities.map(e => e.normalized).join(', ')}`);
      }
      if (toolEntities.length > 0) {
        parts.push(`using ${toolEntities.map(e => e.normalized).join(', ')}`);
      }
    }

    if (structured.domain !== 'general') {
      parts.push(`in the ${structured.domain} domain`);
    }

    if (structured.constraints.length > 0) {
      parts.push(`with ${structured.constraints.length} constraint(s)`);
    }

    return parts.join(' ') + '.';
  }

  /**
   * Extract key points
   */
  private extractKeyPoints(structured: StructuredPrompt): string[] {
    const points: string[] = [];
    
    points.push(`Intent: ${structured.intent}`);
    points.push(`Domain: ${structured.domain}`);
    points.push(`Action: ${structured.action}`);
    points.push(`Priority: ${structured.priority}`);
    
    if (structured.entities.length > 0) {
      points.push(`Entities: ${structured.entities.map(e => `${e.normalized} (${e.type})`).join(', ')}`);
    }

    return points;
  }

  /**
   * Identify assumptions made
   */
  private identifyAssumptions(structured: StructuredPrompt): string[] {
    const assumptions: string[] = [];

    if (structured.domain === 'trading' && !structured.entities.some(e => e.type === 'asset')) {
      assumptions.push('No specific asset mentioned - may need clarification');
    }

    if (structured.action === 'trade' && !structured.entities.some(e => e.type === 'timeframe')) {
      assumptions.push('No timeframe specified - assuming user wants general strategy');
    }

    if (structured.constraints.length === 0) {
      assumptions.push('No explicit constraints - will apply best practices');
    }

    return assumptions;
  }

  /**
   * Identify ambiguities
   */
  private identifyAmbiguities(structured: StructuredPrompt, corrections: Correction[]): string[] {
    const ambiguities: string[] = [];

    // Check for ambiguous pronouns
    const ambiguousCorrections = corrections.filter(c => c.type === 'ambiguous');
    if (ambiguousCorrections.length > 0) {
      ambiguities.push('Multiple pronouns used - unclear what they refer to');
    }

    // Check for vague intent
    if (structured.intent === 'process request') {
      ambiguities.push('Intent is unclear - what specifically should be done?');
    }

    // Check for missing specifics
    if (structured.domain === 'trading' && structured.entities.filter(e => e.type === 'asset').length === 0) {
      ambiguities.push('Which asset(s) to trade?');
    }

    return ambiguities;
  }

  /**
   * Generate clarification questions
   */
  private generateClarificationQuestions(structured: StructuredPrompt, ambiguities: string[]): string[] {
    const questions: string[] = [];

    ambiguities.forEach(ambiguity => {
      if (ambiguity.includes('asset')) {
        questions.push('Which specific asset(s) are you interested in? (e.g., BTC/USD, ETH/USD, SPY)');
      }
      if (ambiguity.includes('timeframe')) {
        questions.push('What timeframe are you looking at? (e.g., 1h, 4h, 1d)');
      }
      if (ambiguity.includes('Intent')) {
        questions.push('Could you clarify what you want to accomplish?');
      }
      if (ambiguity.includes('pronouns')) {
        questions.push('Could you replace pronouns with specific references?');
      }
    });

    return questions;
  }

  /**
   * Calculate confidence in interpretation
   */
  private calculateConfidence(corrections: Correction[], qualityScore: number): number {
    let confidence = qualityScore;

    // Reduce confidence for each correction
    const typoCount = corrections.filter(c => c.type === 'typo').length;
    confidence -= typoCount * 2;

    const ambiguityCount = corrections.filter(c => c.type === 'ambiguous').length;
    confidence -= ambiguityCount * 10;

    const runonCount = corrections.filter(c => c.type === 'runon').length;
    confidence -= runonCount * 5;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Add custom word to dictionary
   */
  addWord(misspelling: string, correction: string): void {
    this.customDictionary.set(misspelling.toLowerCase(), correction.toLowerCase());
  }

  /**
   * Batch clarify multiple prompts
   */
  clarifyBatch(inputs: string[]): ClarifiedPrompt[] {
    return inputs.map(input => this.clarify(input));
  }

  /**
   * Get statistics about clarification
   */
  getStats(result: ClarifiedPrompt) {
    return {
      originalLength: result.original.length,
      cleanedLength: result.cleaned.length,
      correctionCount: result.corrections.length,
      typoCount: result.corrections.filter(c => c.type === 'typo').length,
      runonCount: result.corrections.filter(c => c.type === 'runon').length,
      ambiguityCount: result.corrections.filter(c => c.type === 'ambiguous').length,
      qualityImprovement: result.qualityScore,
      confidence: result.confidence,
      entityCount: result.structured.entities.length,
      domain: result.structured.domain,
    };
  }
}

// Export singleton
export const promptClarifier = new PromptClarifier();
