/**
 * Input Validation & Security
 * 
 * Simple validation for AI inputs. Prevents:
 * - Prompt injection attacks
 * - Malformed inputs
 * - Excessive input lengths
 * 
 * Usage:
 *   const cleaned = sanitize(userInput);
 *   if (detectPromptInjection(cleaned)) throw new Error('Invalid input');
 */

// =============================================================================
// SANITIZATION
// =============================================================================

/**
 * Clean user input by removing control characters and limiting length.
 */
export function sanitize(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')  // Remove control chars
    .replace(/[\u200B-\u200D\uFEFF]/g, '')              // Remove zero-width chars
    .replace(/\n{3,}/g, '\n\n')                         // Limit consecutive newlines
    .trim()
    .slice(0, maxLength);
}

// =============================================================================
// PROMPT INJECTION DETECTION
// =============================================================================

/**
 * Detect common prompt injection patterns.
 * These are attempts to override the AI's instructions.
 * 
 * @returns true if suspicious patterns found
 */
export function detectPromptInjection(input: string): boolean {
  const patterns = [
    // Instruction overrides
    /ignore\s+(previous|all|above)\s+instructions?/i,
    /disregard\s+(previous|all)/i,
    /forget\s+(everything|all)/i,
    
    // Role manipulation
    /you\s+are\s+now\s+(a|an)/i,
    /system\s*:\s*you\s+are/i,
    /pretend\s+to\s+be/i,
    
    // System prompt extraction
    /show\s+(me\s+)?your\s+(system\s+)?prompt/i,
    /repeat\s+(your|the)\s+instructions/i,
    
    // Special tokens (used in some LLM formats)
    /<\|.*?\|>/,
    /\[INST\]/i,
    /<<SYS>>/i,
  ];

  return patterns.some(p => p.test(input));
}

// =============================================================================
// VALIDATION ERROR
// =============================================================================

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
