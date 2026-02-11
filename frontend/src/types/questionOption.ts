export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  questionId: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionOptionRequest {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  questionId: string;
}
