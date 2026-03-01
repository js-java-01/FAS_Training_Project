import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { topicMarkApi } from "@/api/topicMarkApi"

export const useGetCourseByClassId = (id: string) => {
  return useQuery({
    queryKey: ["course-by-class", id],
    queryFn: () => topicMarkApi.getCourseByClassId(id),
    enabled: !!id,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

interface GradebookParams {
  id: string
  page: number
  pageSize: number
  sort?: string
  keyword?: string
  passed?: boolean
  enabled?: boolean
}

export const useGetGradebookTable = ({
  id,
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
      id,
      page,
      pageSize,
      sort,
      keyword,
      passed,
    ],
    queryFn: () =>
      topicMarkApi.getTopicMarksById({
        id,
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
    enabled: enabled && !!id,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInfiniteGradeHistory(id?: string) {
  return useInfiniteQuery({
    queryKey: ["grade-history", id],
    queryFn: ({ pageParam = 0 }) =>
      topicMarkApi.getHistoryUpdateById({
        id: id!,
        page: pageParam,
        pageSize: 10,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages
        ? lastPage.page + 1
        : undefined,
    initialPageParam: 0,
    enabled: !!id,
  })
}
