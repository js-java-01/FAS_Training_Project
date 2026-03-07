// ===== User Assessment (Dashboard Card) =====
export interface UserAssessment {
  assessmentId: string;
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
  isCorrect: boolean | null; // only populated after submission/review
}

// ===== Submission Question =====
export interface SubmissionQuestion {
  id: string;
  originalQuestionId: string;
  questionType: string; // "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ESSAY"
  content: string;
  score: number;
  earnedScore: number | null;
  orderIndex: number;
  isCorrect: boolean | null;
  userAnswer: string | null;
  correctAnswer: string | null; // only populated in review/result mode
  options: QuestionOption[];
}

// ===== Submission (full detail - returned by start/answer/submit) =====
export interface Submission {
  submissionId: string;
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  status: string; // "IN_PROGRESS" | "SUBMITTED"
  startedAt: string;
  submittedAt: string | null;
  totalScore: number | null;
  isPassed: boolean | null;
  timeLimitMinutes: number | null;
  remainingTimeSeconds: number | null;
  questions: SubmissionQuestion[];
}

// ===== Submission Summary (returned by GET /submissions/assessment/{id}/users) =====
export interface SubmissionSummary {
  id: string;
  assessmentId: string;
  userId: string;
  status: string;
  isPassed: boolean | null;
  attemptNumber: number;
  totalScore?: number | null;
  startedAt?: string | null;
  submittedAt?: string | null;
}

// ===== Submission Result (returned by GET /result) =====
export interface SubmissionResult {
  submissionId: string;
  assessmentId: string;
  assessmentTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  totalScore: number;
  maxScore: number;
  passScore: number;
  isPassed: boolean;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number | null;
  questionDetails: SubmissionQuestion[];
}

// ===== Request DTOs =====
export interface StartSubmissionRequest {
  assessmentId: string;
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
