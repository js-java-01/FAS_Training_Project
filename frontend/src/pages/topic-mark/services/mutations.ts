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

export const useExportTopicMarks = ({ id }: { id: string }) => {
  return useMutation<Blob, Error>({
    mutationFn: () => topicMarkApi.exportTopicMark(id),
  });
};

export const useExportTemplate = ({ id }: { id: string }) => {
  return useMutation<Blob, Error>({
    mutationFn: () => topicMarkApi.exportTemplate(id),
  });
};

export const useImportTopicMarks = ({ id }: { id: string }) => {
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

      const res = await topicMarkApi.importTopicMark(formData, id);
      console.log(res.data)
      return res.data;
    },
    onSuccess: invalidateAll,
  });
};
