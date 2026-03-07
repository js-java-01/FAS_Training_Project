import { useState, useRef } from "react";
import type { Material, MaterialTypeValue } from "@/types/material";
import { MATERIAL_TYPE_OPTIONS } from "@/types/material";
import { toast } from "sonner";
import { FiUpload, FiLink } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUploadMaterial, useCreateMaterial, useUpdateMaterial } from "../../services/material";

type SourceMode = "file" | "url";

interface UploadMaterialFormProps {
  sessionId: string;
  material?: Material | null;
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
  const [sourceMode, setSourceMode] = useState<SourceMode>(isEdit ? "url" : "file");

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
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadMaterial(sessionId, setUploadProgress);
  const createMutation = useCreateMaterial(sessionId);
  const updateMutation = useUpdateMaterial(sessionId);
  const loading =
    uploadMutation.isPending || createMutation.isPending || updateMutation.isPending;

  const set = (key: keyof typeof fields, value: any) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!fields.title.trim()) {
      set("title", f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = () => {
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

    if (sourceMode === "file") {
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
      setUploadProgress(0);
      uploadMutation.mutate(data, { onSuccess: () => { setUploadProgress(0); onSuccess?.(); } });
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

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onCancel?.(); }}>
      <SheetContent className="p-0 sm:max-w-md flex flex-col" side="right" showCloseButton={false}>
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3 shrink-0">
          <SheetTitle className="text-base font-semibold">
            {isEdit ? "Edit Material" : "Add Material"}
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? "Saving..." : sourceMode === "file" ? "Uploading..." : "Adding..."}
                </span>
              ) : isEdit ? "Save Changes" : "Save"}
            </Button>
          </div>
        </SheetHeader>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-4 grid gap-4">
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

          {/* Source section */}
          <div>
            <label className="block text-sm font-medium mb-2">Source *</label>

            {/* Radio selector — only show in create mode */}
            {!isEdit && (
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    checked={sourceMode === "file"}
                    onChange={() => { setSourceMode("file"); setFile(null); }}
                    className="accent-blue-600"
                  />
                  <FiUpload size={13} className="text-gray-500" />
                  Upload file
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    checked={sourceMode === "url"}
                    onChange={() => { setSourceMode("url"); }}
                    className="accent-blue-600"
                  />
                  <FiLink size={13} className="text-gray-500" />
                  URL / YouTube link
                </label>
              </div>
            )}

            {/* File picker */}
            {!isEdit && sourceMode === "file" && (
              <>
                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="flex flex-col items-center gap-1">
                    <FiUpload size={22} className="text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      {file ? file.name : "Click to choose file"}
                    </p>
                    {file ? (
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    ) : (
                      <p className="text-xs text-gray-400">Max 2 GB</p>
                    )}
                  </div>
                </button>
                {uploadMutation.isPending && uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* URL input */}
            {(isEdit || sourceMode === "url") && (
              <input
                type="text"
                value={fields.sourceUrl}
                onChange={(e) => set("sourceUrl", e.target.value)}
                className={inputCls}
                placeholder={
                  fields.type === "VIDEO"
                    ? "Video URL or YouTube link (https://...)"
                    : fields.type === "DOCUMENT"
                    ? "Document URL (PDF, DOC…)"
                    : "https://"
                }
              />
            )}
          </div>

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
