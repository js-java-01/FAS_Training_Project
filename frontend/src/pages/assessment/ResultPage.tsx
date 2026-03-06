import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubmissionResult, SubmissionQuestion } from "@/types/exam";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronDown,
  Trophy,
  BarChart3,
  Clock,
} from "lucide-react";
import { getSubmissionResult, getSubmissionsByAssessment } from "@/api/submissionApi";
import type { SubmissionSummary } from "@/types/exam";
import { QuestionNavigator } from "./QuestionNavigator";
import { toast } from "sonner";

export default function ResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!submissionId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getSubmissionResult(submissionId);
        setResult(data);
      } catch {
        toast.error("Failed to load result.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [submissionId]);

  const questions: SubmissionQuestion[] = useMemo(
    () =>
      result?.questionDetails
        ? [...result.questionDetails].sort((a, b) => a.orderIndex - b.orderIndex)
        : [],
    [result]
  );

  const scrollToQuestion = (questionId: string) => {
    questionRefs.current[questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!result) return null;

  const passed = result.isPassed === true;

  return (
    <MainLayout>
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Fixed top section */}
          <div className="shrink-0 space-y-4 pb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/assessments")}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Assessments
            </Button>

            {/* Score card */}
            <Card className={`border-2 ${passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Icon + title + badge */}
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${passed ? "bg-green-100" : "bg-red-100"}`}>
                    {passed ? <Trophy className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate">{result.assessmentTitle}</h2>
                    <Badge className={`text-xs px-2 py-0.5 shrink-0 ${passed ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}`}>
                      {passed ? "PASSED" : "FAILED"}
                    </Badge>
                  </div>
                  {/* Stats inline */}
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-center">
                      <p className="font-bold text-sm">{result.totalScore}<span className="font-normal text-muted-foreground">/{result.maxScore}</span></p>
                      <p className="text-muted-foreground">Score (pass {result.passScore})</p>
                    </div>
                    <div className="h-8 w-px bg-current opacity-10" />
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="font-bold">{result.correctAnswers}</span>
                      <span className="text-muted-foreground">correct</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="font-bold">{result.wrongAnswers}</span>
                      <span className="text-muted-foreground">wrong</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-bold">{result.unansweredQuestions}</span>
                      <span className="text-muted-foreground">unanswered</span>
                    </div>
                    {result.durationSeconds != null && (
                      <>
                        <div className="h-8 w-px bg-current opacity-10" />
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-bold">{formatDuration(result.durationSeconds)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-lg font-semibold">Question Review</h3>
          </div>

          {/* Scrollable question list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-4 pb-6">
              {questions.map((q, idx) => (
                <div key={q.id} ref={(el) => { questionRefs.current[q.id] = el; }}>
                  <QuestionReviewCard question={q} index={idx} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <aside className="w-72 shrink-0 hidden lg:flex flex-col min-h-0 overflow-y-auto">
          {result.assessmentId && (
            <AttemptsPanel
              assessmentId={result.assessmentId}
              currentSubmissionId={submissionId}
            />
          )}
          <QuestionNavigator
            mode="result"
            questions={questions}
            onQuestionClick={scrollToQuestion}
          />
        </aside>
      </div>
    </MainLayout>
  );
}

// ===== Attempts Panel =====
function AttemptsPanel({
  assessmentId,
  currentSubmissionId,
}: {
  assessmentId: string;
  currentSubmissionId?: string;
}) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!assessmentId) return;
      setIsLoading(true);
      try {
        const data = await getSubmissionsByAssessment(assessmentId);
        const submitted = [...data]
          .filter((s) => s.status === "SUBMITTED")
          .sort((a, b) => (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0));
        setSubmissions(submitted);
      } catch {
        // silently ignore – panel simply stays empty
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [assessmentId]);

  return (
    <div className="mb-3 border rounded-lg bg-white overflow-hidden shrink-0">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
      >
        <span>My Attempts ({submissions.length})</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="border-t divide-y max-h-52 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3">No submitted attempts found.</p>
          ) : (
            submissions.map((s) => {
              const isCurrent = s.id === currentSubmissionId;
              const passed = s.isPassed === true;
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    navigate(`/assessments/result/${s.id}`, { replace: true })
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${isCurrent ? "bg-blue-50 font-semibold" : ""
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <span>Attempt {s.attemptNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.totalScore != null && (
                      <span className="text-muted-foreground">{s.totalScore} pts</span>
                    )}
                    <Badge
                      className={`text-[10px] px-1.5 py-0 ${passed
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                    >
                      {passed ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ===== Question Review Card =====
function QuestionReviewCard({ question, index }: { question: SubmissionQuestion; index: number }) {
  const sortedOptions = [...question.options].sort((a, b) => a.orderIndex - b.orderIndex);
  const isCorrect = question.isCorrect === true;
  const wasAnswered = !!question.userAnswer;

  return (
    <Card className={`border-l-4 ${isCorrect ? "border-l-green-500" : wasAnswered ? "border-l-red-500" : "border-l-gray-300"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            Q{index + 1}. <span dangerouslySetInnerHTML={{ __html: question.content }} />
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">
              {question.earnedScore ?? 0} / {question.score} pts
            </Badge>
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : wasAnswered ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedOptions.length > 0 ? (
          sortedOptions.map((opt) => {
            const isUserChoice = question.userAnswer?.split(",").includes(opt.id);
            const isCorrectOpt = opt.isCorrect === true;
            let borderClass = "border-gray-200";
            let bgClass = "";
            if (isCorrectOpt) { borderClass = "border-green-400"; bgClass = "bg-green-50"; }
            if (isUserChoice && !isCorrectOpt) { borderClass = "border-red-400"; bgClass = "bg-red-50"; }
            return (
              <div key={opt.id} className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${borderClass} ${bgClass}`}>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  {isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {isUserChoice && !isCorrectOpt && <XCircle className="h-4 w-4 text-red-500" />}
                  {!isCorrectOpt && !isUserChoice && <span className="w-4" />}
                </div>
                <span dangerouslySetInnerHTML={{ __html: opt.content }} />
                {isUserChoice && (
                  <Badge variant="secondary" className="ml-auto text-[10px]">Your answer</Badge>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Your answer:</span>{" "}{question.userAnswer || <span className="italic text-gray-400">No answer</span>}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
