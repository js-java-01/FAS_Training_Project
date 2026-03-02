import { useQuery } from "@tanstack/react-query";
import { materialApi } from "@/api/materialApi";
import { lessonApi } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";

export const MATERIAL_QUERY_KEYS = {
  all: ["materials"] as const,
  bySession: (sessionId: string) => [...MATERIAL_QUERY_KEYS.all, "session", sessionId] as const,
  bySessionActive: (sessionId: string) => [...MATERIAL_QUERY_KEYS.all, "session", sessionId, "active"] as const,
  byId: (id: string) => [...MATERIAL_QUERY_KEYS.all, id] as const,
};

export const LESSON_QUERY_KEYS = {
  all: ["lessons"] as const,
  byCourse: (courseId: string) => [...LESSON_QUERY_KEYS.all, "course", courseId] as const,
};

export const SESSION_QUERY_KEYS = {
  all: ["sessions"] as const,
  byLesson: (lessonId: string) => [...SESSION_QUERY_KEYS.all, "lesson", lessonId] as const,
};

// Lessons query
export const useGetLessonsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: LESSON_QUERY_KEYS.byCourse(courseId),
    queryFn: () => lessonApi.getByCourseId(courseId),
    enabled: !!courseId,
    placeholderData: (prev) => prev,
  });
};

// Sessions query
export const useGetSessionsByLesson = (lessonId: string | null) => {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.byLesson(lessonId || ""),
    queryFn: () => sessionService.getSessionsByLesson(lessonId!),
    enabled: !!lessonId,
    placeholderData: (prev) => prev,
  });
};

// Materials queries
export const useGetMaterialsBySession = (sessionId: string | null) => {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.bySession(sessionId || ""),
    queryFn: () => materialApi.getMaterialsBySession(sessionId!),
    enabled: !!sessionId,
    placeholderData: (prev) => prev,
  });
};

export const useGetActiveMaterialsBySession = (sessionId: string | null) => {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.bySessionActive(sessionId || ""),
    queryFn: () => materialApi.getActiveMaterialsBySession(sessionId!),
    enabled: !!sessionId,
    placeholderData: (prev) => prev,
  });
};

export const useGetMaterialById = (id: string | null) => {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.byId(id || ""),
    queryFn: () => materialApi.getMaterialById(id!),
    enabled: !!id,
  });
};
