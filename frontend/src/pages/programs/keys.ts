export const trainingProgramKeys = {
  all: (params: Record<string, unknown>) => ["training-programs", params] as const,
  detail: (id: string) => ["training-program", id] as const,
};
