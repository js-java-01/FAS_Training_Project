import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Plus } from "lucide-react";

import { lessonApi, type Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import type { SessionResponse } from "@/types/session";

import SessionList from "./SessionList";
import SessionSidePanel, { type SessionSidePanelMode } from "./SessionSidePanel";

type Props = {
  courseId?: string;
};

export default function CourseOutline({ courseId }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Do not expand any lesson by default.
  // Sessions are only shown (and loaded) when user expands a lesson.
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);

  const [sessionsByLesson, setSessionsByLesson] = useState<Record<string, SessionResponse[]>>({});
  const [loadingByLesson, setLoadingByLesson] = useState<Record<string, boolean>>({});

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<SessionSidePanelMode>("create");
  const [panelLessonId, setPanelLessonId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLessons([]);
      setActiveLessonId(undefined);
      return;
    }

    let cancelled = false;
    setLessonsLoading(true);
    lessonApi
      .getByCourseId(courseId)
      .then((data) => {
        if (cancelled) return;
        setLessons(data);
        if (activeLessonId && !data.some((l) => l.id === activeLessonId)) {
          setActiveLessonId(undefined);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setLessonsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

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

        {!courseId ? (
          <div className="text-sm text-muted-foreground">Select a course to view lessons.</div>
        ) : lessonsLoading ? (
          <div className="text-sm text-muted-foreground">Loading lessons...</div>
        ) : null}

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
                  <span className="text-base font-semibold">{lesson.lessonName}</span>
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
        courseId={courseId}
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
