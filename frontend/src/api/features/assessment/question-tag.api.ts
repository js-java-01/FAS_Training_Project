import { createBaseApiService } from "@/api/base-service.api";
import type { QuestionTagDTO, QuestionTagFilter } from "@/types";

const path = "/question-tags";

const base = createBaseApiService<QuestionTagDTO, QuestionTagFilter>({ path: path });

export const questionTagApi = Object.assign({}, base, {});
