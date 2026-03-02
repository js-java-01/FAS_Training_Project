import { topicMarkApi } from "@/api/topicMarkApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export interface UpdateGradePayload {
  courseClassId: string
  userId: string
  columnId: string
  score: number
  reason: string
}

export const useUpdateGrade = () => {
  const queryClient = useQueryClient()

  return useMutation<
    unknown,
    Error,
    UpdateGradePayload
  >({
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
