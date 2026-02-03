export interface Role {
  id: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  isActive: boolean;
  permissionIds: string[];
  permissionNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}


export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  hierarchyLevel?: number;
  permissionIds?: string[];
}
