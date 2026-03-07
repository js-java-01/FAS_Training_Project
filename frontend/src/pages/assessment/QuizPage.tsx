import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Submission, SubmissionQuestion, AnswerSubmission } from "@/types/exam";
import { toast } from "sonner";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { getMockSubmission, gradeMockSubmission } from "./mockExamData";
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
  const [timeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sort questions by orderIndex
  const questions: SubmissionQuestion[] = useMemo(
    () =>
      submission?.submissionQuestions
        ? [...submission.submissionQuestions].sort((a, b) => a.orderIndex - b.orderIndex)
        : [],
    [submission]
  );
  const currentQuestion = questions[currentIdx] ?? null;

  // ===== Load mock submission =====
  useEffect(() => {
    if (!submissionId) return;

    // Simulate loading delay
    setIsLoading(true);
    const timer = setTimeout(() => {
      const data = getMockSubmission(submissionId);
      setSubmission(data);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [submissionId]);

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
          if (selected.has(optionId)) {
            selected.delete(optionId);
          } else {
            selected.add(optionId);
          }
          newValue = Array.from(selected).join(",");
        } else {
          newValue = optionId;
        }

        next.set(questionId, {
          submissionQuestionId: questionId,
          answerValue: newValue,
        });

        return next;
      });
    },
    [questions]
  );

  const handleFillInChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, {
          submissionQuestionId: questionId,
          answerValue: value,
        });
        return next;
      });
    },
    []
  );

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // ===== Submit (mock grading) =====
  const handleSubmit = () => {
    if (!submissionId) return;

    setIsSubmitting(true);

    const bulkAnswers: AnswerSubmission[] = [];
    answers.forEach((a) => {
      if (a.answerValue) {
        bulkAnswers.push({
          submissionQuestionId: a.submissionQuestionId,
          answerValue: a.answerValue,
        });
      }
    });

    // Simulate grading delay
    setTimeout(() => {
      const { result } = gradeMockSubmission(submissionId, bulkAnswers);
      toast.success(result.isPassed ? "Congratulations! You passed!" : "Quiz submitted.");
      navigate(`/assessments/result/${result.submissionId}`, {
        replace: true,
        state: { answers: bulkAnswers },
      });
      setIsSubmitting(false);
      setShowConfirm(false);
    }, 800);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/assessments")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Exit
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {answeredCount}/{questions.length} answered
          </Badge>
          <Button
            size="sm"
            variant="default"
            disabled={isSubmitting}
            onClick={() => setShowConfirm(true)}
          >
            <Send className="h-4 w-4 mr-1" /> Submit
          </Button>
        </div>
      </header>

      {/* Main area: 70-30 split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question panel (70%) */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-3xl mx-auto relative">
            {/* Marked indicator - small yellow dot */}
            {markedForReview.has(currentQuestion.id) && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full shadow-sm" title="Marked for review" />
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  Q{currentIdx + 1}. <span dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.score} pts
                  </Badge>
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
              <p className="text-xs text-muted-foreground mt-1">{currentQuestion.questionType.replace(/_/g, " ")}</p>
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
                          isSelected
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-600 border-gray-300"
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

          {/* Navigation buttons */}
          <div className="max-w-3xl mx-auto flex justify-between mt-4">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx((prev) => prev + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Question nav panel (30%) */}
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
                You have answered <strong>{answeredCount}</strong> out of{" "}
                <strong>{questions.length}</strong> questions.
              </p>
              {questions.length - answeredCount > 0 && (
                <p className="text-sm text-amber-600">
                  ⚠ {questions.length - answeredCount} question(s) are still unanswered.
                </p>
              )}
              {markedForReview.size > 0 && (
                <p className="text-sm text-amber-600">
                  ⚠ {markedForReview.size} question(s) are marked for review.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Once submitted, you cannot change your answers.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
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
