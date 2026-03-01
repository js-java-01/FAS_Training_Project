import { topicMarkApi } from "@/api/topicMarkApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateGrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: topicMarkApi.updateGrade,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gradebook-table"],
      })
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "grade-history",
      })
    },
  })
}
