import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionCategory, QuestionCategoryRequest } from "@/types";

const base = createBaseApiService<
  QuestionCategory,
  null,
  QuestionCategoryRequest,
  QuestionCategoryRequest
>(axiosInstance, Url.QUESTION_CATEGORY);

export const questionCategoryApi = Object.assign({}, base, {});