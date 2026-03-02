export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCategoryRequest {
  name: string;
  description: string;
}

export interface QuestionCategoryFilter {
  createdFrom?: string;
  createdTo?: string;
}

