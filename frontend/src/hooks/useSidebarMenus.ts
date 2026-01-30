import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import type { Menu } from "@/types/menu"

import { usePermissions } from "@/hooks/usePermissions"
import { canAccessUI } from "@/utils/permission.utils"
import { menuApi } from "@/api/menuApi.ts";
import type { IconKey } from "@/types/menu"
import type { LucideIcon } from "lucide-react"

import {
    LayoutDashboard,
    Users,
    User,
    Shield,
    Settings,
    List,
    Folder,
    Layers,
    Calendar,
    BookOpen,
    ClipboardCheck,
    Home,
    Star,
    Building,
    MapPin,
    TrendingUp,
} from "lucide-react"
import {mockMenus} from "@/mocks/mockMenus.mock.ts";


/* ------------ ICON MAP --------------- */
const iconMap: Record<IconKey, LucideIcon> = {
    dashboard: LayoutDashboard,
    users: Users,
    person: User,
    people: Users,

    security: Shield,
    settings: Settings,
    menu: List,

    folder: Folder,
    layers: Layers,
    calendar: Calendar,

    "book-open": BookOpen,
    "clipboard-check": ClipboardCheck,

    home: Home,
    star: Star,
    building: Building,
    "map-pin": MapPin,
    "trending-up": TrendingUp,
}

/* ------------------------------------------ */
export function useSidebarMenus() {
    const [menus, setMenus] = useState<Menu[]>([])
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

    /* -------- LOAD MENUS (API) -------------- */
    useEffect(() => {
        menuApi
            .getActiveMenus()
            .then(setMenus)
            .catch(() => {
                // Chưa login → fallback mock
                console.warn("Menu API failed → use mockMenusMock")
                setMenus(mockMenus)
            })
    }, [])

    /* --------------------------------------- */

    /* -------- MAP MENU ➜ NavMain ------------ */
    const navGroups = useMemo(() => {
        return menus.map((menu) => {
            const items = menu.menuItems
                .filter(
                    (item) =>
                        !item.parentId &&
                        canAccessUI(
                            item.requiredPermission,
                            hasPermission
                        )
                )
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => {
                    const safeIcon =
                        item.icon && item.icon in iconMap
                            ? item.icon
                            : "menu"
                    const children = item.children
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
                        title: item.title,
                        url: item.url || "#",
                        icon: iconMap[safeIcon],
                        isActive:
                            isActiveRoute(item.url) ||
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
                id: menu.id,
                name: menu.name,
                items,
            }
        })
    }, [menus, hasPermission, isActiveRoute])
    /* --------------------------------------- */

    return {
        navGroups,
    }
}
