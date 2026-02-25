import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { lessonApi, type Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import type { SessionRequest, SessionResponse } from "@/types/session";
import { SESSION_TYPE_OPTIONS } from "@/types/session";

export type SessionSidePanelMode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SessionSidePanelMode;
  courseId: string;
  /** Prefill when editing */
  initialSession?: SessionResponse | null;
  /** Preselect when creating from a lesson context */
  defaultLessonId?: string | null;
  onSaved?: (saved: SessionResponse) => void;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

type FormState = {
  lessonId: string;
  type: string;
  topic: string;
  studentTasks: string;
  sessionOrder: string;
};

const EMPTY_FORM: FormState = {
  lessonId: "",
  type: "",
  topic: "",
  studentTasks: "",
  sessionOrder: "",
};

export function SessionSidePanel({
  open,
  onOpenChange,
  mode,
  courseId,
  initialSession,
  defaultLessonId,
  onSaved,
}: Props) {
  const { toast } = useToast();

  const title = useMemo(() => (mode === "edit" ? "Edit Session" : "Add Session"), [mode]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!courseId) {
      setLessons([]);
      return;
    }

    let cancelled = false;
    setLessonsLoading(true);
    lessonApi
      .getByCourseId(courseId)
      .then((data) => {
        if (cancelled) return;
        setLessons(data);
      })
      .catch(() => {
        if (cancelled) return;
        setLessons([]);
        toast({
          title: "Load failed",
          description: "Could not load lessons for this course.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (cancelled) return;
        setLessonsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, open, toast]);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialSession) {
      setForm({
        lessonId: initialSession.lessonId ?? "",
        type: initialSession.type ?? "",
        topic: initialSession.topic ?? "",
        studentTasks: initialSession.studentTasks ?? "",
        sessionOrder:
          initialSession.sessionOrder !== undefined && initialSession.sessionOrder !== null
            ? String(initialSession.sessionOrder)
            : "",
      });
      return;
    }

    setForm({
      ...EMPTY_FORM,
      lessonId: defaultLessonId ?? "",
    });
  }, [defaultLessonId, initialSession, mode, open]);

  const onCancel = () => onOpenChange(false);

  const onSave = async () => {
    if (!form.lessonId) {
      toast({ title: "Validation", description: "Lesson is required.", variant: "destructive" });
      return;
    }

    if (!isUuid(form.lessonId)) {
      toast({
        title: "Validation",
        description: "Lesson ID must be a valid UUID.",
        variant: "destructive",
      });
      return;
    }

    if (lessons.length > 0 && !lessons.some((l) => l.id === form.lessonId)) {
      toast({
        title: "Validation",
        description: "Selected lesson does not belong to this course.",
        variant: "destructive",
      });
      return;
    }
    if (!form.sessionOrder) {
      toast({
        title: "Validation",
        description: "Session Order is required.",
        variant: "destructive",
      });
      return;
    }

    const sessionOrder = Number(form.sessionOrder);
    if (!Number.isFinite(sessionOrder) || sessionOrder <= 0) {
      toast({
        title: "Validation",
        description: "Session Order must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    const payload: SessionRequest = {
      lessonId: form.lessonId,
      sessionOrder,
      topic: form.topic || "",
      ...(form.type ? { type: form.type } : {}),
      ...(form.studentTasks ? { studentTasks: form.studentTasks } : {}),
    };

    try {
      setSaving(true);
      const saved =
        mode === "edit" && initialSession?.id
          ? await sessionService.updateSession(initialSession.id, payload)
          : await sessionService.createSession(payload);

      toast({
        title: "Success",
        description: mode === "edit" ? "Session updated successfully." : "Session created successfully.",
      });

      onSaved?.(saved);
      onOpenChange(false);
    } catch {
      toast({
        title: "Save failed",
        description: "Could not save session. Please check inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 sm:max-w-md" side="right">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="p-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="lessonId">
              Lesson <span className="text-red-500">*</span>
            </Label>
            <select
              id="lessonId"
              value={form.lessonId}
              onChange={(e) => setForm((p) => ({ ...p, lessonId: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
              disabled={!!lessonsLoading}
            >
              <option value="" disabled>
                {lessonsLoading ? "Loading lessons..." : "Select Lesson"}
              </option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lessonName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Learning/Teaching Type</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select Type</option>
              {SESSION_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={form.topic}
              onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
              placeholder="e.g. Introduction"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="studentTasks">Student Tasks</Label>
            <textarea
              id="studentTasks"
              value={form.studentTasks}
              onChange={(e) => setForm((p) => ({ ...p, studentTasks: e.target.value }))}
              placeholder="Describe tasks for students..."
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sessionOrder">
              Session Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sessionOrder"
              type="number"
              value={form.sessionOrder}
              onChange={(e) => setForm((p) => ({ ...p, sessionOrder: e.target.value }))}
              min={1}
              required
            />
          </div>
        </div>

        <SheetFooter className="border-t">
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
