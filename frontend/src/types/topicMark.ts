/* ===============================
   COURSE & CLASS
================================= */

import type { ApiResponse, PagedData } from "./response"

export interface Course {
  id: string
  courseName: string
  courseCode: string
}

export interface Trainer {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface CourseClasses {
  id: string
  course: Course
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
  gradingMethod: string | null
  columnIndex: number | null
}

export interface GradebookRow {
  userId: string
  courseClassId: string
  fullName: string
  email: string
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
