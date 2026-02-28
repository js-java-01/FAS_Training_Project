export type CourseStatus = "DRAFT" | "UNDER_REVIEW" | "ACTIVE";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  price?: number;
  discount?: number;
  level?: CourseLevel;
  estimatedTime?: number;
  thumbnailUrl?: string;
  status?: CourseStatus;
  note?: string;
  description?: string;
  minGpaToPass?: number;
  minAttendancePercent?: number;
  allowFinalRetake?: boolean;
  trainerId?: string;
  trainerName?: string;
  createdBy?: string;
  createdByName?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate?: string;
}

export interface CreateCourseRequest {
  courseName: string;
  courseCode: string;
  price?: number;
  discount?: number;
  level?: CourseLevel;
  estimatedTime?: number;
  note?: string;
  description?: string;
  minGpaToPass?: number;
  minAttendancePercent?: number;
  allowFinalRetake?: boolean;
  trainerId?: string;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

export interface CourseDetailsResponse {
  id: string;
  courseName: string;
  courseCode: string;
  level: string;
  note?: string;
  description?: string;
  minGpaToPass: number;
  minAttendancePercent: number;
  allowFinalRetake: boolean;
  semesterId: string;
  semesterName: string;
}
