import type { AssessmentStatus } from "@/types";

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
