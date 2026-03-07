import type { QuestionOption, QuestionOptionRequest } from "./question-option";

export interface SimplifiedCategory {
  id: string;
  name: string;
}

export interface Question {
  id?: string;
  content: string;
  questionType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  options: QuestionOption[];
  tagIds: number[];
}

export interface QuestionListItem {
  id: string;
  content: string;
  questionType: string;
  isActive: boolean;
  categoryId: string;
  tagIds: number[];
  options: Omit<QuestionOption, 'id'>[];
}

export interface QuestionCreateRequest {
  content: string;
  questionType: string;
  isActive: boolean;
  categoryId: string;
  options: QuestionOptionRequest[];
  tagIds?: number[];
}

export interface QuestionFilter {
  categoryId?: string;
  tagIds?: number[];
  questionType?: string;
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
}
