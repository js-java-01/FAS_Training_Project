import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicApi } from "@/api/topicApi";
import { TOPIC_QUERY_KEY } from "../queries";

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