export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
}

export interface UserUpdateRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface UserFilter {
  roleIds?: string[];
  createFrom?: string;
  createTo?: string;
  isActive?: boolean;
}