// src/pages/modules/module/table.tsx

import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module/column";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Module, CreateModuleRequest } from "@/types/module";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { moduleApi } from "@/api/moduleApi";
import { ModuleForm } from "./ModuleForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    FileCode,
    Link as LinkIcon,
    ToggleLeft,
    Layers,
    FileText,
    Fingerprint,
    Hash
} from "lucide-react";
import { iconMap } from "@/constants/iconMap";
import type { ComponentType, SVGProps, ReactNode } from "react";

// --- Component DetailRow ---
const DetailRow = ({
   icon: Icon,
   label,
   value,
   isBadge = false,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value?: ReactNode;
    isBadge?: boolean;
}) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Icon className="w-4 h-4 text-gray-500" /> {label}
        </label>
        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[42px] flex items-center">
            {isBadge ? (
                value ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
                        Active
                    </Badge>
                ) : (
                    <Badge variant="destructive">Inactive</Badge>
                )
            ) : (
                value || <span className="text-gray-400 italic">No data</span>
            )}
        </div>
    </div>
);

export default function ModulesTable() {
    const [data, setData] = useState<Module[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho Modal Form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);

    // View Detail State
    const [viewingModule, setViewingModule] = useState<Module | null>(null);

    // --- HÀM FETCH DATA (QUAN TRỌNG NHẤT) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    }, []);
    // ------------------------------------------

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const handleDelete = useCallback(async (module: Module) => {
        if (!confirm(`Are you sure you want to delete "${module.title}"?`)) return;
        try {
            await moduleApi.deleteModule(module.id);
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
        }
    }, [fetchData]);

    const openCreateModal = () => {
        setEditingModule(null);
        setIsFormOpen(true);
    };

    const openEditModal = useCallback((module: Module) => {
        setEditingModule(module);
        setIsFormOpen(true);
    }, []);

    const columns = useMemo(
        () =>
            getColumns({
                onView: (module) => {
                    setViewingModule(module);
                },
                onEdit: (module) => openEditModal(module),
                onDelete: (module) => handleDelete(module),
            }),
        [openEditModal, handleDelete]
    );

    const IconComponent = viewingModule && viewingModule.icon && (viewingModule.icon in iconMap)
        ? iconMap[viewingModule.icon as keyof typeof iconMap]
        : FileCode;

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

            {/* --- Dialog View Detail --- */}
            <Dialog open={!!viewingModule} onOpenChange={(open) => !open && setViewingModule(null)}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50">
                        <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                             <div className="bg-blue-100 p-2 rounded-lg">
                                <IconComponent className="w-5 h-5 text-blue-600" />
                            </div>
                            Module Details
                        </DialogTitle>
                        <DialogDescription>
                            Information about <strong>{viewingModule?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                        <div className="space-y-5">
                            <DetailRow icon={FileText} label="Module Name" value={viewingModule?.title} />

                            <DetailRow icon={Hash} label="Module ID" value={viewingModule?.id} />

                            <DetailRow icon={FileText} label="Description" value={viewingModule?.description} />

                            <div className="grid grid-cols-2 gap-5">
                                <DetailRow icon={LinkIcon} label="URL / Path" value={viewingModule?.url} />
                                <DetailRow icon={Fingerprint} label="Permission" value={viewingModule?.requiredPermission} />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <DetailRow icon={Layers} label="Display Order" value={viewingModule?.displayOrder} />
                                <DetailRow icon={ToggleLeft} label="Status" value={viewingModule?.isActive} isBadge />
                            </div>
                             <DetailRow icon={Layers} label="Module Group ID" value={viewingModule?.moduleGroupId} />
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t bg-gray-50/50">
                        <Button onClick={() => setViewingModule(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}