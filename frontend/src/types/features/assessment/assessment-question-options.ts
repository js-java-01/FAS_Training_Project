export interface AssessmentQuestionOption {
    id: string;
    content: string;
    correct: boolean;
    orderIndex: number;
    assessmentQuestionId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AssessmentQuestionOptionRequest {
    content: string;
    correct: boolean;
    orderIndex: number;
    assessmentQuestionId?: string;
}

export interface AssessmentQuestionOptionFilter {
    content?: string;
    correct?: boolean;
    assessmentQuestionId?: string;
}