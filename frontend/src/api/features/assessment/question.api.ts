import { createBaseApiService } from "@/api/base-service.api";
import type { Question, QuestionFilter } from "@/types";

const path = "/questions";

const base = createBaseApiService<Question, QuestionFilter>({ path: path });

export const questionApi = Object.assign({}, base, {});
