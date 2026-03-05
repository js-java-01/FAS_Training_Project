export interface AssessmentQuestion {
    id: string;
    assessmentId: string;
    questionId: string;
    score: number;
    orderIndex: number;
}

export interface AssessmentQuestionCreateRequest {
    assessmentId: string;
    questionId: string;
    score: number;
    orderIndex: number;
}

export interface AssessmentQuestionUpdateRequest {
    score: number;
    orderIndex: number;
}
