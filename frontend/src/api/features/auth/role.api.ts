import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { RoleDTO, RoleFilter } from "@/types";

const base = createBaseApiService<RoleDTO, RoleFilter>({
  path: Url.ROLE,
});

export const roleApi = Object.assign({}, base, {});
