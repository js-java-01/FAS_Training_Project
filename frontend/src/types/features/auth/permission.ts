export interface PermissionDTO {
  id?: string;
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionFilter {
  isActive?: boolean;
  resource?: string;
  action?: string;
  createdRange?: [string, string];
}