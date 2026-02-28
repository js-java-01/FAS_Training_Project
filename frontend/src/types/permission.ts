export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt?: string;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
}
