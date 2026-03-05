export interface TopicSessionRequest {
  lessonId: string;
  deliveryType: string;
  trainingFormat?: string | null;
  duration: number;
  sessionOrder: number;
  learningObjectiveIds?: string[];
  content?: string | null;
  note?: string | null;
}

export interface TopicSessionResponse {
  id: string;
  lessonId: string;
  deliveryType: string;
  trainingFormat?: string | null;
  duration: number;
  sessionOrder: number;
  learningObjectiveIds: string[];
  content?: string | null;
  note?: string | null;
}

export const DELIVERY_TYPE_OPTIONS = [
  { value: "VIDEO_LECTURE", label: "Video Lecture" },
  { value: "LIVE_SESSION", label: "Live Session" },
  { value: "QUIZ", label: "Quiz" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "PROJECT", label: "Project" },
] as const;

export const TRAINING_FORMAT_OPTIONS = [
  { value: "OFFLINE", label: "Offline" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "VIRTUAL_TRAINING", label: "Virtual Training" },
] as const;
