import { useState, useRef } from "react";
import type { Material, MaterialTypeValue } from "@/types/material";
import { MATERIAL_TYPE_OPTIONS } from "@/types/material";
import { toast } from "sonner";
import { FiX, FiUpload, FiLink } from "react-icons/fi";
import { useUploadMaterial, useCreateMaterial, useUpdateMaterial } from "../../services/material";

type Mode = "upload" | "url";

interface UploadMaterialFormProps {
  sessionId: string;
  material?: Material | null; // when provided → edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function UploadMaterialForm({
  sessionId,
  material,
  onSuccess,
  onCancel,
}: UploadMaterialFormProps) {
  const isEdit = !!material;
  const [mode, setMode] = useState<Mode>(isEdit ? "url" : "upload");

  const [fields, setFields] = useState({
    title: material?.title ?? "",
    type: (material?.type ?? "VIDEO") as MaterialTypeValue,
    description: material?.description ?? "",
    tags: material?.tags ?? "",
    displayOrder: material?.displayOrder ?? 0,
    isActive: material?.isActive ?? true,
    sourceUrl: material?.sourceUrl ?? "",
  });

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMaterial(sessionId);
  const createMutation = useCreateMaterial(sessionId);
  const updateMutation = useUpdateMaterial(sessionId);
  const loading =
    uploadMutation.isPending || createMutation.isPending || updateMutation.isPending;

  const set = (key: keyof typeof fields, value: any) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) {
      toast.error("File size must be less than 500MB");
      return;
    }
    setFile(f);
    // Auto-fill title from filename if empty
    if (!fields.title.trim()) {
      set("title", f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fields.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (isEdit) {
      updateMutation.mutate(
        {
          id: material!.id,
          data: {
            title: fields.title,
            description: fields.description,
            type: fields.type,
            sourceUrl: fields.sourceUrl,
            tags: fields.tags,
            displayOrder: fields.displayOrder,
            isActive: fields.isActive,
          },
        },
        { onSuccess: () => onSuccess?.() }
      );
      return;
    }

    if (mode === "upload") {
      if (!file) {
        toast.error("Please select a file");
        return;
      }
      const data = new FormData();
      data.append("title", fields.title);
      data.append("type", fields.type);
      data.append("sessionId", sessionId);
      data.append("file", file);
      if (fields.description) data.append("description", fields.description);
      if (fields.tags) data.append("tags", fields.tags);
      data.append("displayOrder", String(fields.displayOrder));
      data.append("isActive", String(fields.isActive));

      uploadMutation.mutate(data, { onSuccess: () => onSuccess?.() });
    } else {
      if (!fields.sourceUrl.trim()) {
        toast.error("Source URL is required");
        return;
      }
      createMutation.mutate(
        {
          title: fields.title,
          description: fields.description,
          type: fields.type,
          sourceUrl: fields.sourceUrl,
          tags: fields.tags,
          sessionId,
          displayOrder: fields.displayOrder,
          isActive: fields.isActive,
        },
        { onSuccess: () => onSuccess?.() }
      );
    }
  };

  const submitLabel = () => {
    if (loading) return isEdit ? "Saving..." : mode === "upload" ? "Uploading..." : "Adding...";
    if (isEdit) return "Save Changes";
    return mode === "upload" ? "Upload" : "Add Material";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md shadow-lg flex flex-col h-full animate-in slide-in-from-right">
        {/* Header */}
        <div className="border-b p-5 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Material" : "Add Material"}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded transition">
            <FiX size={20} />
          </button>
        </div>

        {/* Mode Toggle (create only) */}
        {!isEdit && (
          <div className="px-5 pt-4">
            <div className="flex rounded-lg border overflow-hidden text-sm font-medium">
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 transition ${
                  mode === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiUpload size={14} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setMode("url")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 transition ${
                  mode === "url"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiLink size={14} /> Enter URL
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={fields.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="E.g., Introduction to Java"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              value={fields.type}
              onChange={(e) => set("type", e.target.value as MaterialTypeValue)}
              className={inputCls + " bg-white"}
            >
              {MATERIAL_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* File picker (upload mode) */}
          {!isEdit && mode === "upload" && (
            <div>
              <label className="block text-sm font-medium mb-1">File *</label>
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="flex flex-col items-center gap-1">
                  <FiUpload size={22} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    {file ? file.name : "Choose file"}
                  </p>
                  {file && (
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </button>
              <p className="text-xs text-gray-400 mt-1">Max 500 MB</p>
            </div>
          )}

          {/* Source URL (url mode or edit) */}
          {(isEdit || mode === "url") && (
            <div>
              <label className="block text-sm font-medium mb-1">Source URL *</label>
              <input
                type="text"
                value={fields.sourceUrl}
                onChange={(e) => set("sourceUrl", e.target.value)}
                className={inputCls}
                placeholder={
                  fields.type === "VIDEO"
                    ? "Video URL or YouTube link"
                    : fields.type === "DOCUMENT"
                    ? "Document URL (PDF, DOC…)"
                    : "https://"
                }
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls}
              placeholder="Optional description"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={fields.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={inputCls}
              placeholder="java, beginner (comma-separated)"
            />
          </div>

          {/* Display Order + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                min={0}
                value={fields.displayOrder}
                onChange={(e) => set("displayOrder", parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fields.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer buttons */}
        <div className="border-t p-5 bg-white sticky bottom-0 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {mode === "upload" && !isEdit ? <FiUpload size={14} /> : <FiLink size={14} />}
            {submitLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
