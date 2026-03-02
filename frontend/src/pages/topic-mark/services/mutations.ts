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
    return useMutation({
        mutationFn: async () => {
            return await topicMarkApi.exportTopicMark(id); // Blob
        },
    });
};

export const useExportTemplate = ({ id }: { id: string }) => {
    return useMutation({
        mutationFn: async () => {
            return await topicMarkApi.exportTemplate(id); // Blob
        },
    });
};

export const useImportTopicMarks = () => {
  const queryClient = useQueryClient();
  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["gradebook-table"] }), // update table
    ]);
  };
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await topicMarkApi.importTopicMark(formData);
      console.log(res.data)
      return res.data;
    },
    onSuccess: invalidateAll,
  });
};
