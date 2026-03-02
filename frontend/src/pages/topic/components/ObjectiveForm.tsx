import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiSave, FiTarget, FiFileText, FiCheckCircle } from "react-icons/fi";
import type { TopicObjective } from "@/types/topicObjective";

interface ObjectiveFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: TopicObjective | null;
}

const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function ObjectiveForm({
  open,
  onClose,
  onSubmit,
  loading,
  initialData,
}: ObjectiveFormProps) {
  const { register, handleSubmit, reset } = useForm<any>();

  useEffect(() => {
  if (initialData) {
    reset({
      code: initialData.code,
      name: initialData.name,
      details: initialData.details ?? "",
    });
  }
}, [initialData, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="ml-auto w-[420px] h-full bg-white shadow-xl relative animate-in slide-in-from-right duration-300 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {initialData ? "Edit Objective" : "Add Objective"}
            </h2>
            <p className="text-sm text-gray-500">
              {initialData
                ? "Update objective information"
                : "Create a new learning objective"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <FiTarget /> Objective Code
            </label>
            <input
              {...register("code", { required: true })}
              className={inputCls}
              placeholder="Enter objective code"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <FiCheckCircle /> Objective Name
            </label>
            <input
              {...register("name", { required: true })}
              className={inputCls}
              placeholder="Enter objective name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <FiFileText /> Description
            </label>
            <textarea
              rows={4}
              {...register("details")}
              className={inputCls}
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <FiCheckCircle /> Status
            </label>
            <select
              {...register("status")}
              className={inputCls + " bg-white"}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiSave />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}