// src/pages/modules/module/table.tsx

import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module/column";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { Module, CreateModuleRequest } from "@/types/module";
import { encodeBase64 } from "@/utils/base64.utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { moduleApi } from "@/api/moduleApi";
import { ModuleForm } from "./ModuleForm";

export default function ModulesTable() {
    const navigate = useNavigate();
    const [data, setData] = useState<Module[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho Modal Form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);

    // --- HÀM FETCH DATA (QUAN TRỌNG NHẤT) ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const res: any = await moduleApi.getAllModules(0, 100);

            console.log("🔥 API Raw Response:", res);

            // Logic mapping dữ liệu dựa trên ApiResponse và PageResponse của Backend
            // Cấu trúc: { data: { items: [], pagination: {} }, ... }

            if (res.data && Array.isArray(res.data.items)) {
                // Trường hợp chuẩn: res.data là PageResponse, bên trong có items
                setData(res.data.items);
            }
            else if (res.items && Array.isArray(res.items)) {
                // Trường hợp axios interceptor đã bóc lớp ngoài cùng
                setData(res.items);
            }
            else if (Array.isArray(res)) {
                // Trường hợp trả về List trực tiếp
                setData(res);
            }
            else {
                console.warn("⚠️ Không tìm thấy mảng 'items' trong response. Cấu trúc lạ:", res);
                setData([]);
            }

        } catch (err) {
            console.error("Failed to load modules", err);
        } finally {
            setLoading(false);
        }
    };
    // ------------------------------------------

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (formData: Partial<Module>) => {
        try {
            await moduleApi.createModule(formData as CreateModuleRequest);
            setIsFormOpen(false);
            fetchData();
        } catch (error) {
            console.error("Create failed", error);
        }
    };

    const handleUpdate = async (formData: Partial<Module>) => {
        if (!editingModule?.id) return;
        try {
            await moduleApi.updateModule(editingModule.id, formData);
            setIsFormOpen(false);
            fetchData();
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const handleDelete = async (module: Module) => {
        if (!confirm(`Are you sure you want to delete "${module.title}"?`)) return;
        try {
            await moduleApi.deleteModule(module.id);
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const openCreateModal = () => {
        setEditingModule(null);
        setIsFormOpen(true);
    };

    const openEditModal = (module: Module) => {
        setEditingModule(module);
        setIsFormOpen(true);
    };

    const columns = useMemo(
        () =>
            getColumns({
                onView: (module) => {
                    navigate(`/modules/${encodeBase64(module.id)}`);
                },
                onEdit: (module) => openEditModal(module),
                onDelete: (module) => handleDelete(module),
            }),
        [navigate]
    );

    return (
        <>
            <DataTable<Module, unknown>
                columns={columns as ColumnDef<Module, unknown>[]}
                data={data}
                isSearch={true}
                searchPlaceholder="Search module..."
                isLoading={loading}
                headerActions={
                    <Button
                        onClick={openCreateModal}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
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