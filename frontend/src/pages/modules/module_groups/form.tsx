import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { moduleGroupApi } from "@/api/moduleApi";
import { motion } from "framer-motion";
import { easeOut } from "framer-motion";

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
  const [form, setForm] = useState<ModuleGroupDto>({
    name: "",
    description: "",
    displayOrder: 1,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name || "",
        description: initial.description || "",
        displayOrder: initial.displayOrder ?? 1,
        isActive: initial.isActive ?? true,
      });
    } else {
      setForm({
        name: "",
        description: "",
        displayOrder: 1,
        isActive: true,
      });
    }
    setErrors({});
  }, [initial, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (form.displayOrder !== undefined && form.displayOrder < 0)
      e.displayOrder = "Order must be >= 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let saved;

      if (form.id) {
        const res = await moduleGroupApi.updateModuleGroup(form.id, {
          name: form.name,
          description: form.description,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });

        saved = {
          id: res.id,
          name: res.name,
          description: res.description,
          displayOrder: res.displayOrder,
          isActive: res.isActive,
        };
      } else {
        const res = await moduleGroupApi.createModuleGroup({
          name: form.name,
          description: form.description,
          displayOrder: form.displayOrder,
        });

        saved = {
          id: res.id,
          name: res.name,
          description: res.description,
          displayOrder: res.displayOrder,
          isActive: res.isActive,
        };
      }

      onSaved?.(saved);
      onClose();
    } catch (err: unknown) {
      console.error("Save error", err);
      const msg =
        (err as { body?: { message?: string }; message?: string })?.body
          ?.message ||
        (err as { message?: string })?.message ||
        "Error saving";
      setErrors({ form: msg });
    } finally {
      setSaving(false);
    }
  };

  // animation form
  const contentVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: easeOut },
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form.id ? "Edit Module Group" : "Add Module Group"}
      size="md"
    >
      <motion.form
        onSubmit={handleSave}
        className="space-y-6"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentVariants}
      >
        {errors.form && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {errors.form}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition"
            placeholder="Enter module group name"
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition resize-none"
            placeholder="Short description..."
          />
        </div>

        {/* Order + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Order</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  displayOrder: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
            />
            {errors.displayOrder && (
              <p className="text-xs text-red-600">{errors.displayOrder}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  isActive: e.target.value === "active",
                }))
              }
              className="w-full px-3 py-2 border rounded-md outline-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border bg-white
                       hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-md text-white font-medium
                       bg-blue-600 hover:bg-blue-700
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition active:scale-95"
          >
            {saving ? "Saving..." : form.id ? "Save changes" : "Create"}
          </button>
        </div>
      </motion.form>
    </Modal>
  );
};
