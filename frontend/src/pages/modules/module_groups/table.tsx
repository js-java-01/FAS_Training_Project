import type {Menu} from "@/types/menu.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/data_table/DataTable.tsx";
import {getColumns} from "@/pages/modules/module_groups/column.tsx";

const mockModuleGroups: Menu[] = Array.from({length: 200}, (_, index) => {
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
    const columns = getColumns();
    return (<DataTable<Menu, unknown>
        columns={columns as ColumnDef<Menu, unknown>[]}
        data={mockModuleGroups}

    />)
}