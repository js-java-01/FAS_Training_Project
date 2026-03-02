export interface QuestionTag {
    id: number;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuestionTagRequest {
    name: string;
    description: string;
}

export interface QuestionTagFilter {
    createdFrom?: string;
    createdTo?: string;
}