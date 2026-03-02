import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionTag, QuestionTagRequest, QuestionTagFilter } from "@/types";

const base = createBaseApiService<
  QuestionTag,
  QuestionTagFilter,
  QuestionTagRequest,
  QuestionTagRequest
>(axiosInstance, Url.QUESTION_TAG);

// Adapter for ProTable compatibility (converts .items to .content)
const adaptPageResponse = async (promise: any) => {
  const response = await promise;

  if (response && response.items) {
    return { ...response, content: response.items };
  }

  // Case 2: Response has .content property
  if (response && response.content) {
    return { ...response, items: response.content };
  }

  // Case 3: Backend returns plain array
  if (Array.isArray(response)) {
    return {
      content: response,
      items: response,
      page: 0,
      size: response.length,
      totalPages: 1,
      totalElements: response.length,
      hasNext: false,
      hasPrevious: false
    };
  }

  return response;
};

export const questionTagApi = Object.assign({}, base, {
  getPage: async (pagination: any, search?: string, filter?: QuestionTagFilter) => {
    return adaptPageResponse(base.getPage(pagination, search, filter));
  },
});