import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type { PermissionDTO, PermissionFilter } from "@/types";

const base = createBaseApiService<PermissionDTO, PermissionFilter>({
  path: Url.PERMISSION,
});

export const permissionApi = Object.assign({}, base, {});
