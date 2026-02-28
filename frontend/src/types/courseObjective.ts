export interface CourseObjective {
  id: string;
  name: string;
  description?: string;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseObjectiveRequest {
  name: string;
  description?: string;
}

export interface UpdateCourseObjectiveRequest {
  name: string;
  description?: string;
}