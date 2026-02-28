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

export const userApi = Object.assign({}, base, {
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await axiosInstance.post<User>(
      `${Url.USER}/${id}/toggle-status`,
    );
    return response.data;
  },

  assignRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await axiosInstance.post<User>(
      `${Url.USER}/${userId}/assign-role`,
      { roleId },
    );
    return response.data;
  },
});
