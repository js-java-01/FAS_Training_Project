import type {
  User,
  UserCreateRequest,
  UserFilter,
  UserUpdateRequest,
} from "@/types";
import axiosInstance from "../../axiosInstance";
import { createBaseApiService } from "../../base-service.api";
import { Url } from "../../url";

const base = createBaseApiService<
  User,
  UserFilter,
  UserCreateRequest,
  UserUpdateRequest
>(axiosInstance, Url.USER);

export const userApi = Object.assign({}, base, {});
