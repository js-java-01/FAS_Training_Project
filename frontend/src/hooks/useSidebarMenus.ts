import { useCallback, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import type { ModuleGroup } from "@/types/module"
import { usePermissions } from "@/hooks/usePermissions"
import { canAccessMenuItem } from "@/utils/permission.utils"
import { moduleGroupApi } from "@/api/moduleApi"
import { iconMap } from "@/constants/iconMap"

/* ================= QUERY (LOCAL) ================= */
const useActiveModuleGroups = () => {
    return useQuery<ModuleGroup[]>({
        queryKey: ["module-groups", "active"],
        queryFn: moduleGroupApi.getActiveModuleGroups,
        staleTime: 5 * 60 * 1000,
    })
}

/* ================= SIDEBAR HOOK ================= */
export function useSidebarMenus() {
    const { data: moduleGroups = [] } = useActiveModuleGroups()
    const { hasPermission } = usePermissions()
    const location = useLocation()

    /* -------- ACTIVE ROUTE CHECK ------------ */
    const isActiveRoute = useCallback(
        (url?: string) =>
            !!url &&
            (location.pathname === url ||
                location.pathname.startsWith(url + "/")),
        [location.pathname]
    )

    /* -------- MAP MODULE ➜ Sidebar Nav ------ */
    const navGroups = useMemo(() => {
        return moduleGroups
            .map((group) => {
                const items = group.modules
                    .filter(
                        (module) =>
                            !module.parentId &&
                            canAccessMenuItem(
                                module.requiredPermission,
                                hasPermission
                            )
                    )
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((module) => {
                        const safeIcon =
                            module.icon && module.icon in iconMap
                                ? module.icon
                                : "menu"

                        const children = module.children
                            ?.filter((c) =>
                                canAccessMenuItem(
                                    c.requiredPermission,
                                    hasPermission
                                )
                            )
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((c) => ({
                                title: c.title,
                                url: c.url || "#",
                            }))

                        return {
                            title: module.title,
                            url: module.url || "#",
                            icon: iconMap[safeIcon],
                            isActive:
                                isActiveRoute(module.url) ||
                                children?.some((c) =>
                                    isActiveRoute(c.url)
                                ),
                            items:
                                children && children.length > 0
                                    ? children
                                    : undefined,
                        }
                    })

                if (items.length === 0) return null

                return {
                    id: group.id,
                    name: group.name,
                    items,
                }
            })
            .filter(Boolean)
    }, [moduleGroups, hasPermission, isActiveRoute])

    return { navGroups }
}
