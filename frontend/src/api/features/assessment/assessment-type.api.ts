import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { AssessmentType, AssessmentTypeRequest, AssessmentTypeFilter } from "@/types";

const base = createBaseApiService<
  AssessmentType,
  AssessmentTypeFilter,
  AssessmentTypeRequest,
  AssessmentTypeRequest
>(axiosInstance, Url.ASSESSMENT_TYPE);

// Adapter for ProTable compatibility (converts .items to .content)
const adaptPageResponse = async (promise: any) => {
  const response = await promise;

  // Case 1: Response has .items property
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

export const assessmentTypeApi = Object.assign({}, base, {
  getPage: async (pagination: any, search?: string, filter?: AssessmentTypeFilter) => {
    return adaptPageResponse(base.getPage(pagination, search, filter));
  },
});
