import { useQuery } from "@tanstack/react-query";
import { topicApi } from "@/api/topicApi";

export const TOPIC_QUERY_KEY = "topics";

export const useGetAllTopics = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
  level?: string;   
  status?: string;
}) => {
  return useQuery({
    queryKey: [TOPIC_QUERY_KEY, params],
    queryFn: () =>
      topicApi.getTopics({ 
        page: params.page,
        size: params.pageSize,
        sort: params.sort,
        keyword: params.keyword,
        status: params.status,
      }),
    placeholderData: (prev) => prev,
  });
};

export const TOPIC_OBJECTIVE_QUERY_KEY = "topic-objectives";

export const useGetTopicObjectives = (
  topicId: string,
  params: {
    page: number;
    pageSize: number;
    sort?: string;
    keyword?: string;
  }
) => {
  return useQuery({
    queryKey: [
      TOPIC_OBJECTIVE_QUERY_KEY,
      topicId,
      params,
    ],
    queryFn: () =>
      topicApi.getObjectives(topicId, {
        page: params.page,
        size: params.pageSize,
        sort: params.sort,
        keyword: params.keyword,
      }),
    enabled: !!topicId,
    placeholderData: (prev) => prev,
  });
};