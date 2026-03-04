import type { Material } from "@/types/material";
import { FiExternalLink } from "react-icons/fi";

interface StudentMaterialPreviewProps {
  material: Material;
}

export default function StudentMaterialPreview({
  material,
}: StudentMaterialPreviewProps) {
  const renderPreview = () => {
    const isYouTubeUrl = (url: string) => {
      return /(?:youtube\.com|youtu\.be)/.test(url);
    };

    const getYouTubeEmbedUrl = (url: string) => {
      let videoId = '';
      
      if (url.includes('youtube.com')) {
        videoId = new URL(url).searchParams.get('v') || '';
      } else if (url.includes('youtu.be')) {
        videoId = url.split('/').pop()?.split('?')[0] || '';
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    switch (material.type) {
      case "VIDEO":
        // Check if it's a YouTube URL
        if (isYouTubeUrl(material.sourceUrl)) {
          const embedUrl = getYouTubeEmbedUrl(material.sourceUrl);
          if (embedUrl) {
            return (
              <div className="w-full bg-black rounded-lg overflow-hidden mb-4">
                <iframe
                  width="100%"
                  height="400"
                  src={embedUrl}
                  title={material.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video"
                />
              </div>
            );
          }
        }
        
        // Otherwise, render as local video file
        return (
          <div className="w-full bg-black rounded-lg overflow-hidden mb-4">
            <video
              controls
              className="w-full aspect-video"
              src={material.sourceUrl}
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
      case "DOCUMENT": {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const backendBase = apiBase.replace(/\/api$/, "");
        const resolvedUrl = material.sourceUrl.startsWith("/")
          ? backendBase + material.sourceUrl
          : material.sourceUrl;
        const isUploaded = material.sourceUrl.startsWith("/api/files/materials/") ||
          material.sourceUrl.startsWith("/files/materials/") ||
          material.sourceUrl.startsWith("/uploads/");
        const ext = resolvedUrl.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

        if (isUploaded) {
          const extIconMap: Record<string, string> = {
            pdf: "📄",
            docx: "📝", doc: "📝",
            xlsx: "📊", xls: "📊",
            pptx: "📋", ppt: "📋",
          };
          const icon = extIconMap[ext] ?? "📄";
          const displayName = decodeURIComponent(material.sourceUrl.split("/").pop() ?? material.sourceUrl);
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

        // External URL → show link
        return (
          <div className="w-full p-4 mb-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Document Link</p>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1"
            >
              {material.sourceUrl}
              <FiExternalLink size={14} />
            </a>
          </div>
        );
      }
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
    </div>
  );
}
