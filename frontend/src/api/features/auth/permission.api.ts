import { createBaseApiService } from '@/api/base-service.api';
import { Url } from '@/api/url';
import type { Permission, PermissionCreateRequest, PermissionFilter, PermissionUpdateRequest } from '../../../types/features/auth/permission';
import axiosInstance from '../../axiosInstance';

const base = createBaseApiService<
  Permission,
  PermissionFilter,
  PermissionCreateRequest,
  PermissionUpdateRequest
>(axiosInstance, Url.PERMISSION);

export const permissionApi = Object.assign({}, base, {});