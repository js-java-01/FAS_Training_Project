import React, { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { moduleGroupApi } from "@/api/moduleApi";

// Zod Schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .nonempty({ message: "Name is required" }),
  description: z.string().optional(),
  displayOrder: z.coerce.number().min(0, { message: "Order must be >= 0" }),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export type ModuleGroupDto = {
  id?: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
};

export const ModuleGroupForm: React.FC<{
  open: boolean;
  onClose: () => void;
  initial?: ModuleGroupDto | null;
  onSaved?: (saved: ModuleGroupDto) => void;
}> = ({ open, onClose, initial = null, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Setup React Hook Form với Zod Resolver
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      displayOrder: 1,
      isActive: true,
    },
  });

  // Reset form khi mở modal hoặc thay đổi dữ liệu initial (Edit mode)
  useEffect(() => {
    if (open) {
      setServerError(null);
      if (initial) {
        reset({
          name: initial.name || "",
          description: initial.description || "",
          displayOrder: initial.displayOrder ?? 1,
          isActive: initial.isActive ?? true,
        });
      } else {
        reset({
          name: "",
          description: "",
          displayOrder: 1,
          isActive: true, 
        });
      }
    }
  }, [initial, open, reset]);

  // Submit
  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setServerError(null);

    try {
      let saved;
      if (initial?.id) {
        // Update
        const res = await moduleGroupApi.updateModuleGroup(initial.id, {
          name: data.name,
          description: data.description,
          totalModules: data.displayOrder,
          isActive: data.isActive,
        });
        saved = res; 
      } else {
        // Create
        const res = await moduleGroupApi.createModuleGroup({
          name: data.name,
          description: data.description,
          displayOrder: data.displayOrder,
        });
        saved = res;
      }

      // Mapping 
      const mappedSaved: ModuleGroupDto = {
        id: saved.id,
        name: saved.name,
        description: saved.description,
        displayOrder: saved.totalModules,
        isActive: saved.isActive,
      };

      onSaved?.(mappedSaved);
      onClose();
    } catch (err: unknown) {
      console.error("Save error", err);
      const msg =
        (err as { body?: { message?: string }; message?: string })?.body
          ?.message ||
        (err as { message?: string })?.message ||
        "Error saving data";
      setServerError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {initial?.id ? "Edit Module Group" : "Add Module Group"}
            </DialogTitle>
            <DialogDescription>
              {initial?.id
                ? "Make changes to your module group here."
                : "Fill in the details to create a new module group."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {serverError}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                {...register("name")} 
                className={`w-full px-3 py-2 border rounded-md outline-none transition
                  ${errors.name 
                    ? "border-red-500 focus:ring-red-200" 
                    : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                placeholder="Enter module group name"
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border rounded-md outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition resize-none"
                placeholder="Short description..."
              />
            </div>

            {/* Order + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className={initial?.id ? "col-span-1 space-y-1" : "col-span-2 space-y-1"}>
                <label className="text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  {...register("displayOrder")}
                  className={`w-full px-3 py-2 border rounded-md outline-none transition
                    ${errors.displayOrder 
                      ? "border-red-500 focus:ring-red-200" 
                      : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {errors.displayOrder && (
                  <p className="text-xs text-red-600">
                    {errors.displayOrder.message}
                  </p>
                )}
              </div>

              {/* Chỉ hiện Status khi Edit */}
              {initial?.id && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition bg-white"
                    defaultValue={initial.isActive ? "active" : "inactive"}
                    onChange={(e) => {
                      // Cập nhật giá trị boolean vào form
                      setValue("isActive", e.target.value === "active");
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : initial?.id ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};