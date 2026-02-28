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

export const assessmentApi = Object.assign({}, base, {});
