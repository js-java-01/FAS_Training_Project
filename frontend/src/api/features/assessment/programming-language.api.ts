import type { ProgrammingLangDTO, ProgrammingLangFilter } from "@/types";
import { createBaseApiService } from "../../base-service.api";

const path = "/programming-languages";

const base = createBaseApiService<ProgrammingLangDTO, ProgrammingLangFilter>({ path: path });

export const programmingLanguageApi = Object.assign({}, base, {});