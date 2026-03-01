import axiosInstance from "@/api/axiosInstance";
import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { ProgrammingLanguage, ProgrammingLanguageRequest } from "@/types";

const base = createBaseApiService<
  ProgrammingLanguage,
  null,
  ProgrammingLanguageRequest,
  ProgrammingLanguageRequest
>(axiosInstance, Url.PROGRAMMING_LANGUAGE);

export const programmingLanguageApi = Object.assign({}, base, {});