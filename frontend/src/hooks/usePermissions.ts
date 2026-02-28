import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";

export const usePermissions = () => {
  const { email, role, firstName, lastName } = useSelector((state: RootState) => state.auth);
  const { activePermissions } = useRoleSwitch();

  const user = { email, role, firstName, lastName };

  const hasPermission = (permission: string): boolean =>
    activePermissions.includes(permission);

  const hasAnyPermission = (requiredPermissions: string[]): boolean =>
    requiredPermissions.some((p) => activePermissions.includes(p));

  const hasAllPermissions = (requiredPermissions: string[]): boolean =>
    requiredPermissions.every((p) => activePermissions.includes(p));

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

