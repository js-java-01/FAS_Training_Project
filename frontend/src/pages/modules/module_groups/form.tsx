import React, { useEffect, useMemo, useState } from "react";
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

type FormValues = {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
};

// Zod Schema
const createSchema = (maxOrder: number) =>
  z.object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .nonempty({ message: "Name is required" }),
    description: z.string().nonempty({ message: "Description is required" }),
    displayOrder: z.coerce
      .number()
      .min(1, { message: "Order must be at least 1" })
      .max(maxOrder, { message: `Order cannot be greater than ${maxOrder}` })
      .default(1),
    isActive: z.boolean().default(true),
  });

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
  totalRecords: number;
}> = ({ open, onClose, initial = null, onSaved, totalRecords }) => {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /* ================= CALCULATE MAX ORDER ================= */
  const maxAllowedOrder = initial ? totalRecords : totalRecords + 1;

  // Tạo schema mới mỗi khi maxAllowedOrder thay đổi
  const formSchema = useMemo(
    () => createSchema(maxAllowedOrder),
    [maxAllowedOrder]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      displayOrder: maxAllowedOrder,
      isActive: true,
    },
  });

  // Reset form khi mở modal hoặc thay đổi dữ liệu initial
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
          displayOrder: maxAllowedOrder,
          isActive: true,
        });
      }
    }
  }, [initial, open, reset, maxAllowedOrder]);

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
          displayOrder: data.displayOrder,
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
        displayOrder: saved.displayOrder,
        isActive: saved.isActive,
      };

      onSaved?.(mappedSaved);
      onClose();
    } catch (err: unknown) {
      console.error("Save error", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
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
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
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
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md outline-none transition resize-none
                  ${errors.description
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                placeholder="Short description..."
              />
              {errors.description && (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Order + Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("displayOrder")}
                  className={`w-full px-3 py-2 border rounded-md outline-none transition
                    ${errors.displayOrder
                      ? "border-red-500 focus:ring-red-200"
                      : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  placeholder={`Max: ${maxAllowedOrder}`}
                />
                {errors.displayOrder && (
                  <p className="text-xs text-red-600">
                    {errors.displayOrder.message}
                  </p>
                )}
                {!errors.displayOrder && (
                  <p className="text-[10px] text-gray-400 text-right">
                    Max allowed: {maxAllowedOrder}
                  </p>
                )}
              </div>

              {/* Status (Chỉ hiện khi Edit) */}
              {initial?.id && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    defaultValue={initial.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setValue("isActive", e.target.value === "active")
                    }
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