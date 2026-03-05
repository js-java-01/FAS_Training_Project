export const ClassStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ClassStatusType = (typeof ClassStatus)[keyof typeof ClassStatus];
