import type { Material } from "@/types/material";
import { FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import { useDeleteMaterial } from "../../services/material";

interface MaterialPreviewProps {
  material: Material;
  sessionId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MaterialPreview({
  material,
  sessionId,
  onEdit,
  onDelete,
}: MaterialPreviewProps) {
  const deleteMutation = useDeleteMaterial(sessionId);

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    deleteMutation.mutate(material.id, {
      onSuccess: () => onDelete?.(),
    });
  };

  // Resolve relative backend paths (e.g. /api/files/materials/xxx) to full URL
  const resolveUrl = (url: string): string => {
    if (url.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
      const backendBase = apiBase.replace(/\/api$/, "");
      return backendBase + url;
    }
    return url;
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      // Handle youtube.com/watch?v=ID
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      // Handle youtu.be/ID
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      // Handle youtube.com/shorts/ID
      if (url.includes("youtube.com/shorts/")) {
        const videoId = url.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      // Already an embed URL
      if (url.includes("youtube.com/embed/")) {
        return url;
      }
    } catch {
      // invalid URL
    }
    return null;
  };

  const renderYouTubeEmbed = (url: string) => {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (!embedUrl) return null;
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden mb-4">
        <iframe
          width="100%"
          src={embedUrl}
          title={material.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full aspect-video"
        />
      </div>
    );
  };

  const renderPreview = () => {
    const { sourceUrl, type } = material;
    const resolvedUrl = resolveUrl(sourceUrl);

    // Detect YouTube from any type
    const youtubeEmbed = renderYouTubeEmbed(resolvedUrl);
    if (youtubeEmbed) return youtubeEmbed;

    switch (type) {
      case "VIDEO":
        return (
          <div className="w-full bg-black rounded-lg overflow-hidden mb-4">
            <video
              controls
              className="w-full aspect-video"
              src={resolvedUrl}
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "IMAGE":
        return (
          <div className="w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
            <img
              src={resolvedUrl}
              alt={material.title}
              className="w-full h-auto object-cover"
            />
          </div>
        );
      case "AUDIO":
        return (
          <div className="w-full mb-4">
            <audio controls className="w-full" src={resolvedUrl}>
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case "DOCUMENT":
        // Try to render PDF inline, fallback to link
        if (resolvedUrl.toLowerCase().endsWith(".pdf") || resolvedUrl.includes("/pdf")) {
          return (
            <div className="w-full mb-4 rounded-lg overflow-hidden border border-gray-200" style={{ height: "500px" }}>
              <iframe
                src={resolvedUrl}
                title={material.title}
                className="w-full h-full"
                frameBorder="0"
              />
            </div>
          );
        }
        return (
          <div className="w-full p-4 mb-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Document</p>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
            >
              {sourceUrl}
              <FiExternalLink size={14} />
            </a>
          </div>
        );
      case "LINK":
        return (
          <div className="w-full p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">External Link</p>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
            >
              {sourceUrl}
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
