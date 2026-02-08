import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export const usePermissions = () => {
  const { permissions, role, email, firstName, lastName } = useSelector((state: RootState) => state.auth);

  const user = { email, role, firstName, lastName, permissions };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    const permissionName = `${resource.toUpperCase()}_${action.toUpperCase()}`;
    return hasPermission(permissionName);
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
  };
};
