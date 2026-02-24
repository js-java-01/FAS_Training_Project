import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Plus } from "lucide-react";

import { useMockLessons } from "@/hooks/useMockLessons";
import { sessionService } from "@/api/sessionService";
import type { SessionResponse } from "@/types/session";

import SessionList from "./SessionList";
import SessionSidePanel, { type SessionSidePanelMode } from "./SessionSidePanel";

export default function CourseOutline() {
  const { lessons } = useMockLessons();

  // Do not expand any lesson by default.
  // Sessions are only shown (and loaded) when user expands a lesson.
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);

  const [sessionsByLesson, setSessionsByLesson] = useState<Record<string, SessionResponse[]>>({});
  const [loadingByLesson, setLoadingByLesson] = useState<Record<string, boolean>>({});

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<SessionSidePanelMode>("create");
  const [panelLessonId, setPanelLessonId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<SessionResponse | null>(null);

  const loadSessions = async (lessonId: string) => {
    setLoadingByLesson((p) => ({ ...p, [lessonId]: true }));
    try {
      const list = await sessionService.getSessionsByLesson(lessonId);
      setSessionsByLesson((p) => ({ ...p, [lessonId]: list }));
    } finally {
      setLoadingByLesson((p) => ({ ...p, [lessonId]: false }));
    }
  };

  useEffect(() => {
    if (!activeLessonId) return;
    void loadSessions(activeLessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">Outline</div>
            <div className="text-sm text-muted-foreground">Lessons and sessions</div>
          </div>
          <ActionBtn
            tooltipText="Add Session"
            icon={<Plus size={12} />}
            onClick={() => {
              setPanelMode("create");
              setPanelLessonId(activeLessonId ?? null);
              setEditingSession(null);
              setPanelOpen(true);
            }}
          />
        </div>

        <Accordion
          type="single"
          collapsible
          value={activeLessonId}
          onValueChange={(v) => setActiveLessonId(v || undefined)}
          className="w-full"
        >
          {lessons.map((lesson) => (
            <AccordionItem key={lesson.id} value={lesson.id}>
              <AccordionTrigger>
                <div className="flex flex-1 items-center justify-between pr-2">
                  <span className="text-base font-semibold">{lesson.title}</span>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                {activeLessonId === lesson.id && (
                  <div className="rounded-md border bg-background p-2">
                    <SessionList
                      data={sessionsByLesson[lesson.id] ?? []}
                      isLoading={loadingByLesson[lesson.id]}
                      onEdit={(s) => {
                        setPanelMode("edit");
                        setPanelLessonId(s.lessonId);
                        setEditingSession(s);
                        setPanelOpen(true);
                      }}
                      onDeleted={() => void loadSessions(lesson.id)}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <SessionSidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        mode={panelMode}
        initialSession={editingSession}
        defaultLessonId={panelMode === "create" ? panelLessonId : null}
        onSaved={(saved) => {
          // refresh the list for whichever lesson was affected
          void loadSessions(saved.lessonId);
        }}
      />
    </div>
  );
}
