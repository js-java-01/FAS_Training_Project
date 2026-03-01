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
    },
  })
}
