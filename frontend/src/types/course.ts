export type CourseStatus = 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
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
  topicId?: string;
  topicName?: string;
  /** @deprecated use topicName */
  topic?: string;
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
  level?: CourseLevel;
  estimatedTime?: number;
  note?: string;
  description?: string;
  minGpaToPass?: number;
  minAttendancePercent?: number;
  allowFinalRetake?: boolean;
  trainerId?: string;
  topicId?: string;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;
