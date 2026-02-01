// permission.utils.ts
export const canAccessMenuItem = (
    requiredPermission?: string,
    hasPermission?: (p: string) => boolean
) => {
    if (import.meta.env.DEV) return true
    if (!requiredPermission) return true

    const hasAccess = !!hasPermission?.(requiredPermission)
    console.log(`Permission check: ${requiredPermission} = ${hasAccess}`)
    return hasAccess
}
