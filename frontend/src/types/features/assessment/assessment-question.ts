import type { Assessment } from "./assessment";
import type { Question } from "./question";

export interface AssessmentQuestion {
    id: string;
    assessment: Assessment;
    question: Question;
    score: number;
    orderIndex: number;
}

export interface AssessmentQuestionCreateRequest {
    assessmentId: number;
    questionId: string;
    score: number;
    orderIndex: number;
}

export interface AssessmentQuestionUpdateRequest {
    score: number;
    orderIndex: number;
}
