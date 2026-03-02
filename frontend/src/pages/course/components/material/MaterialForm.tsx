import { useForm } from "react-hook-form";
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from "@/types/material";
import { MATERIAL_TYPE_OPTIONS } from "@/types/material";
import { FiX, FiSave } from "react-icons/fi";
import { useCreateMaterial, useUpdateMaterial } from "../../services/material";

interface MaterialFormProps {
  sessionId: string;
  material?: Material | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MaterialForm({
  sessionId,
  material,
  onSuccess,
  onCancel,
}: MaterialFormProps) {
  const isEdit = !!material;
  const { register, handleSubmit, watch } = useForm<any>({
    defaultValues: {
      title: material?.title || "",
      description: material?.description || "",
      type: material?.type || "VIDEO",
      sourceUrl: material?.sourceUrl || "",
      tags: material?.tags || "",
      displayOrder: material?.displayOrder || 0,
      isActive: material?.isActive ?? true,
    },
  });

  const createMutation = useCreateMaterial(sessionId);
  const updateMutation = useUpdateMaterial(sessionId);
  const loading = createMutation.isPending || updateMutation.isPending;
  const materialType = watch("type");

  const getSourcePlaceholder = () => {
    switch (materialType) {
      case "VIDEO":
        return "Enter video URL (mp4, webm, or YouTube URL)";
      case "DOCUMENT":
        return "Enter document URL (PDF, DOC, etc.)";
      case "LINK":
        return "Enter external link URL";
      case "IMAGE":
        return "Enter image URL";
      case "AUDIO":
        return "Enter audio URL (mp3, wav, etc.)";
      default:
        return "Enter source URL";
    }
  };

  const onSubmit = (data: any) => {
    if (isEdit) {
      const updateData: UpdateMaterialRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        sourceUrl: data.sourceUrl,
        tags: data.tags,
        displayOrder: parseInt(data.displayOrder) || 0,
        isActive: data.isActive,
      };
      updateMutation.mutate(
        { id: material!.id, data: updateData },
        { onSuccess: () => onSuccess?.() }
      );
    } else {
      const createData: CreateMaterialRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        sourceUrl: data.sourceUrl,
        tags: data.tags,
        sessionId,
        displayOrder: parseInt(data.displayOrder) || 0,
        isActive: data.isActive,
      };
      createMutation.mutate(createData, { onSuccess: () => onSuccess?.() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Material" : "Add Material"}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Introduction to Java"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description of the material"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Material Type *</label>
            <select
              {...register("type", { required: "Material type is required" })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {MATERIAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium mb-1">Source URL *</label>
            <input
              type="url"
              {...register("sourceUrl", { required: "Source URL is required" })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={getSourcePlaceholder()}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              {...register("tags")}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., java, beginner, video (comma-separated)"
            />
          </div>

          {/* Display Order and Active Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                min="0"
                {...register("displayOrder", { valueAsNumber: true })}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="rounded" />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <FiSave size={14} />
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
