import { useState, useEffect } from "react";
import { lessonApi, type Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import { materialApi } from "@/api/materialApi";
import type { SessionResponse } from "@/types/session";
import type { Material } from "@/types/material";
import { toast } from "sonner";
import { FiBook } from "react-icons/fi";
import StudentMaterialList from "./StudentMaterialList";
import StudentMaterialPreview from "./StudentMaterialPreview";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StudentMaterialViewProps {
  courseId: string;
}

export function StudentMaterialView({ courseId }: StudentMaterialViewProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState<Record<string, boolean>>({});
  const [sessionsByLesson, setSessionsByLesson] = useState<Record<string, SessionResponse[]>>({});
  
  const [materialsBySession, setMaterialsBySession] = useState<Record<string, Material[]>>({});
  const [materialsLoading, setMaterialsLoading] = useState<Record<string, boolean>>({});
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load lessons on component mount
  useEffect(() => {
    if (courseId) loadLessons();
  }, [courseId]);

  // Load sessions when lesson is expanded
  useEffect(() => {
    if (expandedLesson && !sessionsByLesson[expandedLesson]?.length && !sessionsLoading[expandedLesson]) {
      loadSessions(expandedLesson);
    }
  }, [expandedLesson]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await lessonApi.getByCourseId(courseId);
      setLessons(data);
    } catch {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (lessonId: string) => {
    setSessionsLoading((p) => ({ ...p, [lessonId]: true }));
    try {
      const list = await sessionService.getSessionsByLesson(lessonId);
      setSessionsByLesson((p) => ({ ...p, [lessonId]: list }));
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setSessionsLoading((p) => ({ ...p, [lessonId]: false }));
    }
  };

  const loadMaterials = async (sessionId: string) => {
    setMaterialsLoading((p) => ({ ...p, [sessionId]: true }));
    try {
      // Use getActiveMaterialsBySession for student view (only show active materials)
      const list = await materialApi.getActiveMaterialsBySession(sessionId);
      setMaterialsBySession((p) => ({ ...p, [sessionId]: list }));
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setMaterialsLoading((p) => ({ ...p, [sessionId]: false }));
    }
  };

  const handleSessionSelect = async (session: SessionResponse) => {
    setSelectedSession(session);
    setSelectedMaterial(null);
    if (!materialsBySession[session.id]?.length && !materialsLoading[session.id]) {
      await loadMaterials(session.id);
    }
  };

  if (loading) {
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
                  <div className="flex items-center gap-2 text-left">
                    <FiBook size={14} />
                    <span className="truncate text-sm">{lesson.lessonName || lesson.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {sessionsLoading[lesson.id] ? (
                    <p className="text-xs text-gray-400 px-2">Loading sessions...</p>
                  ) : (sessionsByLesson[lesson.id] || []).length === 0 ? (
                    <p className="text-xs text-gray-400 px-2">No sessions</p>
                  ) : (
                    <div className="space-y-1">
                      {(sessionsByLesson[lesson.id] || []).map((session) => (
                        <div
                          key={session.id}
                          onClick={() => handleSessionSelect(session)}
                          className={`text-xs p-2.5 rounded cursor-pointer transition border ${
                            selectedSession?.id === session.id
                              ? "bg-blue-100 border-blue-400"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-medium truncate">{session.topic}</p>
                              {session.type && (
                                <p className="text-gray-500 text-xs mt-1">
                                  <span className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                    {session.type.replace("_", " ")}
                                  </span>
                                </p>
                              )}
                              <p className="text-gray-500 text-xs mt-1">
                                {materialsBySession[session.id]?.length || 0} material(s)
                              </p>
                            </div>
                          </div>
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
              <StudentMaterialList
                materials={materialsBySession[selectedSession.id] || []}
                loading={materialsLoading[selectedSession.id]}
                onSelect={setSelectedMaterial}
                selectedId={selectedMaterial?.id}
              />
            </div>

            {/* Material Preview */}
            <div className="border rounded-lg p-4 overflow-y-auto">
              {selectedMaterial ? (
                <StudentMaterialPreview material={selectedMaterial} />
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
      </div>
    </div>
  );
}
