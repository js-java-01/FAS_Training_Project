import { useState, useRef } from "react";
import { materialApi } from "@/api/materialApi";
import type { MaterialTypeValue } from "@/types/material";
import { MATERIAL_TYPE_OPTIONS } from "@/types/material";
import { toast } from "sonner";
import { FiX, FiUpload } from "react-icons/fi";

interface UploadMaterialFormProps {
  sessionId: string;
  lessonName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UploadMaterialForm({
  sessionId,
  lessonName,
  onSuccess,
  onCancel,
}: UploadMaterialFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "VIDEO" as MaterialTypeValue,
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File size must be less than 500MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Material name is required");
      return;
    }
    if (!formData.file) {
      toast.error("Please select a file");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("sessionId", sessionId);
      data.append("file", formData.file);

      await materialApi.uploadMaterial(data);
      toast.success("Material uploaded successfully");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      {/* Right-side drawer */}
      <div className="bg-white w-full max-w-md shadow-lg flex flex-col h-full animate-in slide-in-from-right">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Upload Material</h2>
            {lessonName && (
              <p className="text-sm text-gray-600 mt-1">Lesson: {lessonName}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Material Name *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Material name"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {MATERIAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              File *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <FiUpload size={24} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Choose File
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.file ? formData.file.name : "No file chosen"}
                  </p>
                </div>
              </div>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: 500MB
            </p>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="border-t p-6 bg-white sticky bottom-0 space-y-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm border rounded-md hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !formData.file || !formData.title.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            <FiUpload size={14} />
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
