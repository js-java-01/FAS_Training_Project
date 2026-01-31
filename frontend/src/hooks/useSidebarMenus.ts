import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import type { ModuleGroup } from "@/types/module"

import { usePermissions } from "@/hooks/usePermissions"
import { canAccessUI } from "@/utils/permission.utils"
import { moduleGroupApi } from "@/api/moduleApi"
import { iconMap } from "@/constants/iconMap"

/* ------------------------------------------ */
export function useSidebarMenus() {
    const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([])
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
    /* --------------------------------------- */

    /* -------- LOAD MODULE GROUPS (API) ------ */
    useEffect(() => {
        moduleGroupApi
            .getActiveModuleGroups()
            .then(setModuleGroups)
            .catch(() => {
                console.warn("You don't have permission to access modules")

            })
    }, [])
    console.log("Module Groups:", moduleGroups)
    /* --------------------------------------- */

    /* -------- MAP MODULE ➜ NavMain ---------- */
    const navGroups = useMemo(() => {
        return moduleGroups.map((group) => {
            const items = group.modules
                .filter(
                    (module) =>
                        !module.parentId &&
                        canAccessUI(
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
                            canAccessUI(
                                c.requiredPermission,
                                hasPermission
                            )
                        )
                        .sort(
                            (a, b) =>
                                a.displayOrder - b.displayOrder
                        )
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

            return {
                id: group.id,
                name: group.name,
                items,
            }
        })
    }, [moduleGroups, hasPermission, isActiveRoute])
    /* --------------------------------------- */

    return {
        navGroups,
    }
}
