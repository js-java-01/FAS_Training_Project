import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { Question, QuestionFilter } from "@/types";


const base = createBaseApiService<Question, QuestionFilter>({ path: Url.QUESTION});

export const questionApi = Object.assign({}, base, {});
