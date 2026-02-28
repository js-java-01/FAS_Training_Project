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