// permission.utils.ts
export const canAccessUI = (
    permission?: string,
    hasPermission?: (p: string) => boolean
) => {
    if (import.meta.env.DEV) return true;
    if (!permission) return true;
    return !!hasPermission?.(permission);
};

// const canAccessMenuItem = (requiredPermission?: string) => {
//     if (!requiredPermission) return true;
//     const hasAccess = hasPermission(requiredPermission);
//     console.log(`Permission check: ${requiredPermission} = ${hasAccess}`);
//     return hasAccess;
// };
