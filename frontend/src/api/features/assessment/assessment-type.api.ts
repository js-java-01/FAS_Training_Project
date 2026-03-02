import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { AssessmentTypeDTO, AssessmentTypeFilter } from "@/types";

const base = createBaseApiService<AssessmentTypeDTO, AssessmentTypeFilter>({ path: Url.ASSESSMENT_TYPE });

export const assessmentTypeApi = Object.assign({}, base, {});
