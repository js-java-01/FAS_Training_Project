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
import type { MenuItem, Menu } from "@/types/menu";
import { menuApi } from "@/api/menuApi";
import { iconMap } from "@/constants/iconMap";

interface ModuleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<MenuItem>) => void;
    initialData?: MenuItem | null;
}

export function ModuleForm({ open, onClose, onSubmit, initialData }: ModuleFormProps) {
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        title: "",
        url: "",
        icon: undefined,
        description: "",
        displayOrder: 0,
        isActive: true,
        menuId: "",
        requiredPermission: "",
    });
    const [menus, setMenus] = useState<Menu[]>([]);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const data = await menuApi.getAllMenusList();
                setMenus(data);
            } catch (error) {
                console.error("Failed to fetch menus", error);
            }
        };
        fetchMenus();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        } else {
            setFormData({
                title: "",
                url: "",
                icon: undefined,
                description: "",
                displayOrder: 0,
                isActive: true,
                menuId: "",
                requiredPermission: "",
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Module" : "Add New Module"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="menuId" className="text-right">
                            Module Group
                        </Label>
                        <select
                            id="menuId"
                            value={formData.menuId || ""}
                            onChange={(e) => setFormData({ ...formData, menuId: e.target.value })}
                            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            required
                        >
                            <option value="" disabled>Select a group</option>
                            {menus.map((menu) => (
                                <option key={menu.id} value={menu.id}>
                                    {menu.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                            URL
                        </Label>
                        <Input
                            id="url"
                            value={formData.url || ""}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                            Icon
                        </Label>
                        <select
                            id="icon"
                            value={formData.icon || ""}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value as IconKey })}
                          className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                             <option value="">No Icon</option>
                            {Object.keys(iconMap).map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                           Description
                        </Label>
                        <Input
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="permission" className="text-right">
                           Permission
                        </Label>
                        <Input
                            id="permission"
                            value={formData.requiredPermission || ""}
                            onChange={(e) => setFormData({ ...formData, requiredPermission: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="displayOrder" className="text-right">
                           Order
                        </Label>
                        <Input
                            id="displayOrder"
                            type="number"
                            value={formData.displayOrder || 0}
                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="isActive" className="text-right">
                           Active
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                             <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
                             />
                             <label
                                htmlFor="isActive"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Enable this module
                              </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
