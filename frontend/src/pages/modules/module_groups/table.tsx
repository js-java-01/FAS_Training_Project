import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { Menu } from "@/types/menu";
import { encodeBase64 } from "@/utils/base64.utils.ts";
import { mockModuleGroups } from "../../../mocks/moduleGroups.mock.ts";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";

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
            isSearch={true}
            searchPlaceholder={"module group name or description"}
            headerActions={  <Button
                onClick={() => console.log("Add New Module Group")}
                className="justify-self-end w-full lg:w-30 bg-blue-600 text-white"
                variant="outline"
                autoFocus={false}
            >
                Add New
                <Plus className="h-4 w-4" />
            </Button>}
        />
    );
}
