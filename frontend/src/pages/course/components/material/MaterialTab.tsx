import { useState } from "react";
import type { SessionResponse } from "@/types/session";
import type { Material } from "@/types/material";
import {
  FiBook,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiFilm,
  FiFileText,
  FiImage,
  FiMusic,
  FiLink,
  FiLayers,
} from "react-icons/fi";
import UploadMaterialForm from "./UploadMaterialForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useGetLessonsByCourse,
  useGetSessionsByLesson,
  useGetMaterialsBySession,
  useDeleteMaterial,
} from "../../services/material";

interface MaterialTabProps {
  courseId: string;
}

// ─── Inline material card (student-style preview + edit/delete actions) ───────
function MaterialCard({
  material,
  sessionId,
  onEdit,
  onDeleted,
}: {
  material: Material;
  sessionId: string;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const deleteMutation = useDeleteMaterial(sessionId);

  const handleDelete = () => {
    if (!window.confirm(`Delete "${material.title}"?`)) return;
    deleteMutation.mutate(material.id, { onSuccess: onDeleted });
  };

  const resolveUrl = (url: string) => {
    if (url.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
      return apiBase.replace(/\/api$/, "") + url;
    }
    return url;
  };

  const getYouTubeEmbed = (url: string): string | null => {
    try {
      if (url.includes("youtube.com/watch"))
        return `https://www.youtube.com/embed/${new URL(url).searchParams.get("v")}`;
      if (url.includes("youtu.be/"))
        return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]?.split(/[?#]/)[0]}`;
      if (url.includes("youtube.com/shorts/"))
        return `https://www.youtube.com/embed/${url.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0]}`;
      if (url.includes("youtube.com/embed/")) return url;
    } catch { /* ignore */ }
    return null;
  };

  const resolved = resolveUrl(material.sourceUrl);
  const ytEmbed = getYouTubeEmbed(resolved);

  const typeIconMap: Record<string, React.ReactNode> = {
    VIDEO: <FiFilm size={14} />,
    IMAGE: <FiImage size={14} />,
    AUDIO: <FiMusic size={14} />,
    DOCUMENT: <FiFileText size={14} />,
    LINK: <FiLink size={14} />,
  };

  const renderPreview = () => {
    if (ytEmbed) {
      return (
        <div className="w-full bg-black rounded-lg overflow-hidden mb-3">
          <iframe
            width="100%"
            src={ytEmbed}
            title={material.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      );
    }
    switch (material.type) {
      case "VIDEO":
        return (
          <div className="w-full bg-black rounded-lg overflow-hidden mb-3">
            <video controls className="w-full aspect-video" src={resolved} controlsList="nodownload">
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "IMAGE":
        return (
          <div className="w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
            <img src={resolved} alt={material.title} className="w-full h-auto object-cover max-h-80" />
          </div>
        );
      case "AUDIO":
        return (
          <div className="w-full mb-3">
            <audio controls className="w-full" src={resolved}>
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case "DOCUMENT": {
        const ext = resolved.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
        const extIconMap: Record<string, string> = {
          pdf: "📄",
          docx: "📝", doc: "📝",
          xlsx: "📊", xls: "📊",
          pptx: "📋", ppt: "📋",
        };
        const icon = extIconMap[ext] ?? "📄";
        const displayName = decodeURIComponent(material.sourceUrl.split("/").pop() ?? material.sourceUrl);
        const isUploaded =
          material.sourceUrl.startsWith("/api/files/materials/") ||
          material.sourceUrl.startsWith("/files/materials/") ||
          material.sourceUrl.startsWith("/uploads/");

        if (isUploaded) {
          return (
            <div className="w-full mb-3 rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-4">
              <span className="text-4xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 uppercase mt-0.5">{ext} file</p>
              </div>
              <a
                href={resolved}
                download
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiExternalLink size={12} /> Download File
              </a>
            </div>
          );
        }
        return (
          <div className="w-full p-3 mb-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Document Link</p>
            <a
              href={resolved}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1 text-sm"
            >
              {material.sourceUrl} <FiExternalLink size={13} />
            </a>
          </div>
        );
      }
      case "LINK":
        return (
          <div className="w-full p-3 mb-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-500 mb-1">External Link</p>
            <a
              href={resolved}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-1 text-sm"
            >
              {material.sourceUrl} <FiExternalLink size={13} />
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header: title + type badge + action buttons */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-400 shrink-0">{typeIconMap[material.type]}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{material.title}</p>
            <span className="text-xs text-gray-400">{material.type}</span>
            {!material.isActive && (
              <span className="ml-2 text-xs text-red-500 font-medium">Inactive</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Edit material"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Delete material"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Student-style preview */}
      {renderPreview()}

      {material.description && (
        <p className="text-xs text-gray-500 mt-1">{material.description}</p>
      )}
      {material.tags && (
        <p className="text-xs text-gray-400 mt-1">Tags: {material.tags}</p>
      )}
    </div>
  );
}

// ─── Main MaterialTab ─────────────────────────────────────────────────────────
export function MaterialTab({ courseId }: MaterialTabProps) {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMaterial, setFormMaterial] = useState<Material | null>(null);

  const { data: lessons = [], isLoading: lessonsLoading } = useGetLessonsByCourse(courseId);
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsByLesson(expandedLesson);
  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsBySession(
    selectedSession?.id ?? null
  );

  const handleUploadSuccess = () => {
    setShowForm(false);
    setFormMaterial(null);
  };

  if (lessonsLoading) {
    return <div className="text-gray-500 p-6">Loading materials...</div>;
  }

  return (
    <div className="flex gap-4 h-[75vh]">
      {/* ── Left 3/10: Lessons & Sessions navigator ─────────────────────── */}
      <div className="w-[30%] border rounded-lg p-4 flex flex-col overflow-hidden">
        <h3 className="font-semibold text-sm mb-3 shrink-0">Lessons &amp; Sessions</h3>
        <div className="flex-1 overflow-y-auto">
          {lessons.length === 0 ? (
            <p className="text-sm text-gray-400">No lessons found</p>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={expandedLesson || ""}
              onValueChange={(v) => setExpandedLesson(v || null)}
            >
              {lessons.map((lesson) => (
                <AccordionItem key={lesson.id} value={lesson.id}>
                  <AccordionTrigger className="text-sm hover:bg-gray-50 px-2 py-1 rounded">
                    <div className="flex items-center gap-2 text-left flex-1">
                      <FiBook size={14} />
                      <span className="truncate text-sm">{lesson.lessonName}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    {expandedLesson === lesson.id && sessionsLoading ? (
                      <p className="text-xs text-gray-400 px-2">Loading sessions…</p>
                    ) : expandedLesson === lesson.id && sessions.length === 0 ? (
                      <p className="text-xs text-gray-400 px-2">No sessions</p>
                    ) : (
                      <div className="space-y-1">
                        {(expandedLesson === lesson.id ? sessions : []).map((session) => (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className={`text-xs p-2.5 rounded cursor-pointer transition border ${
                              selectedSession?.id === session.id
                                ? "bg-blue-100 border-blue-400"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <p className="font-medium truncate">{session.topic}</p>
                            {session.type && (
                              <span className="inline-block mt-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                                {session.type.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      {/* ── Right 7/10: Session Materials ───────────────────────────────── */}
      <div className="w-[70%] border rounded-lg p-4 flex flex-col overflow-hidden">
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <FiLayers size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Select a session on the left to view its materials.</p>
          </div>
        ) : (
          <>
            {/* Session header */}
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Session</p>
                <h3 className="font-semibold text-gray-800">{selectedSession.topic}</h3>
                {selectedSession.type && (
                  <span className="inline-block mt-0.5 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {selectedSession.type.replace("_", " ")}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setFormMaterial(null); setShowForm(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shrink-0"
              >
                <FiPlus size={15} /> Add Material
              </button>
            </div>

            {/* Upload / Edit Form — Sheet portal, renders outside layout */}
            {showForm && (
              <UploadMaterialForm
                sessionId={selectedSession.id}
                material={formMaterial}
                onSuccess={handleUploadSuccess}
                onCancel={() => { setShowForm(false); setFormMaterial(null); }}
              />
            )}

            {/* Materials list */}
            <div className="flex-1 overflow-y-auto">
              {materialsLoading ? (
                <p className="text-sm text-gray-400 text-center py-6">Loading materials…</p>
              ) : materials.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
                  <FiLayers size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No materials yet. Click <strong>Add Material</strong> to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pr-1">
                  {materials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      sessionId={selectedSession.id}
                      onEdit={() => { setFormMaterial(material); setShowForm(true); }}
                      onDeleted={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
