import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionCategory, QuestionCategoryRequest, QuestionCategoryFilter } from "@/types";

const base = createBaseApiService<
  QuestionCategory,
  QuestionCategoryFilter,
  QuestionCategoryRequest,
  QuestionCategoryRequest
>(axiosInstance, Url.QUESTION_CATEGORY);

// Adapter for ProTable compatibility (converts .items to .content)
const adaptPageResponse = async (promise: any) => {
  const response = await promise;

  // Case 1: Response is already a proper PageResponse with .items
  if (response && response.items) {
    const adapted = { ...response, content: response.items };
    return adapted;
  }

  // Case 2: Response already has .content
  if (response && response.content) {
    const adapted = { ...response, items: response.content };
    return adapted;
  }

  // Case 3: Backend returns a plain array (not following PageResponse structure)
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

export const questionCategoryApi = Object.assign({}, base, {
  getPage: async (pagination: any, search?: string, filter?: QuestionCategoryFilter) => {
    const result = await adaptPageResponse(base.getPage(pagination, search, filter));
    return result;
  },
});