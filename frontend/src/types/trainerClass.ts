import type { TrainingClass } from "@/types/trainingClass";

export type TrainerClassSemesterResponse = {
  semesterId: string;
  semesterName: string;
  classes: TrainingClass[];
};

export interface TraineeDetailsResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  semesterId: string;
  semesterName: string;
}
