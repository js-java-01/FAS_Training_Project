import { createBaseApiService } from "@/api/base-service.api";
import type { QuestionOption } from "@/types";

const path = "/question-options";

const base = createBaseApiService<QuestionOption, null>({ path: path });

export const questionOptionApi = Object.assign({}, base, {});
