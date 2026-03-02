import type { Assessment, AssessmentCreateRequest, AssessmentUpdateRequest } from '@/types';
import axiosInstance from '../../axiosInstance';
import { createBaseApiService } from '@/api/base-service.api';
import { Url } from '@/api/url';

const base = createBaseApiService<
  Assessment,
  null,
  AssessmentCreateRequest,
  AssessmentUpdateRequest
>(axiosInstance, Url.ASSESSMENT);

// Adapter for API compatibility (ensures both .items and .content properties exist)
const adaptPageResponse = async (promise: any) => {
  const response = await promise;

  // Case 1: Response has .items property
  if (response && response.items) {
    return {
      ...response,
      content: response.items,
      number: response.page ?? response.number
    };
  }

  // Case 2: Response has .content property
  if (response && response.content) {
    return {
      ...response,
      items: response.content,
      page: response.number ?? response.page
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
      hasPrevious: false
    };
  }

  return response;
};

export const assessmentApi = Object.assign({}, base, {
  getPage: async (params: {
    page?: number;
    size?: number;
    keyword?: string;
    status?: string;
    assessmentTypeId?: string;
  }) => {
    const { page, size, keyword, status, assessmentTypeId, ...rest } = params;

    const pagination = { page, size };
    const search = keyword;
    const filter = { status, assessmentTypeId, ...rest };

    return adaptPageResponse(base.getPage(pagination, search, filter as any));
  },
});
