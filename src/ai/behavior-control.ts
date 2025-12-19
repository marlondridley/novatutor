/**
 * 🎯 Prompt-Free Behavior Control Matrix
 * 
 * Prompts define thinking.
 * Flags define behavior.
 * UI defines experience.
 * 
 * System prompts are FROZEN. All variability happens through structured runtime controls.
 */

// =============================================================================
// TYPES - The ONLY allowed inputs that affect AI behavior
// =============================================================================

export type SubjectContext = 'math' | 'science' | 'reading' | 'history' | 'planner' | 'general';
export type GradeLevel = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type Modality = 'chat' | 'voice';
export type EFMode = 'off' | 'light' | 'standard' | 'high';
export type Verbosity = 'short' | 'normal';
export type HelpPhase = 'orient' | 'guide' | 'reflect';
export type SafetyMode = 'strict' | 'standard';
export type ToneBias = 'encouraging' | 'neutral';

export interface BehaviorFlags {
  subject: SubjectContext;
  gradeLevel: GradeLevel;
  modality: Modality;
  efMode: EFMode;
  verbosity: Verbosity;
  helpPhase: HelpPhase;
  safetyMode: SafetyMode;
  toneBias: ToneBias;
}

// Default configuration (safe defaults for all kids)
export const DEFAULT_BEHAVIOR: BehaviorFlags = {
  subject: 'general',
  gradeLevel: 6,
  modality: 'chat',
  efMode: 'standard',
  verbosity: 'normal',
  helpPhase: 'orient',
  safetyMode: 'strict',
  toneBias: 'encouraging',
};

// =============================================================================
// SUBJECT CONTEXT - Changes examples, NOT personality
// =============================================================================

export const SUBJECT_CONFIG = {
  math: {
    icon: 'Calculator',
    color: 'blue',
    exampleTypes: ['numbers', 'equations', 'word problems'],
    metaphors: ['building blocks', 'puzzles', 'patterns'],
  },
  science: {
    icon: 'TestTube',
    color: 'green',
    exampleTypes: ['experiments', 'observations', 'hypotheses'],
    metaphors: ['discovery', 'investigation', 'exploration'],
  },
  reading: {
    icon: 'BookOpen',
    color: 'purple',
    exampleTypes: ['stories', 'characters', 'themes'],
    metaphors: ['journey', 'adventure', 'connection'],
  },
  history: {
    icon: 'ScrollText',
    color: 'amber',
    exampleTypes: ['events', 'people', 'causes'],
    metaphors: ['timeline', 'story', 'connections'],
  },
  planner: {
    icon: 'ClipboardList',
    color: 'pink',
    exampleTypes: ['tasks', 'time', 'priorities'],
    metaphors: ['quest', 'mission', 'adventure'],
  },
  general: {
    icon: 'Sparkles',
    color: 'gray',
    exampleTypes: ['any topic'],
    metaphors: ['learning', 'growing', 'discovering'],
  },
} as const;

// =============================================================================
// BEHAVIORAL MODIFIERS - Applied as metadata, NOT prompt changes
// =============================================================================

/**
 * Get response length target based on verbosity flag
 */
export function getMaxSentences(verbosity: Verbosity): number {
  return verbosity === 'short' ? 2 : 5;
}

/**
 * Get response pacing based on modality
 */
export function getResponsePacing(modality: Modality): 'fast' | 'conversational' {
  return modality === 'voice' ? 'fast' : 'conversational';
}

/**
 * Get EF coaching intensity
 */
export function getEFIntensity(efMode: EFMode): number {
  const intensity = { off: 0, light: 0.25, standard: 0.5, high: 0.75 };
  return intensity[efMode];
}

// =============================================================================
// POST-PROCESSING FILTERS - NOT PROMPTS!
// =============================================================================

/**
 * Sanitize response based on behavior flags
 * This happens AFTER the AI responds, not before
 */
export function sanitizeResponse(response: string, flags: BehaviorFlags): string {
  let output = response;

  // 1. Length limiter (cognitive load control)
  const maxSentences = getMaxSentences(flags.verbosity);
  const sentences = output.match(/[^.!?]+[.!?]+/g) || [output];
  if (sentences.length > maxSentences) {
    output = sentences.slice(0, maxSentences).join(' ');
  }

  // 2. Safety filter (COPPA compliance)
  if (flags.safetyMode === 'strict') {
    // Remove any unsafe content markers
    output = output.replace(/\[UNSAFE\]/gi, '');
    
    // Remove URLs (prevent external links)
    output = output.replace(/https?:\/\/[^\s]+/gi, '[link removed]');
  }

  // 3. Tone enforcement (never explain EF, just express it)
  if (flags.efMode !== 'off' && output.includes('executive function')) {
    // Remove meta-commentary about EF
    output = output.replace(/executive function/gi, 'planning');
  }

  return output.trim();
}

/**
 * Check if response contains direct answer (anti-pattern for Socratic method)
 */
export function containsDirectAnswer(response: string): boolean {
  const directAnswerPatterns = [
    /the answer is/i,
    /^the solution is/i,
    /here's the answer/i,
    /it equals/i,
    /the correct answer/i,
  ];
  
  return directAnswerPatterns.some(pattern => pattern.test(response));
}

/**
 * Enforce Socratic method - downgrade to guide phase if answer detected
 */
export function enforceSocraticMethod(response: string, flags: BehaviorFlags): { 
  response: string; 
  newPhase?: HelpPhase 
} {
  if (containsDirectAnswer(response) && flags.helpPhase !== 'reflect') {
    // Redirect to questioning
    return {
      response: "Let's think through this together. What's the first step you might try?",
      newPhase: 'guide',
    };
  }
  
  return { response };
}

// =============================================================================
// CONTEXT BUILDER - Creates metadata for AI, NOT system prompt
// =============================================================================

/**
 * Build context metadata from behavior flags
 * This gets passed to the AI as structured data, not free text
 */
export function buildContext(flags: BehaviorFlags, userInput: string) {
  const subject = SUBJECT_CONFIG[flags.subject];
  
  return {
    // Core identity (never changes)
    role: 'tutor',
    method: 'socratic',
    
    // Contextual modifiers (changes based on flags)
    subject: flags.subject,
    subjectColor: subject.color,
    gradeLevel: flags.gradeLevel,
    
    // Behavioral controls
    modality: flags.modality,
    maxSentences: getMaxSentences(flags.verbosity),
    pacing: getResponsePacing(flags.modality),
    efIntensity: getEFIntensity(flags.efMode),
    helpPhase: flags.helpPhase,
    tone: flags.toneBias,
    safety: flags.safetyMode,
    
    // User input
    input: userInput,
  };
}

// =============================================================================
// GUARDRAILS - Automatic enforcement
// =============================================================================

/**
 * Apply all guardrails to AI response
 */
export function applyGuardrails(
  response: string, 
  flags: BehaviorFlags
): { response: string; warnings: string[] } {
  const warnings: string[] = [];
  let output = response;

  // 1. Sanitize first
  output = sanitizeResponse(output, flags);

  // 2. Enforce Socratic method
  const socraticResult = enforceSocraticMethod(output, flags);
  output = socraticResult.response;
  if (socraticResult.newPhase) {
    warnings.push(`Downgraded to ${socraticResult.newPhase} phase`);
  }

  // 3. Check for hallucinations (refuse unknowns)
  if (output.toLowerCase().includes('i think') || output.toLowerCase().includes('probably')) {
    warnings.push('Uncertain response detected');
  }

  return { response: output, warnings };
}

// =============================================================================
// PARENT CONTROLS - UI → Flags mapping
// =============================================================================

/**
 * Parent-friendly descriptions for each flag
 */
export const PARENT_CONTROLS = {
  gradeLevel: {
    label: 'Grade Level',
    description: 'Adjusts vocabulary and complexity',
    options: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  efMode: {
    label: 'Planning Support',
    description: 'How much help with task breakdown',
    options: {
      off: 'None - Just homework help',
      light: 'Occasional reminders',
      standard: 'Regular planning prompts',
      high: 'Active coaching',
    },
  },
  modality: {
    label: 'Primary Mode',
    description: 'How your child interacts',
    options: {
      chat: 'Typing (more detail)',
      voice: 'Speaking (shorter responses)',
    },
  },
  safetyMode: {
    label: 'Content Safety',
    description: 'Content filtering level',
    options: {
      strict: 'Maximum safety (recommended)',
      standard: 'Standard safety',
    },
  },
  toneBias: {
    label: 'Emotional Tone',
    description: 'How encouraging the tutor is',
    options: {
      encouraging: 'Very supportive (recommended)',
      neutral: 'Calm and factual',
    },
  },
} as const;

// =============================================================================
// USAGE EXAMPLE
// =============================================================================

/**
 * Example: How to use the behavior control system
 * 
 * const flags: BehaviorFlags = {
 *   subject: 'math',
 *   gradeLevel: 5,
 *   modality: 'voice',
 *   efMode: 'standard',
 *   verbosity: 'short',
 *   helpPhase: 'guide',
 *   safetyMode: 'strict',
 *   toneBias: 'encouraging',
 * };
 * 
 * const context = buildContext(flags, "How do I solve 3x + 5 = 20?");
 * // Send context to AI API...
 * const aiResponse = await getAIResponse(context);
 * 
 * const { response, warnings } = applyGuardrails(aiResponse, flags);
 * // Display response to user
 */

