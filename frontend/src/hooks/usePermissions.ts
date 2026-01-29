import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const canAccessResource = (resource: string, action: string): boolean => {
    const permissionName = `${resource}_${action}`;
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
