import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module/column";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { MenuItem } from "@/types/menu";
import { encodeBase64 } from "@/utils/base64.utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { ModuleForm } from "./ModuleForm";
import { mockMenus } from "@/mocks/mockMenus.mock";

export default function ModulesTable() {
    const navigate = useNavigate();
    const [data, setData] = useState<MenuItem[]>(mockMenus.flatMap(m => m.menuItems));

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<MenuItem | null>(null);

    const handleCreate = (formData: Partial<MenuItem>) => {
        const newItem: MenuItem = {
            ...formData,
            id: `new-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [],
            isActive: formData.isActive ?? true,
            displayOrder: formData.displayOrder ?? 0,
            menuId: formData.menuId || "menu-systems",
            title: formData.title || "New Module",
            // Add other required fields with defaults
        } as MenuItem;

        setData((prev) => [...prev, newItem]);
        setIsFormOpen(false);
    };

    const handleUpdate = (formData: Partial<MenuItem>) => {
        if (!editingModule) return;

        setData((prev) => prev.map(item =>
            item.id === editingModule.id ? { ...item, ...formData, updatedAt: new Date().toISOString() } as MenuItem : item
        ));

        setIsFormOpen(false);
        setEditingModule(null);
    };

    const handleDelete = (menu: MenuItem) => {
        if (window.confirm(`Are you sure you want to delete module "${menu.title}"?`)) {
             setData((prev) => prev.filter(item => item.id !== menu.id));
        }
    };

    const openCreateModal = () => {
        setEditingModule(null);
        setIsFormOpen(true);
    };

    const openEditModal = (menu: MenuItem) => {
        setEditingModule(menu);
        setIsFormOpen(true);
    };

    const columns = useMemo(
        () =>
            getColumns({
                onView: (menu) => {
                    navigate(`/modules/${encodeBase64(menu.id)}`);
                },
                onEdit: (menu) => openEditModal(menu),
                onDelete: (menu) => handleDelete(menu),
            }),
        [navigate]
    );

    return (
        <>
            <DataTable<MenuItem, unknown>
                columns={columns as ColumnDef<MenuItem, unknown>[]}
                data={data}
                isSearch={true}
                searchPlaceholder={"module name or description"}
                headerActions={
                    <Button
                        onClick={openCreateModal}
                        className="justify-self-end w-full lg:w-30 bg-blue-600 text-white"
                        variant="outline"
                        autoFocus={false}
                    >
                        Add New
                        <Plus className="h-4 w-4" />
                    </Button>
                }
            />
            <ModuleForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={editingModule ? handleUpdate : handleCreate}
                initialData={editingModule}
            />
        </>
    );
}
