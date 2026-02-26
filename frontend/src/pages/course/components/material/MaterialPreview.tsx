import type { Material } from "@/types/material";
import { FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import { materialApi } from "@/api/materialApi";
import { toast } from "sonner";

interface MaterialPreviewProps {
  material: Material;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MaterialPreview({
  material,
  onEdit,
  onDelete,
}: MaterialPreviewProps) {
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    try {
      await materialApi.deleteMaterial(material.id);
      onDelete?.();
      toast.success("Material deleted");
    } catch {
      toast.error("Failed to delete material");
    }
  };

  const renderPreview = () => {
    switch (material.type) {
      case "VIDEO":
        return (
          <div className="w-full bg-black rounded-lg overflow-hidden mb-4">
            <video
              controls
              className="w-full aspect-video"
              src={material.sourceUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "IMAGE":
        return (
          <div className="w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
            <img
              src={material.sourceUrl}
              alt={material.title}
              className="w-full h-auto object-cover"
            />
          </div>
        );
      case "AUDIO":
        return (
          <div className="w-full mb-4">
            <audio
              controls
              className="w-full"
              src={material.sourceUrl}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case "LINK":
        return (
          <div className="w-full p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">External Link</p>
            <a
              href={material.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
            >
              {material.sourceUrl}
              <FiExternalLink size={14} />
            </a>
          </div>
        );
      case "DOCUMENT":
        return (
          <div className="w-full p-4 mb-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Document Link</p>
            <a
              href={material.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
            >
              {material.sourceUrl}
              <FiExternalLink size={14} />
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Area */}
      {renderPreview()}

      {/* Material Details */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Title</label>
          <p className="font-semibold text-sm">{material.title}</p>
        </div>

        {material.description && (
          <div>
            <label className="text-xs text-gray-500">Description</label>
            <p className="text-sm text-gray-700">{material.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 py-2 border-y">
          <div>
            <label className="text-xs text-gray-500">Type</label>
            <p className="text-sm font-medium">{material.type}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <p className={`text-sm font-medium ${material.isActive ? "text-green-600" : "text-red-600"}`}>
              {material.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {material.tags && (
          <div>
            <label className="text-xs text-gray-500">Tags</label>
            <p className="text-sm">{material.tags}</p>
          </div>
        )}

        {material.createdAt && (
          <div className="text-xs text-gray-400">
            Created: {new Date(material.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-blue-50 text-blue-600 transition"
        >
          <FiEdit2 size={14} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-red-50 text-red-600 transition"
        >
          <FiTrash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
