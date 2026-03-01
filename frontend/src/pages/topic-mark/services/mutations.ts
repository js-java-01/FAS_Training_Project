import { topicMarkApi } from "@/api/topicMarkApi"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mockGetGradeHistory } from "../gradeHistory.mock"

export const useUpdateGrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: topicMarkApi.updateGrade,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gradebook-table"],
      })
    },
  })
}

export function useInfiniteGradeHistory(filters: any) {
  return useInfiniteQuery({
    queryKey: ["grade-history", filters],
    queryFn: ({ pageParam = 0 }) =>
      mockGetGradeHistory({
        ...filters,
        page: pageParam,
        size: 10,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
  })
}
