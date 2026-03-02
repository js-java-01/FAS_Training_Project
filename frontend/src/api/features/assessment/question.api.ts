import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { Question, QuestionCreateRequest, QuestionFilter } from "@/types";

const base = createBaseApiService<
  Question,
  QuestionFilter,
  QuestionCreateRequest,
  null
>(axiosInstance, Url.QUESTION);

export const questionApi = Object.assign({}, base, {});