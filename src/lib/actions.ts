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

export async function getEducationalAssistantResponse(
  input: ConnectWithSubjectSpecializedTutorInput
) {
  try {
    const response = await connectWithSubjectSpecializedTutor(input);
    return { success: true, data: response };
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.message || "Failed to get response from educational assistant.";
    return { success: false, error: errorMessage };
  }
}

export async function getCoachingIntervention(
  input: DataDrivenExecutiveFunctionCoachingInput
) {
  try {
    const response = await dataDrivenExecutiveFunctionCoaching(input);
    return { success: true, data: response };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get coaching intervention." };
  }
}

export async function getLearningPath(
  input: GeneratePersonalizedLearningPathInput
) {
  try {
    const response = await generatePersonalizedLearningPath(input);
    return { success: true, data: response };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate learning path." };
  }
}

export async function getHomeworkFeedbackAction(input: HomeworkFeedbackInput) {
    try {
        const response = await getHomeworkFeedback(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
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
        const response = await tellJoke(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get a joke." };
    }
}

export async function createHomeworkPlanAction(input: HomeworkPlannerInput) {
    try {
        const response = await createHomeworkPlan(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create homework plan." };
    }
}

export async function generateTestPrepAction(input: TestPrepInput) {
    try {
        const response = await generateTestPrep(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
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
