import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionTag, QuestionTagRequest } from "@/types";

const base = createBaseApiService<
  QuestionTag,
  null,
  QuestionTagRequest,
  QuestionTagRequest
>(axiosInstance, Url.QUESTION_TAG);

export const questionTagApi = Object.assign({}, base, {});