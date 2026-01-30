import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { menuApi } from "../../api/menuApi.ts";
import type { Menu } from "../../types/menu.ts";
import { usePermissions } from "../../hooks/usePermissions.ts";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar.tsx";

const iconMap: Record<string, string> = {
    dashboard: "📊",
    person: "👤",
    people: "👥",
    security: "🔐",
    menu: "📋",
    settings: "⚙️",
    school: "🎓",
    assignment: "📝",
    grade: "📈",
};

export function SidebarMenu() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const { hasPermission } = usePermissions();
    const location = useLocation();

    useEffect(() => {
        menuApi.getActiveMenus().then(setMenus);
    }, []);

    const isActiveRoute = (url?: string) =>
        url &&
        (location.pathname === url ||
            location.pathname.startsWith(url + "/"));

    const canAccess = (permission?: string) =>
        !permission || hasPermission(permission);

    return (
        <Sidebar className="bg-gray-900 text-white">
            {/* Header */}
            <SidebarHeader className="h-16 px-4 pt-6 flex items-center text-xl font-bold bg-gray-800">
                RBAC System
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="overflow-y-auto bg-gray-800">
                <div className="py-4">
                    {menus.map((menu) => (
                        <div key={menu.id} className="mb-6">
                            <div className="px-4 mb-2">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {menu.name}
                                </h3>
                            </div>

                            <nav className="space-y-1">
                                {menu.menuItems
                                    .filter(
                                        (item) =>
                                            !item.parentId &&
                                            canAccess(item.requiredPermission)
                                    )
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((item) => (
                                        <div key={item.id}>
                                            {item.url ? (
                                                <Link
                                                    to={item.url}
                                                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                                                        isActiveRoute(item.url)
                                                            ? "bg-gray-800 text-white border-l-4 border-blue-500"
                                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                                    }`}
                                                >
                          <span className="mr-3 text-lg">
                            {iconMap[item.icon || ""] || "📄"}
                          </span>
                                                    {item.title}
                                                </Link>
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-400">
                                                    {item.title}
                                                </div>
                                            )}

                                            {item.children?.length > 0 && (
                                                <div className="ml-4 space-y-1">
                                                    {item.children
                                                        .filter((c) =>
                                                            canAccess(c.requiredPermission)
                                                        )
                                                        .sort(
                                                            (a, b) =>
                                                                a.displayOrder - b.displayOrder
                                                        )
                                                        .map((child) => (
                                                            <Link
                                                                key={child.id}
                                                                to={child.url || "#"}
                                                                className={`flex items-center px-4 py-2 text-sm transition-colors ${
                                                                    isActiveRoute(child.url)
                                                                        ? "bg-gray-800 text-white"
                                                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                                                }`}
                                                            >
                                <span className="mr-3">
                                  {iconMap[child.icon || ""] || "•"}
                                </span>
                                                                {child.title}
                                                            </Link>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </nav>
                        </div>
                    ))}
                </div>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-4 bg-gray-800 text-xs text-gray-400 text-center">
                RBAC System v1.0
            </SidebarFooter>
        </Sidebar>
    );
}
