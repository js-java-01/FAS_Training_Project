export interface CourseObjective {
  id: string;
  code: string;
  name: string;
  description?: string;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseObjectiveRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCourseObjectiveRequest {
  name: string;
  code: string;
  description?: string;
}