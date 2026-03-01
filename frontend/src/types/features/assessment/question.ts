import type { QuestionOption, QuestionOptionRequest } from "./question-option";
import type { QuestionTag } from "./question-tag";

export interface SimplifiedCategory {
  id: string;
  name: string;
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
  tags?: QuestionTag[];
}

export interface QuestionListItem {
  id: string;
  content: string;
  questionType: string;
  isActive: boolean;
  category: SimplifiedCategory;
  options: Omit<QuestionOption, 'id'>[];
  tags: QuestionTag[];
}

export interface QuestionCreateRequest {
  content: string;
  questionType: string;
  isActive: boolean;
  categoryId: string;
  options: QuestionOptionRequest[];
  tagIds?: number[];
}
