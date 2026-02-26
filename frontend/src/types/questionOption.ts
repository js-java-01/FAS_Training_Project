export interface QuestionOption {
  id: string;
  content: string;
  correct: boolean;
  orderIndex: number;
  questionId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionOptionRequest {
  content: string;
  correct: boolean;
  orderIndex: number;
  questionId: string;
}
