export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Question {
  id: string;
  content: string;
  questionType: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  category: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };

  options: QuestionOption[];
}

export interface QuestionCreateRequest {
  content: string;
  questionType: string;
  isActive: boolean;

  categoryId: string;

  options: QuestionOptionRequest[];
}

export interface QuestionOptionRequest {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}
