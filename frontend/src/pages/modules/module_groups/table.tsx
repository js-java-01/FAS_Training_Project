import type { Menu } from "@/types/menu";
import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type {ColumnDef} from "@tanstack/react-table";

const mockModuleGroups: Menu[] = Array.from({ length: 200 }, (_, index) => {
    const now = new Date();

    return {
        id: `mg-${crypto.randomUUID()}`,
        name: `Module Group ${index + 1}`,
        description:
            index % 2 === 0
                ? "Manage system-level configurations"
                : "Manage application modules",
        isActive: Math.random() > 0.3,
        displayOrder: index + 1,
        menuItems: [],
        createdAt: new Date(now.getTime() - index * 86400000).toISOString(),
        updatedAt: now.toISOString(),
    };
});

export default function ModuleGroupsTable() {
    const navigate = useNavigate();

    const columns = useMemo(
        () =>
            getColumns({
                onView: (menu) => navigate(`/moduleGroups/${menu.id}`),
                onEdit: (menu) => console.log("Edit", menu.id),
                onDelete: (menu) => console.log("Delete", menu.id),
            }),
        [navigate]
    );

    return (
        <DataTable<Menu, unknown>
            columns={columns as ColumnDef<Menu, unknown>[]}
            data={mockModuleGroups}
        />
    );
}
