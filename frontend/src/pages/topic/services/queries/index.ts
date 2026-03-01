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