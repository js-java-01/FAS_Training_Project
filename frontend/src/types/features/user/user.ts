export interface UserDTO {
  id?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFilter {
  isActive?: boolean;
  roleIds?: string[];
  createdRange?: [string, string];
}