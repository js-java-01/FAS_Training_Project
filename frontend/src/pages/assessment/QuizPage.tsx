import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Submission, SubmissionQuestion } from "@/types/exam";
import { toast } from "sonner";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { getSubmissionForReview, submitAnswer as apiSubmitAnswer, submitSubmission as apiSubmitSubmission } from "@/api/submissionApi";
import { QuestionNavigator } from "./QuestionNavigator";

// ===== Local answer state =====
interface LocalAnswer {
  submissionQuestionId: string;
  answerValue: string;
}

export default function QuizPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, LocalAnswer>>(new Map());
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const autoSubmitRef = useRef(false);

  // Sort questions by orderIndex
  const questions: SubmissionQuestion[] = useMemo(
    () =>
      submission?.questions
        ? [...submission.questions].sort((a, b) => a.orderIndex - b.orderIndex)
        : [],
    [submission]
  );
  const currentQuestion = questions[currentIdx] ?? null;

  // ===== Load submission from API =====
  useEffect(() => {
    if (!submissionId) return;
    setIsLoading(true);
    getSubmissionForReview(submissionId)
      .then((data) => {
        setSubmission(data);
        // Pre-fill answers already saved
        const map = new Map<string, LocalAnswer>();
        data.questions?.forEach((q) => {
          if (q.userAnswer) {
            map.set(q.id, { submissionQuestionId: q.id, answerValue: q.userAnswer });
          }
        });
        setAnswers(map);
        // Set countdown timer
        if (data.remainingTimeSeconds != null) {
          setTimeLeft(data.remainingTimeSeconds);
        }
      })
      .catch(() => toast.error("Failed to load submission."))
      .finally(() => setIsLoading(false));
  }, [submissionId]);

  // ===== Countdown timer =====
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          if (!autoSubmitRef.current) {
            autoSubmitRef.current = true;
            toast.warning("Time's up! Auto-submitting...");
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null && timeLeft > 0]);

  const handleAutoSubmit = useCallback(async () => {
    if (!submissionId) return;
    try {
      await apiSubmitSubmission(submissionId);
      navigate(`/assessments/result/${submissionId}`, { replace: true });
    } catch {
      toast.error("Auto-submit failed.");
    }
  }, [submissionId, navigate]);

  // ===== Keyboard shortcuts =====
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1));
      } else if (e.key === "m" || e.key === "M") {
        if (currentQuestion) toggleMarkForReview(currentQuestion.id);
      } else if (["1", "2", "3", "4", "5", "6"].includes(e.key)) {
        if (currentQuestion && currentQuestion.options.length > 0) {
          const sorted = [...currentQuestion.options].sort((a, b) => a.orderIndex - b.orderIndex);
          const idx = parseInt(e.key) - 1;
          if (idx < sorted.length) {
            handleSelectOption(currentQuestion.id, sorted[idx].id);
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, questions.length]);

  const handleSelectOption = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        const existing = next.get(questionId);
        const currentVal = existing?.answerValue ?? "";
        const q = questions.find((q) => q.id === questionId);
        let newValue: string;
        if (q?.questionType === "MULTI_CHOICE") {
          const selected = new Set(currentVal ? currentVal.split(",") : []);
          if (selected.has(optionId)) selected.delete(optionId);
          else selected.add(optionId);
          newValue = Array.from(selected).join(",");
        } else {
          newValue = optionId;
        }
        next.set(questionId, { submissionQuestionId: questionId, answerValue: newValue });
        return next;
      });

      // Save answer to server (fire-and-forget, non-blocking)
      if (submissionId) {
        const q = questions.find((q) => q.id === questionId);
        const existing = answers.get(questionId)?.answerValue ?? "";
        let newVal: string;
        if (q?.questionType === "MULTI_CHOICE") {
          const sel = new Set(existing ? existing.split(",") : []);
          if (sel.has(optionId)) sel.delete(optionId); else sel.add(optionId);
          newVal = Array.from(sel).join(",");
        } else {
          newVal = optionId;
        }
        apiSubmitAnswer(submissionId, { submissionQuestionId: questionId, answerValue: newVal })
          .catch(() => { /* silent – answer saved locally */ });
      }
    },
    [questions, submissionId, answers]
  );

  const handleFillInChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, { submissionQuestionId: questionId, answerValue: value });
        return next;
      });
    },
    []
  );

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId); else next.add(questionId);
      return next;
    });
  };

  // ===== Final submit =====
  const handleSubmit = async () => {
    if (!submissionId) return;
    setIsSubmitting(true);
    try {
      // Flush any unanswered fill-in answers first
      const fillAnswers = Array.from(answers.values()).filter(
        (a) => a.answerValue && !questions.find((q) => q.id === a.submissionQuestionId)?.options?.length
      );
      for (const a of fillAnswers) {
        await apiSubmitAnswer(submissionId, { submissionQuestionId: a.submissionQuestionId, answerValue: a.answerValue });
      }

      const result = await apiSubmitSubmission(submissionId);
      toast.success(result.isPassed ? "🎉 Congratulations! You passed!" : "Quiz submitted successfully.");
      navigate(`/assessments/result/${submissionId}`, { replace: true });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const answeredCount = questions.filter(
    (q) => answers.has(q.id) && answers.get(q.id)!.answerValue !== ""
  ).length;

  // ===== Loading state =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="w-72 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">No Questions Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This assessment has no questions assigned to it. Please contact your instructor.
            </p>
            <Button onClick={() => navigate("/assessments")} className="w-full">
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const sortedOptions = [...currentQuestion.options].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentAnswer = answers.get(currentQuestion.id)?.answerValue ?? "";

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/assessments")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Exit
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {submission.assessmentTitle} — Q{currentIdx + 1}/{questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-mono ${timeLeft < 60 ? "text-red-600 font-bold" : ""}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {answeredCount}/{questions.length} answered
          </Badge>
          <Button size="sm" disabled={isSubmitting} onClick={() => setShowConfirm(true)}>
            <Send className="h-4 w-4 mr-1" /> Submit
          </Button>
        </div>
      </header>

      {/* Main area: 70-30 split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question panel */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-3xl mx-auto relative">
            {markedForReview.has(currentQuestion.id) && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full shadow-sm" title="Marked for review" />
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  Q{currentIdx + 1}.{" "}
                  <span dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{currentQuestion.score} pts</Badge>
                  <Button
                    variant={markedForReview.has(currentQuestion.id) ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    title="Mark for review (M)"
                    onClick={() => toggleMarkForReview(currentQuestion.id)}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentQuestion.questionType.replace(/_/g, " ")}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {sortedOptions.length > 0 ? (
                sortedOptions.map((opt, idx) => {
                  const isSelected =
                    currentQuestion.questionType === "MULTI_CHOICE"
                      ? currentAnswer.split(",").includes(opt.id)
                      : currentAnswer === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={`w-full text-left rounded-lg border p-4 transition-colors flex items-start gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`shrink-0 flex items-center justify-center h-7 w-7 rounded-full border text-sm font-medium ${
                          isSelected ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm pt-0.5" dangerouslySetInnerHTML={{ __html: opt.content }} />
                    </button>
                  );
                })
              ) : (
                <textarea
                  className="w-full border rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => handleFillInChange(currentQuestion.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* Prev / Next */}
          <div className="max-w-3xl mx-auto flex justify-between mt-4">
            <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Navigator sidebar */}
        <aside className="w-72 border-l bg-white p-4 overflow-y-auto shrink-0 hidden md:block">
          <QuestionNavigator
            mode="quiz"
            questions={questions}
            currentIndex={currentIdx}
            answers={answers}
            markedForReview={markedForReview}
            onQuestionClick={setCurrentIdx}
          />
          <div className="mt-4 text-xs text-muted-foreground space-y-0.5">
            <p><kbd className="px-1 py-0.5 rounded bg-gray-200 text-[10px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-200 text-[10px]">→</kbd> Navigate</p>
            <p><kbd className="px-1 py-0.5 rounded bg-gray-200 text-[10px]">1-6</kbd> Quick select</p>
            <p><kbd className="px-1 py-0.5 rounded bg-gray-200 text-[10px]">M</kbd> Mark for review</p>
          </div>
        </aside>
      </div>

      {/* Submit confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
              </p>
              {questions.length - answeredCount > 0 && (
                <p className="text-sm text-amber-600">
                  ⚠ {questions.length - answeredCount} question(s) still unanswered.
                </p>
              )}
              {markedForReview.size > 0 && (
                <p className="text-sm text-amber-600">⚠ {markedForReview.size} question(s) marked for review.</p>
              )}
              <p className="text-sm text-muted-foreground">Once submitted, you cannot change your answers.</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
