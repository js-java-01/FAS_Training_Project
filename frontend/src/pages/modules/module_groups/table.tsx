import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { Menu } from "@/types/menu";
import { encodeBase64 } from "@/utils/base64";
import { mockModuleGroups } from "../moduleGroups.mock.ts";

export default function ModuleGroupsTable() {
    const navigate = useNavigate();

    const columns = useMemo(
        () =>
            getColumns({
                onView: (menu) => {
                    navigate(`/moduleGroups/${encodeBase64(menu.id)}`);
                },
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
