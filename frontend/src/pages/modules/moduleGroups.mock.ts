import type { Menu, MenuItem } from "@/types/menu";

const createModules = (menuId: string): MenuItem[] => {
    const now = new Date().toISOString();

    return [
        {
            id: `m-${menuId}-users`,
            menuId,
            title: "User Management",
            url: "/users",
            icon: "person",
            description: "Manage system users",
            displayOrder: 1,
            isActive: true,
            requiredPermission: "USER_READ",
            parentId: undefined,
            children: [],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: `m-${menuId}-roles`,
            menuId,
            title: "Role Management",
            url: "/roles",
            icon: "security",
            description: "Manage roles & permissions",
            displayOrder: 2,
            isActive: true,
            requiredPermission: "ROLE_READ",
            parentId: undefined,
            children: [],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: `m-${menuId}-settings`,
            menuId,
            title: "Settings",
            icon: "settings",
            displayOrder: 3,
            isActive: true,
            requiredPermission: "SETTING_READ",
            parentId: undefined,
            children: [
                {
                    id: `m-${menuId}-settings-general`,
                    menuId,
                    parentId: `m-${menuId}-settings`,
                    title: "General Settings",
                    url: "/settings/general",
                    displayOrder: 1,
                    isActive: true,
                    children: [],
                    createdAt: now,
                    updatedAt: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        }
    ];
};

export const mockModuleGroups: Menu[] = Array.from({ length: 10 }, (_, i) => {
    const id = `mg-${i + 1}`;
    const now = new Date().toISOString();

    return {
        id,
        name: `Module Group ${i + 1}`,
        description: "Manage application modules",
        isActive: true,
        displayOrder: i + 1,
        menuItems: createModules(id),
        createdAt: now,
        updatedAt: now,
    };
});
