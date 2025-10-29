"use server";

import {
  connectWithSubjectSpecializedTutor,
  type ConnectWithSubjectSpecializedTutorInput,
} from "@/ai/flows/subject-specialized-tutor";
import {
  dataDrivenExecutiveFunctionCoaching,
  type DataDrivenExecutiveFunctionCoachingInput,
} from "@/ai/flows/data-driven-executive-function-coaching";
import {
  generatePersonalizedLearningPath,
  type GeneratePersonalizedLearningPathInput,
} from "@/ai/flows/generate-personalized-learning-path";
import {
    getHomeworkFeedback,
    type HomeworkFeedbackInput,
} from "@/ai/flows/homework-feedback-flow";
import {
    generateIllustration,
    type GenerateIllustrationInput,
} from "@/ai/flows/generate-illustration-flow";
import {
    textToSpeech,
    type TextToSpeechInput,
} from "@/ai/flows/text-to-speech-flow";
import {
    tellJoke,
    type JokeTellerInput,
} from "@/ai/flows/joke-teller-flow";
import {
    createHomeworkPlan,
    type HomeworkPlannerInput,
} from "@/ai/flows/homework-planner-flow";
import {
    generateTestPrep,
    type TestPrepInput,
} from "@/ai/flows/test-prep-flow";
import {
    speechToText,
    type SpeechToTextInput,
} from "@/ai/flows/speech-to-text-flow";
import {
    validateSubject,
    validateTextContent,
    validateStudentId,
    validateGradeLevel,
    validateMasteryScores,
    validateLearningStyle,
    validateConversationHistory,
    validateNoInjection,
    ValidationError,
} from "@/ai/validation";
import { AIError, getGracefulFallback } from "@/ai/error-handling";
import {
    checkRateLimit,
    formatRateLimitError,
    getCached,
    cacheKey,
    hashString,
    trackAICost,
    saveConversationContext,
    getConversationContext,
} from "@/lib/redis";

export async function getEducationalAssistantResponse(
  input: ConnectWithSubjectSpecializedTutorInput & { userId?: string }
) {
  try {
    const userId = input.userId || 'anonymous';
    
    // ✅ RATE LIMITING: 30 questions per hour
    const rateLimit = await checkRateLimit('tutor', userId);
    if (!rateLimit.success) {
      return { 
        success: false, 
        error: formatRateLimitError(rateLimit),
        remaining: rateLimit.remaining 
      };
    }

    // Validate inputs
    const validatedSubject = validateSubject(input.subject);
    const validatedQuestion = validateTextContent(input.question, 'question', 1, 5000);
    validateNoInjection(validatedQuestion, 'question');
    const validatedHistory = validateConversationHistory(input.conversationHistory);

    // Call AI flow with validated inputs
    const response = await connectWithSubjectSpecializedTutor({
      ...input,
      subject: validatedSubject,
      question: validatedQuestion,
      conversationHistory: validatedHistory,
    });
    
    // ✅ SAVE CONVERSATION CONTEXT for follow-ups
    await saveConversationContext(userId, validatedSubject, {
      lastQuestion: validatedQuestion,
      lastAnswer: response,
      timestamp: Date.now(),
    });
    
    // ✅ TRACK COST (~$0.001 per question)
    await trackAICost(userId, 'tutor', 0.001);
    
    return { 
      success: true, 
      data: response, 
      remaining: rateLimit.remaining 
    };
  } catch (error: any) {
    console.error('Educational Assistant Error:', error);
    
    // Handle different error types
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    
    if (error instanceof AIError) {
      // For rate limits or server errors, provide graceful fallback
      if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'SERVER_ERROR') {
        return { 
          success: false, 
          error: error.message,
          fallback: getGracefulFallback('tutor')
        };
      }
      return { success: false, error: error.message };
    }
    
    const errorMessage = error?.message || "Failed to get response from educational assistant.";
    return { success: false, error: errorMessage };
  }
}

export async function getCoachingIntervention(
  input: DataDrivenExecutiveFunctionCoachingInput
) {
  try {
    // Validate inputs
    const validatedStudentId = validateStudentId(input.studentId);
    
    // Validate behavioral data array
    if (!Array.isArray(input.behavioralData) || input.behavioralData.length === 0) {
      throw new ValidationError('Behavioral data is required', 'behavioralData');
    }
    
    if (input.behavioralData.length > 100) {
      throw new ValidationError('Too many behavioral data points (max 100)', 'behavioralData');
    }

    const response = await dataDrivenExecutiveFunctionCoaching({
      ...input,
      studentId: validatedStudentId,
    });
    
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Coaching Intervention Error:', error);
    
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    
    if (error instanceof AIError) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'SERVER_ERROR') {
        return { 
          success: false, 
          error: error.message,
          fallback: getGracefulFallback('coaching')
        };
      }
      return { success: false, error: error.message };
    }
    
    const errorMessage = error?.message || "Failed to get coaching intervention.";
    return { success: false, error: errorMessage };
  }
}

export async function getLearningPath(
  input: GeneratePersonalizedLearningPathInput & { userId?: string }
) {
  try {
    const userId = input.userId || input.studentId;
    
    // ✅ RATE LIMITING: 10 paths per day
    const rateLimit = await checkRateLimit('learningPath', userId);
    if (!rateLimit.success) {
      return { 
        success: false, 
        error: formatRateLimitError(rateLimit),
        remaining: rateLimit.remaining 
      };
    }

    // Validate inputs
    const validatedStudentId = validateStudentId(input.studentId);
    const validatedSubject = validateSubject(input.subject);
    const validatedMasteryScores = validateMasteryScores(input.masteryScores);
    const validatedLearningStyle = validateLearningStyle(input.learningStyle);
    
    // Validate intervention effectiveness (similar to mastery scores)
    if (input.interventionEffectiveness) {
      for (const [key, value] of Object.entries(input.interventionEffectiveness)) {
        if (typeof value !== 'number' || value < 0 || value > 1) {
          throw new ValidationError(
            `Intervention effectiveness for "${key}" must be between 0 and 1`,
            'interventionEffectiveness'
          );
        }
      }
    }

    // ✅ CACHING: Cache learning paths for 24 hours
    const cKey = cacheKey(
      'learning-path',
      validatedSubject,
      validatedLearningStyle,
      hashString(JSON.stringify(validatedMasteryScores))
    );

    const response = await getCached(
      cKey,
      async () => {
        const path = await generatePersonalizedLearningPath({
          ...input,
          studentId: validatedStudentId,
          subject: validatedSubject,
          masteryScores: validatedMasteryScores,
          learningStyle: validatedLearningStyle,
        });
        
        // ✅ TRACK COST (~$0.01 per path - expensive!)
        await trackAICost(userId, 'learning-path', 0.01);
        
        return path;
      },
      86400 // 24 hours
    );
    
    return { success: true, data: response, remaining: rateLimit.remaining };
  } catch (error: any) {
    console.error('Learning Path Error:', error);
    
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    
    if (error instanceof AIError) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'SERVER_ERROR') {
        return { 
          success: false, 
          error: error.message,
          fallback: getGracefulFallback('learningPath')
        };
      }
      return { success: false, error: error.message };
    }
    
    const errorMessage = error?.message || error?.toString() || "Failed to generate learning path.";
    return { success: false, error: errorMessage };
  }
}

export async function getHomeworkFeedbackAction(input: HomeworkFeedbackInput) {
    try {
        // Validate inputs
        const validatedSubject = validateSubject(input.subject);
        const validatedHomework = validateTextContent(input.homeworkText, 'homework', 10, 10000);
        validateNoInjection(validatedHomework, 'homework');
        
        const response = await getHomeworkFeedback({
            ...input,
            subject: validatedSubject,
            homeworkText: validatedHomework,
        });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('Homework Feedback Error:', error);
        
        if (error instanceof ValidationError) {
            return { success: false, error: error.message };
        }
        
        if (error instanceof AIError) {
            if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'SERVER_ERROR') {
                return { 
                    success: false, 
                    error: error.message,
                    fallback: getGracefulFallback('homework')
                };
            }
            return { success: false, error: error.message };
        }
        
        return { success: false, error: "Failed to get homework feedback." };
    }
}

export async function generateIllustrationAction(input: GenerateIllustrationInput) {
    try {
        const response = await generateIllustration(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to generate illustration." };
    }
}

export async function textToSpeechAction(input: TextToSpeechInput) {
    try {
        const response = await textToSpeech(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to convert text to speech." };
    }
}

export async function getJokeAction(input: JokeTellerInput) {
    try {
        // Validate inputs
        const validatedTopic = validateSubject(input.topic);
        
        const response = await tellJoke({
            ...input,
            topic: validatedTopic,
        });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('Joke Generation Error:', error);
        
        if (error instanceof ValidationError) {
            return { success: false, error: error.message };
        }
        
        if (error instanceof AIError) {
            if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'SERVER_ERROR') {
                return { 
                    success: false, 
                    error: error.message,
                    fallback: getGracefulFallback('joke')
                };
            }
            return { success: false, error: error.message };
        }
        
        return { success: false, error: "Failed to get a joke." };
    }
}

export async function createHomeworkPlanAction(input: HomeworkPlannerInput) {
    try {
        // Validate inputs
        const validatedStudentId = validateStudentId(input.studentId);
        
        // Validate assignments array
        if (!Array.isArray(input.assignments) || input.assignments.length === 0) {
            throw new ValidationError('At least one assignment is required', 'assignments');
        }
        
        if (input.assignments.length > 20) {
            throw new ValidationError('Too many assignments (max 20)', 'assignments');
        }
        
        const response = await createHomeworkPlan({
            ...input,
            studentId: validatedStudentId,
        });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('Homework Planner Error:', error);
        
        if (error instanceof ValidationError) {
            return { success: false, error: error.message };
        }
        
        if (error instanceof AIError) {
            return { success: false, error: error.message };
        }
        
        return { success: false, error: "Failed to create homework plan." };
    }
}

export async function generateTestPrepAction(input: TestPrepInput) {
    try {
        // Validate inputs
        const validatedSubject = validateSubject(input.subject);
        const validatedTopic = validateTextContent(input.topic, 'topic', 3, 200);
        
        const response = await generateTestPrep({
            ...input,
            subject: validatedSubject,
            topic: validatedTopic,
        });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('Test Prep Error:', error);
        
        if (error instanceof ValidationError) {
            return { success: false, error: error.message };
        }
        
        if (error instanceof AIError) {
            if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'SERVER_ERROR') {
                return { 
                    success: false, 
                    error: error.message,
                    fallback: getGracefulFallback('testPrep')
                };
            }
            return { success: false, error: error.message };
        }
        
        return { success: false, error: "Failed to generate test prep materials." };
    }
}

export async function speechToTextAction(input: SpeechToTextInput) {
    try {
        const response = await speechToText(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to transcribe audio." };
    }
}
