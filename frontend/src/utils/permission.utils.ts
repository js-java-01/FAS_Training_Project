export const canAccessMenuItem = (
    requiredPermission?: string,
    hasPermission?: (p: string) => boolean
) => {
    if (!requiredPermission) return true
    if (!hasPermission) return false

    const hasAccess = hasPermission(requiredPermission)
    return hasAccess
}
