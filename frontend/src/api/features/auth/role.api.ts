import { createBaseApiService } from "@/api/base-service.api";
import { Url } from "@/api/url";
import type {
  Role,
  RoleCreateRequest,
  RoleFilter,
  RoleUpdateRequest,
} from "@/types";
import axiosInstance from "../../axiosInstance";

const base = createBaseApiService<
  Role,
  RoleFilter,
  RoleCreateRequest,
  RoleUpdateRequest
>(axiosInstance, Url.ROLE);

export const roleApi = Object.assign({}, base, {});
