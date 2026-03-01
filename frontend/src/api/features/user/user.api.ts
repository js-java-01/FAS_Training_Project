import type { UserDTO, UserFilter } from "@/types";
import { createBaseApiService } from "../../base-service.api";
import { Url } from "../../url";

const base = createBaseApiService<UserDTO, UserFilter>({ path: Url.USER });

export const userApi = Object.assign({}, base, {});
