export interface RoleDTO {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleFilter {
  isActive?: boolean;
  permissionIds?: string[];
  createdRange?: [string, string];
}
