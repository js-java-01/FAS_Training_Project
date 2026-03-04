export const TOPIC_STATUSES = [
  "DRAFT",
  "UNDER_REVIEW",
  "ACTIVE",
  "REJECTED",
] as const;

export const TOPIC_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

export type TopicStatus = (typeof TOPIC_STATUSES)[number];
export type TopicLevel = (typeof TOPIC_LEVELS)[number];

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under review",
  ACTIVE: "Active",
  REJECTED: "Rejected",
};

export const TOPIC_LEVEL_LABELS: Record<TopicLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};