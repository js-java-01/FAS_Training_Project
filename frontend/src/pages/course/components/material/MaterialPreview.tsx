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
      case "DOCUMENT": {
        // Detect whether this is an uploaded file (served by backend) vs external URL
        const isUploaded = sourceUrl.startsWith("/api/files/materials/") ||
          sourceUrl.startsWith("/files/materials/") ||
          sourceUrl.startsWith("/uploads/");
        const ext = resolvedUrl.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

        if (isUploaded) {
          if (ext === "pdf") {
            // PDF → inline iframe (trình duyệt render trực tiếp)
            return (
              <div className="w-full mb-4 rounded-lg overflow-hidden border border-gray-200" style={{ height: "520px" }}>
                <iframe
                  src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={material.title}
                  className="w-full h-full"
                  frameBorder="0"
                />
              </div>
            );
          }
          // DOCX / XLSX / DOC → không thể preview inline khi file ở localhost
          // Hiển thị card file + nút mở
          const extIconMap: Record<string, string> = {
            docx: "📝", doc: "📝",
            xlsx: "📊", xls: "📊",
            pptx: "📋", ppt: "📋",
          };
          const icon = extIconMap[ext] ?? "📄";
          const displayName = decodeURIComponent(sourceUrl.split("/").pop() ?? sourceUrl);
          return (
            <div className="w-full mb-4 rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center gap-4">
              <span className="text-4xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 uppercase mt-0.5">{ext} file</p>
              </div>
              <a
                href={resolvedUrl}
                download
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiExternalLink size={13} /> Download File
              </a>
            </div>
          );
        }

        // URL-based document → show external link (downloadable)
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
      }
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
