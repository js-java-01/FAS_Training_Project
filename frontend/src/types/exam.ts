// ===== User Assessment (Dashboard Card) =====
export interface UserAssessment {
  assessmentId: number;
  code: string;
  title: string;
  description: string;
  totalScore: number;
  passScore: number;
  timeLimitMinutes: number;
  attemptLimit: number;
  attemptCount: number;
  latestStatus: string; // "NEW" | "IN_PROGRESS" | "SUBMITTED"
  isPassed: boolean | null;
  lastSubmissionId: string | null;
}

// ===== Question Option =====
export interface QuestionOption {
  id: string;
  content: string;
  orderIndex: number;
  isCorrect: boolean | null; // only populated after submission
}

// ===== Submission Question =====
export interface SubmissionQuestion {
  id: string;
  originalQuestionId: string;
  questionType: string; // "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE" | "FILL_IN"
  content: string;
  score: number;
  orderIndex: number;
  isCorrect: boolean | null;
  userAnswer: string | null;
  options: QuestionOption[];
}

// ===== Submission (full detail) =====
export interface Submission {
  id: string;
  userId: string;
  assessmentId: number;
  status: string; // "IN_PROGRESS" | "SUBMITTED"
  startedAt: string;
  submittedAt: string | null;
  totalScore: number | null;
  isPassed: boolean | null;
  submissionQuestions: SubmissionQuestion[];
}

// ===== Submission Result =====
export interface SubmissionResult {
  submissionId: string;
  totalScore: number;
  passScore: number;
  isPassed: boolean;
}

// ===== Request DTOs =====
export interface StartSubmissionRequest {
  assessmentId: number;
}

export interface SubmitAnswerRequest {
  submissionQuestionId: string;
  answerValue: string;
}

export interface AnswerSubmission {
  submissionQuestionId: string;
  answerValue: string;
}

export interface SubmitSubmissionRequest {
  answers: AnswerSubmission[];
}

// ===== Paginated Response (reusable) =====
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
