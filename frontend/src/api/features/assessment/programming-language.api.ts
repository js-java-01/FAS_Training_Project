import type { ProgrammingLangDTO, ProgrammingLangFilter } from "@/types";
import { createBaseApiService } from "../../base-service.api";
import { Url } from "../../url";

const base = createBaseApiService<ProgrammingLangDTO, ProgrammingLangFilter>({ path: Url.PROGRAMMING_LANGUAGE });

export const programmingLanguageApi = Object.assign({}, base, {});