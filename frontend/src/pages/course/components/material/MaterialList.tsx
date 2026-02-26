import type { Material } from "@/types/material";
import { FiFilm, FiFileText, FiLink, FiImage, FiMusic, FiTrash2 } from "react-icons/fi";
import { materialApi } from "@/api/materialApi";
import { toast } from "sonner";

interface MaterialListProps {
  materials: Material[];
  loading?: boolean;
  onSelect: (material: Material) => void;
  selectedId?: string;
  onDeleted?: () => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case "VIDEO":
      return <FiFilm size={16} />;
    case "DOCUMENT":
      return <FiFileText size={16} />;
    case "LINK":
      return <FiLink size={16} />;
    case "IMAGE":
      return <FiImage size={16} />;
    case "AUDIO":
      return <FiMusic size={16} />;
    default:
      return <FiFileText size={16} />;
  }
};

export default function MaterialList({
  materials,
  loading,
  onSelect,
  selectedId,
  onDeleted,
}: MaterialListProps) {
  if (loading) {
    return <p className="text-sm text-gray-400">Loading materials...</p>;
  }

  if (materials.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No materials found</p>;
  }

  const handleDelete = async (e: React.MouseEvent, materialId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    try {
      await materialApi.deleteMaterial(materialId);
      onDeleted?.();
    } catch {
      toast.error("Failed to delete material");
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm mb-3">Materials</h3>
      {materials.map((material) => (
        <div
          key={material.id}
          onClick={() => onSelect(material)}
          className={`p-3 rounded-md border cursor-pointer transition ${
            selectedId === material.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="text-gray-500 mt-0.5 shrink-0">{getIconForType(material.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{material.title}</p>
                <p className="text-xs text-gray-500">{material.type}</p>
                {!material.isActive && (
                  <p className="text-xs text-red-500 font-medium">Inactive</p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(e, material.id)}
              className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition shrink-0"
              title="Delete material"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
