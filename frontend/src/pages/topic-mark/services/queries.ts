import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { topicMarkApi } from "@/api/topicMarkApi"

export const useGetTrainingInfo = (classId: string) => {
  return useQuery({
    queryKey: ["training-info", classId],
    queryFn: () => topicMarkApi.getTrainingInfo(classId),
    enabled: !!classId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetCoursesByClassId = (id: string) => {
  return useQuery({
    queryKey: ["course-by-class", id],
    queryFn: () => topicMarkApi.getCoursesByClassId(id),
    enabled: !!id,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetClassCourseById = (id: string) => {
  return useQuery({
    queryKey: ["course-by-class", id],
    queryFn: () => topicMarkApi.getClassCourseById(id),
    enabled: !!id,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

interface GradebookParams {
  topicId: string
  trainingClassId: string
  page: number
  pageSize: number
  sort?: string
  keyword?: string
  passed?: boolean
  enabled?: boolean
}

export const useGetGradebookTable = ({
  topicId,
  trainingClassId,
  page,
  pageSize,
  sort,
  keyword,
  passed,
  enabled = true,
}: GradebookParams) => {
  return useQuery({
    queryKey: [
      "gradebook-table",
      topicId,
      trainingClassId,
      page,
      pageSize,
      sort,
      keyword,
      passed,
    ],
    queryFn: () =>
      topicMarkApi.getTopicMarksById({
        topicId,
        trainingClassId,
        page,
        pageSize,
        sort: sort ?? "fullName,asc",
        ...(keyword?.trim()
          ? { keyword: keyword.trim() }
          : {}),
        ...(passed !== undefined
          ? { passed }
          : {}),
      }),
    enabled: enabled && !!topicId && !!trainingClassId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInfiniteGradeHistory(topicId?: string, trainingClassId?: string) {
  return useInfiniteQuery({
    queryKey: ["grade-history", topicId, trainingClassId],
    queryFn: ({ pageParam = 0 }) =>
      topicMarkApi.getHistoryUpdateById({
        topicId: topicId!,
        trainingClassId: trainingClassId!,
        page: pageParam,
        pageSize: 10,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages
        ? lastPage.page + 1
        : undefined,
    initialPageParam: 0,
    enabled: !!topicId && !!trainingClassId,
  })
}
