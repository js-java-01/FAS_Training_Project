export interface AssessmentType {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface Assessment {
    id: number;
    assessmentType: AssessmentType;
    code: string;
    title: string;
    description: string;
    totalScore: number;
    passScore: number;
    timeLimitMinutes: number;
    attemptLimit: number;
    isShuffleQuestion: boolean;
    isShuffleOption: boolean;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
}

export interface QuestionOption {
    id: string;
    content: string;
    correct: boolean;
    orderIndex: number;
}

export interface QuestionCategory {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface Question {
    id: string;
    content: string;
    questionType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: QuestionCategory;
    options: QuestionOption[];
}

export interface AssessmentQuestion {
    id: string;
    assessment: Assessment;
    question: Question;
    score: number;
    orderIndex: number;
}

// Request types
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
