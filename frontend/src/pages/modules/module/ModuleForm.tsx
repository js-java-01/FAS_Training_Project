// src/pages/modules/module/ModuleForm.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Module, ModuleGroup, CreateModuleRequest } from "@/types/module";
import { moduleGroupApi } from "@/api/moduleApi";
import { iconMap } from "@/constants/iconMap";

// Định nghĩa kiểu cho các Key của Icon để TypeScript hiểu
type IconKey = keyof typeof iconMap;

interface ModuleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateModuleRequest | Partial<Module>) => void;
    initialData?: Module | null;
}

// Giá trị mặc định của form
const defaultFormData: Partial<Module> = {
    title: "",
    url: "",
    icon: undefined, // Fix: Dùng undefined thay vì ""
    description: "",
    displayOrder: 0,
    isActive: true,
    moduleGroupId: "",
    requiredPermission: "",
};

export function ModuleForm({ open, onClose, onSubmit, initialData }: ModuleFormProps) {
    const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([]);

    // 1. Khởi tạo state: Nếu có initialData thì dùng luôn, không thì dùng default
    const [formData, setFormData] = useState<Partial<Module>>(() => {
        if (initialData) {
            return {
                ...initialData,
                icon: initialData.icon || undefined // Đảm bảo không bị null/empty string
            };
        }
        return defaultFormData;
    });

    // 2. Load danh sách Module Group khi mở modal
    useEffect(() => {
        const fetchGroups = async () => {
            if (open) {
                try {
                    const data = await moduleGroupApi.getAllModuleGroupsList();
                    setModuleGroups(data);
                } catch (error) {
                    console.error("Failed to fetch module groups", error);
                }
            }
        };
        fetchGroups();
    }, [open]);

    // 3. Reset hoặc cập nhật Form Data khi initialData thay đổi hoặc khi mở lại Modal
    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    icon: initialData.icon || undefined
                });
            } else {
                setFormData(defaultFormData);
            }
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData) {
             onSubmit(formData);
        } else {
            // Create mode: Sanitize payload to strictly match CreateModuleRequest
            const payload: CreateModuleRequest = {
                title: formData.title || "",
                moduleGroupId: formData.moduleGroupId || "",
                displayOrder: formData.displayOrder || 0,
                // Optional fields: undefined/null to omit them or handle backend requirements
                ...(formData.url && { url: formData.url }),
                ...(formData.icon && { icon: formData.icon }),
                ...(formData.description && { description: formData.description }),
                ...(formData.requiredPermission && { requiredPermission: formData.requiredPermission }),
                ...(formData.parentId && { parentId: formData.parentId }),
            };

            // Note: 'isActive' is excluded as it is not in the CreateModuleRequest interface
            // and likely causing 400 Bad Request due to unknown property validation on backend.

            onSubmit(payload);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Module" : "Add New Module"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Title */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right text-muted-foreground">Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>

                    {/* Module Group Select */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="moduleGroupId" className="text-right text-muted-foreground">Group <span className="text-red-500">*</span></Label>
                        <select
                            id="moduleGroupId"
                            value={formData.moduleGroupId || ""}
                            onChange={(e) => setFormData({ ...formData, moduleGroupId: e.target.value })}
                            className="col-span-3 flex h-9 w-full rounded-md border border-border bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            required
                        >
                            <option value="" disabled>Select Module Group</option>
                            {moduleGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* URL */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right text-muted-foreground">URL <span className="text-red-500">*</span></Label>
                        <Input
                            id="url"
                            value={formData.url || ""}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>

                    {/* Icon */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right text-muted-foreground">Icon</Label>
                        <select
                            id="icon"
                            // Value của select HTML phải là string, nếu undefined thì mapping về ""
                            value={formData.icon || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                    ...formData,
                                    // Fix: Nếu chọn default "" thì set về undefined, ngược lại ép kiểu
                                    icon: val === "" ? undefined : (val as IconKey),
                                });
                            }}
                            className="col-span-3 flex h-9 w-full rounded-md border border-border bg-background text-foreground px-3 py-1 text-sm shadow-sm"
                        >
                            <option value="">No Icon</option>
                            {Object.keys(iconMap).map((key) => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right text-muted-foreground">Description</Label>
                        <Input
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                        />
                    </div>

                    {/* Permission */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="permission" className="text-right text-muted-foreground">Permission</Label>
                        <Input
                            id="permission"
                            value={formData.requiredPermission || ""}
                            onChange={(e) => setFormData({ ...formData, requiredPermission: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. MODULE_READ"
                        />
                    </div>

                    {/* Order */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="displayOrder" className="text-right text-muted-foreground">Order</Label>
                        <Input
                            id="displayOrder"
                            type="number"
                            value={formData.displayOrder}
                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                            className="col-span-3"
                        />
                    </div>

                    {/* Active */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isActive" className="text-right text-muted-foreground">Active</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                            />
                            <label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer text-foreground">
                                Enable
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}