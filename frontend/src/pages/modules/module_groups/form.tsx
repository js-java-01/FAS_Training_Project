// src/pages/modules/module_groups/ModuleGroupForm.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { moduleGroupApi } from "@/api/moduleGroupApi";

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
  const [errors, setErrors] = useState<Record<string,string>>({});

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
      setForm({ name: "", description: "", displayOrder: 1, isActive: true });
    }
    setErrors({});
  }, [initial, open]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.displayOrder && form.displayOrder < 0) e.displayOrder = "Order must be >= 0";
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
        saved = await moduleGroupApi.update(form.id, {
          name: form.name,
          description: form.description,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });
      } else {
        saved = await moduleGroupApi.create({
          name: form.name,
          description: form.description,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });
      }
      onSaved?.(saved);
      onClose();
    } catch (err: unknown) {
      console.error("Save error", err);
      const msg = (err as { body?: { message?: string }; message?: string })?.body?.message || (err as { message?: string })?.message || "Error saving";
      setErrors({ form: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={form.id ? "Edit Module Group" : "Add Module Group"} size="md">
      <form onSubmit={handleSave} className="space-y-4">
        {errors.form && <div className="text-sm text-red-600">{errors.form}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm(prev => ({...prev, name: e.target.value}))}
            required
            className="mt-1 block w-full px-3 py-2 border rounded"
          />
          {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
            className="mt-1 block w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Order</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm(prev => ({...prev, displayOrder: Number(e.target.value)}))}
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
            {errors.displayOrder && <div className="text-xs text-red-600 mt-1">{errors.displayOrder}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => setForm(prev => ({...prev, isActive: e.target.value === "active"}))}
              className="mt-1 block w-full px-3 py-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {saving ? "Saving..." : form.id ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
