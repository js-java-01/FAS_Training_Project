import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { Menu } from "@/types/menu";
import { encodeBase64 } from "@/utils/base64.utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModuleGroupForm } from "./form";
import type { ModuleGroupDto } from "./form";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { mockMenus } from "@/mocks/mockMenus.mock";

export default function ModuleGroupsTable() {
    const navigate = useNavigate();
    const [data, setData] = useState<Menu[]>(mockMenus);
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<ModuleGroupDto | null>(null);
    const [deleting, setDeleting] = useState<Menu | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const columns = useMemo(
        () =>
            getColumns({
                // VIEW
                onView: (menu) => {
                    navigate(`/moduleGroups/${encodeBase64(menu.id)}`);
                },

                // EDIT
                onEdit: (menu: Menu) => {
                    setEditing({
                        id: menu.id,
                        name: menu.name,
                        description: menu.description,
                        displayOrder: menu.displayOrder,
                        isActive: menu.isActive,
                    });
                    setOpenForm(true);
                },

                // DELETE
                onDelete: (menu) => {
                    setDeleting(menu);
                },
            }),
        [navigate]
    );

    // SAVE 
    const handleSaved = (saved: ModuleGroupDto) => {
        if (saved.id) {
            // EDIT
            setData(prev =>
                prev.map(item =>
                    item.id === saved.id
                        ? {
                              ...item,
                              name: saved.name,
                              description: saved.description,
                              displayOrder: saved.displayOrder,
                              isActive: saved.isActive,
                          } as Menu
                        : item
                )
            );
            showToast("Updated (mock)");
        } else {
            const newItem: Menu = {
                id: crypto.randomUUID(),
                name: saved.name,
                description: saved.description,
                displayOrder: saved.displayOrder ?? prevMaxOrder(data) + 1,
                isActive: saved.isActive ?? true,
                createdAt: new Date().toISOString(),
            } as unknown as Menu;

            setData(prev => [...prev, newItem]);
            showToast("Created (mock)");
        }

        setOpenForm(false);
        setEditing(null);
    };

    const prevMaxOrder = (arr: Menu[]) =>
        arr.reduce((max, i) => Math.max(max, i.displayOrder ?? 0), 0);

    // DELETE 
    const handleDelete = () => {
        if (!deleting) return;
        setData(prev => prev.filter(i => i.id !== deleting.id));
        setDeleting(null);
        showToast("Deleted (mock)");
    };

    return (
        <div className="relative space-y-4">

            {/* toast */}
            {toast && (
                <div className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded shadow
                                animate-[fadeIn_.2s_ease-out]">
                    {toast}
                </div>
            )}

            <DataTable<Menu, unknown>
                columns={columns as ColumnDef<Menu, unknown>[]}
                data={data}
                isSearch={true}
                searchPlaceholder={"module group name or description"}
                headerActions={
                    <Button
                        onClick={() => {
                            setEditing(null); // tạo mới
                            setOpenForm(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white
                                   hover:bg-blue-700 transition hover:scale-[1.02]"
                        autoFocus={false}
                    >
                        Add New
                        <Plus className="h-4 w-4" />
                    </Button>
                }
            />

            {/* modal add / edit */}
            <ModuleGroupForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setEditing(null);
                }}
                initial={editing}
                onSaved={handleSaved}
            />

            {/* confirm delete */}
            <ConfirmDialog
                open={!!deleting}
                title="Delete module group?"
                description={`Are you sure you want to delete "${deleting?.name}"?`}
                onCancel={() => setDeleting(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
