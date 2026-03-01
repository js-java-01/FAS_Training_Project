export interface QuestionOption {
  id: string;
  content: string;
  correct: boolean;
  orderIndex: number;
}

export interface QuestionTag {
  id: number;
  name: string;
}

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

export interface QuestionOptionRequest {
  id?: string;
  content: string;
  correct: boolean;
  orderIndex: number;
}

export interface Sort {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface Pageable {
  offset: number;
  sort: Sort[];
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface PagedQuestionResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: QuestionListItem[];
  number: number;
  sort: Sort[];
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}
