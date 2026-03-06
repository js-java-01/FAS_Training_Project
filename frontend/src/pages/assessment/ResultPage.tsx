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
  Trophy,
  BarChart3,
  Clock,
} from "lucide-react";
import { getSubmissionResult } from "@/api/submissionApi";
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
      <div className="flex gap-6">
        {/* Main content area */}
        <div className="flex-1 space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/assessments")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Assessments
          </Button>

          {/* Score card */}
          <Card className={`border-2 ${passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <CardContent className="py-8 flex flex-col items-center text-center gap-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${passed ? "bg-green-100" : "bg-red-100"}`}>
                {passed ? <Trophy className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{result.assessmentTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">Assessment Result</p>
              </div>
              <Badge className={`text-sm px-4 py-1 ${passed ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}`}>
                {passed ? "PASSED" : "FAILED"}
              </Badge>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{result.totalScore} <span className="text-sm font-normal text-muted-foreground">/ {result.maxScore}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Total Score</p>
                <p className="text-xs text-muted-foreground">Pass: {result.passScore}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{result.correctAnswers}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-xl font-bold">{result.wrongAnswers}</p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-xl font-bold">{result.unansweredQuestions}</p>
                  <p className="text-xs text-muted-foreground">Unanswered</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Duration */}
          {result.durationSeconds != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time taken: <strong>{formatDuration(result.durationSeconds)}</strong>
              <span>· Total questions: <strong>{result.totalQuestions}</strong></span>
            </div>
          )}

          {/* Per-question review */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Question Review</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} ref={(el) => { questionRefs.current[q.id] = el; }}>
                  <QuestionReviewCard question={q} index={idx} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <aside className="w-72 shrink-0 hidden lg:block sticky top-6 self-start">
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
