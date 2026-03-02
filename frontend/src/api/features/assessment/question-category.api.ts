import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionCategoryDTO, QuestionCategoryFilter } from "@/types";

const base = createBaseApiService<QuestionCategoryDTO, QuestionCategoryFilter>({ path: Url.QUESTION_CATEGORY });

export const questionCategoryApi = Object.assign({}, base, {});
