export const trainingClassKeys = {
    all: (params: Record<string, unknown>) => ["training-classes", params] as const,
    detail: (id: string) => ["training-class", id] as const,
    semesters: () => ["semesters"] as const,
};
