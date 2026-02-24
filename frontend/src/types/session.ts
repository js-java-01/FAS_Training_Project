export interface SessionRequest {
  topic: string;
  /** Enum name from backend: VIDEO_LECTURE | LIVE_SESSION | QUIZ | ASSIGNMENT | PROJECT */
  type?: string | null;
  studentTasks?: string | null;
  sessionOrder: number;
  lessonId: string;
  assessmentId?: string | null;
}

export interface SessionResponse {
  id: string;
  topic: string;
  type: string | null;
  studentTasks: string | null;
  sessionOrder: number;
  lessonId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SESSION_TYPE_OPTIONS = [
  { value: "VIDEO_LECTURE", label: "Video Lecture" },
  { value: "LIVE_SESSION", label: "Live Session" },
  { value: "QUIZ", label: "Quiz" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "PROJECT", label: "Project" },
] as const;

export type SessionTypeValue = (typeof SESSION_TYPE_OPTIONS)[number]["value"]; 
