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
import type { Permission, CreatePermissionRequest } from "@/types/permission";

interface PermissionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePermissionRequest | Partial<Permission>) => void;
  initialData?: Permission | null;
}

const defaultForm: CreatePermissionRequest = {
  name: "",
  description: "",
  resource: "",
  action: "",
};

export function PermissionFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: PermissionFormModalProps) {
  const [formData, setFormData] =
    useState<CreatePermissionRequest>(defaultForm);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description ?? "",
          resource: initialData.resource,
          action: initialData.action,
        });
      } else {
        setFormData(defaultForm);
      }
    }
  }, [open, initialData]);

  const handleChange = (
    field: keyof CreatePermissionRequest,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      name: formData.name.trim().toUpperCase(),
      resource: formData.resource.trim().toUpperCase(),
      action: formData.action.trim().toUpperCase(),
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Permission" : "Add New Permission"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-muted-foreground">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. REPORT_READ"
              className="col-span-3 font-mono"
              required
            />
          </div>

          {/* Resource */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="resource"
              className="text-right text-muted-foreground"
            >
              Resource <span className="text-red-500">*</span>
            </Label>
            <Input
              id="resource"
              value={formData.resource}
              onChange={(e) => handleChange("resource", e.target.value)}
              placeholder="e.g. REPORT"
              className="col-span-3 font-mono"
              required
            />
          </div>

          {/* Action */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="action"
              className="text-right text-muted-foreground"
            >
              Action <span className="text-red-500">*</span>
            </Label>
            <Input
              id="action"
              value={formData.action}
              onChange={(e) => handleChange("action", e.target.value)}
              placeholder="e.g. READ"
              className="col-span-3 font-mono"
              required
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="description"
              className="text-right text-muted-foreground"
            >
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description"
              className="col-span-3"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {initialData ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
