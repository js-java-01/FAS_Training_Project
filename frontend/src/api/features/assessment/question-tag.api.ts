import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { QuestionTagDTO, QuestionTagFilter } from "@/types";


const base = createBaseApiService<QuestionTagDTO, QuestionTagFilter>({ path: Url.QUESTION_TAG });

export const questionTagApi = Object.assign({}, base, {});
