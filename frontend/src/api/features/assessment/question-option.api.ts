import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionOption, QuestionOptionRequest } from "@/types";

const base = createBaseApiService<
  QuestionOption,
  null,
  QuestionOptionRequest,
  QuestionOptionRequest
>(axiosInstance, Url.QUESTION_OPTION);

export const questionOptionApi = Object.assign({}, base, {});