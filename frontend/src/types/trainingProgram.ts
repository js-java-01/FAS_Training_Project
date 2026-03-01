export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  programCourseIds?: string[];
}

export interface TrainingProgramRequest {
  name: string;
  version: string;
  description?: string;
}
