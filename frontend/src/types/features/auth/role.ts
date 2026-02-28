export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissionIds: string[];
}


export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface RoleFilter {
  isActive?: boolean;
  permissionIds?: string[];
  createFrom?: string;
  createTo?: string;
}
