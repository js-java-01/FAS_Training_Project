import { useState } from "react";
import type { SessionResponse } from "@/types/session";
import type { Material } from "@/types/material";
import { FiBook } from "react-icons/fi";
import MaterialList from "./MaterialList";
import MaterialPreview from "./MaterialPreview";
import UploadMaterialForm from "./UploadMaterialForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  useGetLessonsByCourse,
  useGetSessionsByLesson,
  useGetMaterialsBySession,
} from "../../services/material";

interface MaterialTabProps {
  courseId: string;
}

export function MaterialTab({ courseId }: MaterialTabProps) {
  // UI state
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMaterial, setFormMaterial] = useState<Material | null>(null); // null = create, Material = edit
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);

  // React Query hooks
  const { data: lessons = [], isLoading: lessonsLoading } = useGetLessonsByCourse(courseId);
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsByLesson(expandedLesson);
  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsBySession(selectedSession?.id ?? null);

  const handleSessionSelect = (session: SessionResponse) => {
    setSelectedSession(session);
    setSelectedMaterial(null);
  };

  const handleMaterialDeleted = () => {
    setSelectedMaterial(null);
  };

  const handleUploadSuccess = () => {
    setShowForm(false);
    setFormMaterial(null);
    setUploadSessionId(null);
  };

  if (lessonsLoading) {
    return <div className="text-gray-500 p-6">Loading materials...</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-6 h-full">
      {/* Left: Lesson/Session Navigator (1 column) */}
      <div className="col-span-1 border rounded-lg p-4 overflow-y-auto max-h-[70vh]">
        <h3 className="font-semibold text-sm mb-4">Lessons & Sessions</h3>
        {lessons.length === 0 ? (
          <p className="text-sm text-gray-400">No lessons found</p>
        ) : (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            value={expandedLesson || ""}
            onValueChange={(value) => setExpandedLesson(value || null)}
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
                    <p className="text-xs text-gray-400 px-2">Loading sessions...</p>
                  ) : expandedLesson === lesson.id && sessions.length === 0 ? (
                    <p className="text-xs text-gray-400 px-2">No sessions</p>
                  ) : (
                    <div className="space-y-1">
                      {(expandedLesson === lesson.id ? sessions : []).map((session) => (
                        <div
                          key={session.id}
                          onClick={() => handleSessionSelect(session)}
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
                          <p className="text-gray-500 text-xs mt-1">
                            {selectedSession?.id === session.id ? materials.length : 0} material(s)
                          </p>
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

      {/* Right: Materials List + Preview (3 columns) */}
      <div className="col-span-3 space-y-4">
        {/* Content Area */}
        {selectedSession ? (
          <div className="grid grid-cols-2 gap-4 h-[calc(70vh)]">
            {/* Materials List */}
            <div className="border rounded-lg p-4 overflow-y-auto">
              <MaterialList
                materials={materials}
                loading={materialsLoading}
                onSelect={setSelectedMaterial}
                selectedId={selectedMaterial?.id}
                sessionId={selectedSession.id}
                onDeleted={handleMaterialDeleted}
                onUpload={() => {
                  setFormMaterial(null);
                  setUploadSessionId(selectedSession.id);
                  setShowForm(true);
                }}
              />
            </div>

            {/* Material Preview */}
            <div className="border rounded-lg p-4 overflow-y-auto">
              {selectedMaterial ? (
                <MaterialPreview
                  material={selectedMaterial}
                  sessionId={selectedSession.id}
                  onEdit={() => {
                    setFormMaterial(selectedMaterial);
                    setUploadSessionId(selectedSession.id);
                    setShowForm(true);
                  }}
                  onDelete={handleMaterialDeleted}
                />
              ) : (
                <div className="text-center text-gray-400 py-10">
                  <p className="text-sm">Select a material to preview</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center text-gray-400">
            <p className="text-sm">Select a session to view materials</p>
          </div>
        )}

        {/* Unified Material Form Drawer */}
        {showForm && uploadSessionId && (
          <UploadMaterialForm
            sessionId={uploadSessionId}
            material={formMaterial}
            onSuccess={handleUploadSuccess}
            onCancel={() => {
              setShowForm(false);
              setFormMaterial(null);
              setUploadSessionId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
