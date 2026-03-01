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
