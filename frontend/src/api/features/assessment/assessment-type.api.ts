import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { AssessmentType, AssessmentTypeRequest } from "@/types";

const base = createBaseApiService<
  AssessmentType,
  null,
  AssessmentTypeRequest,
  AssessmentTypeRequest
>(axiosInstance, Url.ASSESSMENT_TYPE);

export const assessmentTypeApi = Object.assign({}, base, {});
