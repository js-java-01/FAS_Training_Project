import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicApi } from "@/api/topicApi";
import { TOPIC_QUERY_KEY,TOPIC_OBJECTIVE_QUERY_KEY } from "../queries";

export const useExportTopics = () =>
  useMutation({
    mutationFn: () => topicApi.exportTopics(),
  });

export const useImportTopics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => topicApi.importTopics(file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TOPIC_QUERY_KEY] }),
  });
};

export const useDownloadTopicTemplate = () =>
  useMutation({
    mutationFn: () => topicApi.downloadTemplate(),
  });
 
export const useDeleteObjective = (topicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectiveId: string) =>
      topicApi.deleteObjective(topicId, objectiveId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TOPIC_OBJECTIVE_QUERY_KEY, topicId],
      });
    },
  });
};

export const useCreateObjective = (topicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) =>
      topicApi.createObjective(topicId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TOPIC_OBJECTIVE_QUERY_KEY, topicId],
      });
    },
  });
};

export const useUpdateObjective = (topicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      objectiveId,
      payload,
    }: {
      objectiveId: string;
      payload: any;
    }) =>
      topicApi.updateObjective(topicId, objectiveId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TOPIC_OBJECTIVE_QUERY_KEY, topicId],
      });
    },
  });
};

export const useExportObjectives = (topicId: string) =>
  useMutation({
    mutationFn: () => topicApi.exportObjectives(topicId),
  });

  export const useImportObjectives = (topicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      topicApi.importObjectives(topicId, file),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [TOPIC_OBJECTIVE_QUERY_KEY, topicId],
      });
    },
  });
};

export const useDownloadObjectiveTemplate = (topicId: string) =>
  useMutation({
    mutationFn: () =>
      topicApi.downloadObjectiveTemplate(topicId),
  });