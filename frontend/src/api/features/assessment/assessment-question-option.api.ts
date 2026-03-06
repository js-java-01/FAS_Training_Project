import { createBaseApiService } from "@/api/base-service.api";
import type { AssessmentQuestionOption } from "@/types/features/assessment/assessment-question-options";
import type { AssessmentQuestionOptionFilter } from "@/types/features/assessment/assessment-question-options";

const path = "/assessment-question-options";

const base = createBaseApiService<AssessmentQuestionOption, AssessmentQuestionOptionFilter>({ path: path });

export const assessmentQuestionOptionApi = Object.assign({}, base, {});
