/* ========================
   Training Class Types
======================== */

import type { ClassStatusType } from "@/pages/training-classes/enum/ClassStatus";

export interface TrainingClass {
  id: string;
  className: string;
  description?: string;
  classCode: string;
  enrollmentKey?: string;
  isActive: boolean;
  creatorName?: string;
  approverName?: string;
  semesterName?: string;
  trainingProgramId?: string;
  trainingProgramName?: string;
  startDate: string;
  endDate: string;
  status: ClassStatusType;
  trainerNames?: string[];
}

export interface CreateTrainingClassRequest {
  className: string;
  classCode: string;
  semesterId: string;
  trainingProgramId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTrainingClassRequest {
  className?: string;
  classCode?: string;
  semesterId?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

/* ========================
   Semester Types
======================== */

export interface SemesterResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface TrainingClassSemesterResponse {
  semesterId: string;
  semesterName: string;
  classes: TrainingClass[];
}