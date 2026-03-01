import type { Material } from "@/types/material";
import { FiFileText, FiImage, FiMusic, FiLink, FiVideo } from "react-icons/fi";

interface StudentMaterialListProps {
  materials: Material[];
  loading?: boolean;
  onSelect: (material: Material) => void;
  selectedId?: string;
}

export default function StudentMaterialList({
  materials,
  loading,
  onSelect,
  selectedId,
}: StudentMaterialListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <FiVideo className="text-red-500" />;
      case "DOCUMENT":
        return <FiFileText className="text-blue-500" />;
      case "IMAGE":
        return <FiImage className="text-purple-500" />;
      case "AUDIO":
        return <FiMusic className="text-green-500" />;
      case "LINK":
        return <FiLink className="text-orange-500" />;
      default:
        return <FiFileText className="text-gray-500" />;
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading materials...</p>;
  }

  if (materials.length === 0) {
    return <p className="text-sm text-gray-400">No materials available</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-700 mb-3">Materials</h3>
      {materials.map((material) => (
        <div
          key={material.id}
          onClick={() => onSelect(material)}
          className={`p-3 rounded-lg cursor-pointer transition border ${
            selectedId === material.id
              ? "bg-blue-50 border-blue-400"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="mt-1">{getIcon(material.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{material.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{material.type}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
