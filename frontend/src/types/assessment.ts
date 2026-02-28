// ===== Enum =====
export type AssessmentStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

// ===== Core Entity =====
export interface Assessment {
  id: number;
  code: string;
  title: string;
  description: string;
  assessmentTypeId: string;
  assessmentTypeName?: string;

  totalScore: number;
  passScore: number;
  timeLimitMinutes: number;
  attemptLimit: number;

  isShuffleQuestion: boolean;
  isShuffleOption: boolean;

  status: AssessmentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface AssessmentCreateRequest {
  code: string;
  title: string;
  description: string;
  assessmentTypeId: string;

  totalScore: number;
  passScore: number;
  timeLimitMinutes: number;
  attemptLimit: number;

  isShuffleQuestion: boolean;
  isShuffleOption: boolean;

  status: AssessmentStatus;
}

export interface AssessmentUpdateRequest {
  title: string;
  description: string;
  assessmentTypeId: string;

  totalScore: number;
  passScore: number;
  timeLimitMinutes: number;
  attemptLimit: number;

  isShuffleQuestion: boolean;
  isShuffleOption: boolean;

  status: AssessmentStatus;
}

export interface AssessmentSearchParams {
  page?: number;
  size?: number;

  keyword?: string;
  status?: AssessmentStatus;
  assessmentTypeId?: string;

  createdFrom?: string; // ISO date
  createdTo?: string;   // ISO date
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
