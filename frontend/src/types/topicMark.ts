/* ===============================
   COURSE & CLASS
================================= */

import type { ApiResponse, PagedData } from "./response"

/* ===============================
   TRAINING CLASS INFO (for Topic Mark)
================================= */

export interface TopicInfo {
  id: string
  topicName: string
  topicCode: string
}

export interface TrainingProgramInfo {
  id: string
  name: string
  topics: TopicInfo[]
}

export interface ClassInfoForMark {
  id: string
  className: string
  classCode: string
}

export interface TrainingClassInfoResponse {
  classInfo: ClassInfoForMark
  trainingProgram: TrainingProgramInfo | null
}

export interface Course {
  id: string
  courseName: string
  courseCode: string
  topicId?: string | null
  topicName?: string | null
  topicCode?: string | null
}

export interface Trainer {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface ClassInfo {
  id: string
  className: string
  classCode: string
}

export interface CourseClasses {
  id: string
  course: Course
  classInfo: ClassInfo
  trainer: Trainer
  createdAt: string
  updatedAt: string
}

/* ===============================
   GRADEBOOK
================================= */

export interface GradebookColumnMeta {
  key: string
  label: string
  assessmentTypeId: string | null
  assessmentTypeName: string | null
  weight: number | null
  columnIndex: number | null
}

export interface GradebookRow {
  userId: string
  topicId: string
  trainingClassId: string
  fullName: string
  email: string
  topic: string | null
  values: Record<string, number | boolean | null>
}

export interface GradebookDataTable {
  columns: GradebookColumnMeta[]
  rows: PagedData<GradebookRow>
}

export type GradebookTableResponse = ApiResponse<GradebookDataTable>

export interface GradeHistoryItem {
  id: string
  student: {
    id: string
    name: string
  }
  column: {
    id: string
    name: string
  }
  oldScore: number
  newScore: number
  changeType: "INCREASE" | "DECREASE"
  reason: string
  updatedBy: {
    id: string
    name: string
  }
  updatedAt: string
}

export interface GradeHistoryPageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  sort?: string
}
