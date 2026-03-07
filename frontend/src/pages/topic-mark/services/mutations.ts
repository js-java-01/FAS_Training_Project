import { topicMarkApi } from "@/api/topicMarkApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export interface UpdateGradePayload {
  topicId: string
  trainingClassId: string
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

export const useExportTopicMarks = ({ topicId, trainingClassId }: { topicId: string; trainingClassId: string }) => {
  return useMutation<Blob, Error>({
    mutationFn: () => topicMarkApi.exportTopicMark({ topicId, trainingClassId }),
  });
};

export const useExportTemplate = ({ topicId, trainingClassId }: { topicId: string; trainingClassId: string }) => {
  return useMutation<Blob, Error>({
    mutationFn: () => topicMarkApi.exportTemplate({ topicId, trainingClassId }),
  });
};

export const useImportTopicMarks = ({ topicId, trainingClassId }: { topicId: string; trainingClassId: string }) => {
  const queryClient = useQueryClient();
  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["gradebook-table"] }),
     queryClient.invalidateQueries({ queryKey: ["grade-history"] }) // update table
    ]);
  };
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await topicMarkApi.importTopicMark(formData, { topicId, trainingClassId });
      console.log(res.data)
      return res.data;
    },
    onSuccess: invalidateAll,
  });
};
