import { createBaseApiService } from "@/api/base-service.api";
import type { QuestionCategoryDTO, QuestionCategoryFilter } from "@/types";

const path = "/question-categories";

const base = createBaseApiService<QuestionCategoryDTO, QuestionCategoryFilter>({ path: path });

export const questionCategoryApi = Object.assign({}, base, {});
