/* ========================
   Training Class Types
======================== */

import type { ClassStatusType } from "@/pages/training-classes/enum/ClassStatus";

export interface TrainingClass {
  id: string;
  className: string;
  description?: string;
  classCode: string;
  isActive: boolean;
  creatorName?: string;
  approverName?: string;
  semesterName?: string;
  startDate: string;
  endDate: string;
  status: ClassStatusType;
}

export interface CreateTrainingClassRequest {
  className: string;
  classCode: string;
  semesterId: string;
  startDate: string;
  endDate: string;
}

/* ========================
   Semester Types
======================== */

export interface Semester {
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