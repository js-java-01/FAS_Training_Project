import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module/column";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { MenuItem } from "@/types/menu";
import { encodeBase64 } from "@/utils/base64.utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {mockMenus} from "@/mocks/mockMenus.mock.ts";

export default function ModulesTable() {
    const navigate = useNavigate();

    const columns = useMemo(
        () =>
            getColumns({
                onView: (menu) => {
                    navigate(`/modules/${encodeBase64(menu.id)}`);
                },
                onEdit: (menu) => console.log("Edit", menu.id),
                onDelete: (menu) => console.log("Delete", menu.id),
            }),
        [navigate]
    );

    return (
        <DataTable<MenuItem, unknown>
            columns={columns as ColumnDef<MenuItem, unknown>[]}
            data={mockMenus.flatMap(mg => mg.menuItems)}
            isSearch={true}
            searchPlaceholder={"module name or description"}
            headerActions={  <Button
                onClick={() => console.log("Add New Module")}
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
