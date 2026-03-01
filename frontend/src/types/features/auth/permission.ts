export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCreateRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
}

export interface PermissionUpdateRequest {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export interface PermissionFilter {
  resource?: string;
  action?: string;
  isActive?: boolean;
  createdRange?: [string, string];
}