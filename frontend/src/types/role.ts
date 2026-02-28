export interface Role {
  id: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  isActive: boolean;
  permissionIds: string[];
  permissionNames: string[];
  permissionDescriptions: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  hierarchyLevel: number;
  permissionIds: string[];
}


export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  hierarchyLevel?: number;
  permissionIds?: string[];
}

/** Compact role info used by the role-switcher */
export interface RoleSwitchRole {
  id: string;
  name: string;
  permissions: string[];
  isActive?: boolean;
  hierarchyLevel?: number;
}

export const ROLES = {
  ADMIN: "ADMIN",
  DEPARTMENT_MANAGER: "DEPARTMENT_MANAGER",
  STUDENT: "STUDENT",
  TRAINER: "TRAINER",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type ROLES = typeof ROLES[keyof typeof ROLES];
