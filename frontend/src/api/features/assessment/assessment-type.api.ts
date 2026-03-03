import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { AssessmentTypeDTO, AssessmentTypeFilter } from "@/types";

const base = createBaseApiService<AssessmentTypeDTO, AssessmentTypeFilter>({
  path: Url.ASSESSMENT_TYPE,
});

// Adapter for API compatibility (ensures both .items and .content exist)
const adaptPageResponse = async (promise: any) => {
  const response = await promise;

  // Case 1: Response has .items
  if (response && response.items) {
    return {
      ...response,
      content: response.items,
      number: response.page ?? response.number,
    };
  }

  // Case 2: Response has .content
  if (response && response.content) {
    return {
      ...response,
      items: response.content,
      page: response.number ?? response.page,
    };
  }

  // Case 3: Backend returns plain array
  if (Array.isArray(response)) {
    return {
      content: response,
      items: response,
      page: 0,
      number: 0,
      size: response.length,
      totalPages: 1,
      totalElements: response.length,
      hasNext: false,
      hasPrevious: false,
    };
  }

  return response;
};

export const assessmentTypeApi = Object.assign({}, base, {
  getPage: async (params: {
    page?: number;
    size?: number;
    keyword?: string;
  } & AssessmentTypeFilter) => {
    const { page, size, keyword, ...filter } = params;

    const pagination = { page, size };
    const search = keyword;

    return adaptPageResponse(
      base.getPage(pagination, search, filter as AssessmentTypeFilter)
    );
  },
});