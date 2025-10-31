/**
 * Input validation and sanitization for AI flows
 */

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize string input - comprehensive sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string', 'input');
  }

  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit excessive newlines (max 2 consecutive)
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Remove zero-width characters and other invisible Unicode
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Hard limit on length (safety check)
  if (sanitized.length > 50000) {
    sanitized = sanitized.slice(0, 50000);
  }

  return sanitized;
}

/**
 * Sanitize user input for AI prompts - stricter version
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string', 'input');
  }

  let sanitized = input;

  // Remove null bytes and control characters (except newlines, tabs, carriage returns)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit excessive newlines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/[ \t]{5,}/g, '    '); // Max 4 spaces

  // Remove zero-width and invisible characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF\u2060\u180E]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Hard limit for user input
  if (sanitized.length > 10000) {
    sanitized = sanitized.slice(0, 10000);
  }

  return sanitized;
}

/**
 * Validate and sanitize subject/topic input
 */
export function validateSubject(subject: string | undefined | null): string {
  if (!subject || typeof subject !== 'string') {
    throw new ValidationError('Subject is required', 'subject');
  }

  const sanitized = sanitizeInput(subject);

  if (sanitized.length === 0) {
    throw new ValidationError('Subject cannot be empty', 'subject');
  }

  if (sanitized.length > 100) {
    throw new ValidationError('Subject must be 100 characters or less', 'subject');
  }

  return sanitized;
}

/**
 * Validate and sanitize text content (e.g., questions, goals, homework)
 */
export function validateTextContent(
  content: string | undefined | null,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 10000
): string {
  if (!content || typeof content !== 'string') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }

  const sanitized = sanitizeInput(content);

  if (sanitized.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName
    );
  }

  if (sanitized.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be ${maxLength} characters or less`,
      fieldName
    );
  }

  return sanitized;
}

/**
 * Validate grade level
 */
export function validateGradeLevel(grade: string | undefined | null): string {
  if (!grade || typeof grade !== 'string') {
    throw new ValidationError('Grade level is required', 'grade');
  }

  const sanitized = sanitizeInput(grade);

  if (sanitized.length === 0 || sanitized.length > 50) {
    throw new ValidationError('Invalid grade level', 'grade');
  }

  return sanitized;
}

/**
 * Validate student ID
 */
export function validateStudentId(studentId: string | undefined | null): string {
  if (!studentId || typeof studentId !== 'string') {
    throw new ValidationError(
      'Student ID is required. Make sure user profile has a valid student_id.',
      'studentId'
    );
  }

  const sanitized = sanitizeInput(studentId);

  if (sanitized.length === 0 || sanitized.length > 100) {
    throw new ValidationError('Invalid student ID', 'studentId');
  }

  return sanitized;
}

/**
 * Validate learning style
 */
export function validateLearningStyle(style: string | undefined | null): string {
  if (!style || typeof style !== 'string') {
    throw new ValidationError('Learning style is required', 'learningStyle');
  }

  const validStyles = ['visual', 'auditory', 'kinesthetic', 'reading'];
  const sanitized = sanitizeInput(style.toLowerCase());

  if (!validStyles.includes(sanitized)) {
    throw new ValidationError(
      `Learning style must be one of: ${validStyles.join(', ')}`,
      'learningStyle'
    );
  }

  return sanitized;
}

/**
 * Validate mastery scores object
 */
export function validateMasteryScores(
  scores: Record<string, number> | undefined | null
): Record<string, number> {
  if (!scores || typeof scores !== 'object') {
    throw new ValidationError('Mastery scores are required', 'masteryScores');
  }

  const validated: Record<string, number> = {};

  for (const [key, value] of Object.entries(scores)) {
    const sanitizedKey = sanitizeInput(key);
    
    if (sanitizedKey.length === 0 || sanitizedKey.length > 100) {
      throw new ValidationError(`Invalid topic name: ${key}`, 'masteryScores');
    }

    if (typeof value !== 'number' || value < 0 || value > 1) {
      throw new ValidationError(
        `Score for "${key}" must be a number between 0 and 1`,
        'masteryScores'
      );
    }

    validated[sanitizedKey] = value;
  }

  if (Object.keys(validated).length === 0) {
    throw new ValidationError('At least one mastery score is required', 'masteryScores');
  }

  return validated;
}

/**
 * Validate array of conversation history
 */
export function validateConversationHistory(
  history: Array<{ role: string; content: string }> | undefined | null
): Array<{ role: string; content: string }> {
  if (!history) {
    return [];
  }

  if (!Array.isArray(history)) {
    throw new ValidationError('Conversation history must be an array', 'conversationHistory');
  }

  if (history.length > 50) {
    throw new ValidationError(
      'Conversation history too long (max 50 messages)',
      'conversationHistory'
    );
  }

  return history.map((msg, index) => {
    if (!msg.role || !msg.content) {
      throw new ValidationError(
        `Message at index ${index} must have role and content`,
        'conversationHistory'
      );
    }

    const validRoles = ['user', 'assistant', 'system'];
    if (!validRoles.includes(msg.role)) {
      throw new ValidationError(
        `Invalid role at index ${index}: ${msg.role}`,
        'conversationHistory'
      );
    }

    return {
      role: msg.role,
      content: sanitizeInput(msg.content).substring(0, 10000), // Limit message length
    };
  });
}

/**
 * Detect potential prompt injection attempts
 */
export function detectPromptInjection(input: string): boolean {
  const suspiciousPatterns = [
    // Direct instruction override attempts
    /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/i,
    /disregard\s+(previous|all|above|prior)/i,
    /forget\s+(previous|all|everything|above)/i,
    /override\s+(previous|all|system)/i,
    
    // Role manipulation
    /you\s+are\s+now\s+(a|an)/i,
    /act\s+as\s+(a|an)\s+(?!tutor|teacher|educator)/i, // Allow educational roles
    /new\s+(role|character|persona)\s*:/i,
    /system\s*:\s*you\s+are/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    
    // Instruction injection
    /new\s+instructions?\s*:/i,
    /updated\s+instructions?\s*:/i,
    /admin\s+(mode|command|access)/i,
    /developer\s+(mode|command)/i,
    
    // Special tokens and delimiters
    /<\|.*?\|>/g,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<<SYS>>/i,
    /<<\/SYS>>/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    
    // System prompt leakage attempts
    /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?)/i,
    /what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions?)/i,
    /repeat\s+(your|the)\s+(system\s+)?prompt/i,
    
    // Jailbreak attempts
    /DAN\s+(mode|prompt)/i,
    /jailbreak/i,
    /do\s+anything\s+now/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive prompt injection check with logging
 */
export function checkPromptSafety(input: string, fieldName: string): {
  safe: boolean;
  reason?: string;
} {
  // Check for injection patterns
  if (detectPromptInjection(input)) {
    return {
      safe: false,
      reason: 'Potential prompt injection detected',
    };
  }

  // Check for excessive repetition (could indicate attack)
  const words = input.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 50 && uniqueWords.size / words.length < 0.3) {
    return {
      safe: false,
      reason: 'Excessive repetition detected',
    };
  }

  // Check for encoded content attempts
  if (
    /base64|atob|btoa|fromCharCode/i.test(input) &&
    /decode|eval|execute/i.test(input)
  ) {
    return {
      safe: false,
      reason: 'Suspicious encoded content detected',
    };
  }

  return { safe: true };
}

/**
 * Validate input doesn't contain prompt injection
 */
export function validateNoInjection(input: string, fieldName: string): void {
  const safetyCheck = checkPromptSafety(input, fieldName);
  
  if (!safetyCheck.safe) {
    // Log the attempt for security monitoring
    console.warn(`Security: Prompt injection attempt blocked in ${fieldName}`, {
      reason: safetyCheck.reason,
      inputLength: input.length,
      timestamp: new Date().toISOString(),
    });
    
    throw new ValidationError(
      `Invalid content detected in ${fieldName}. ${safetyCheck.reason}`,
      fieldName
    );
  }
}

