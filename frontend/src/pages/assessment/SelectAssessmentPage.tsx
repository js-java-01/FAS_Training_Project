import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Assessment } from "@/types";
import type { SubmissionSummary } from "@/types/exam";
import { toast } from "sonner";
import { Clock, Target, RotateCcw, ChevronRight, AlertCircle, History, CheckCircle2, XCircle } from "lucide-react";
import { startSubmission, getSubmissionsByAssessment } from "@/api/submissionApi";
import { assessmentApi } from "@/api";

type TabFilter = "all" | "active" | "inactive";
export default function SelectAssessmentPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  useEffect(() => {
    setIsLoading(true);
    assessmentApi
      .getPage({ page: 0, size: 100 }, "", undefined)
      .then((res) => setAssessments(res.content ?? []))
      .catch(() => toast.error("Failed to load assessments."))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "active") return assessments.filter((a) => a.status === "ACTIVE");
    if (activeTab === "inactive") return assessments.filter((a) => a.status !== "ACTIVE");
    return assessments;
  }, [assessments, activeTab]);

  const handleStart = async (assessment: Assessment) => {
    setStartingId(assessment.id);
    try {
      const submission = await startSubmission(assessment.id);

      // Guard: do not navigate if submission has no questions (assessment not configured)
      if (!submission.questions || submission.questions.length === 0) {
        toast.error("This assessment has no questions assigned. Please contact your instructor.");
        return;
      }

      navigate(`/assessments/quiz/${submission.submissionId}`);
    } catch (err: unknown) {
      // Extract exact message from backend response
      let msg = "Failed to start assessment.";
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        msg = res?.data?.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      console.error("[startSubmission error]", err);
      toast.error(msg);
    } finally {
      setStartingId(null);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-3" />
                <p>No assessments found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((assessment) => {
                  const isStarting = startingId === assessment.id;
                  return (
                    <Card
                      key={assessment.id}
                      className="flex flex-col transition-shadow hover:shadow-md"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <CardTitle className="text-base leading-tight truncate">
                              {assessment.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {assessment.code}
                            </CardDescription>
                          </div>
                          <Badge
                            className={
                              assessment.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-3 pb-3">
                        {assessment.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {assessment.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {assessment.timeLimitMinutes ?? "—"} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" />
                            Pass: {assessment.passScore}/{assessment.totalScore}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <RotateCcw className="h-3.5 w-3.5" />
                            Attempts: {assessment.attemptLimit > 0 ? assessment.attemptLimit : "∞"}
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t flex items-center justify-between gap-2">
                        <ResultsDropdown assessmentId={assessment.id} />
                        <Button
                          size="sm"
                          disabled={isStarting || assessment.status !== "ACTIVE"}
                          onClick={() => handleStart(assessment)}
                        >
                          {isStarting ? (
                            "Starting..."
                          ) : (
                            <>
                              Start <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

// ===== Results Dropdown =====
function ResultsDropdown({ assessmentId }: { assessmentId: string }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [opened, setOpened] = useState(false);

  const loadSubmissions = async () => {
    if (!assessmentId) return;
    if (submissions.length > 0) return; // already loaded
    setIsFetching(true);
    try {
      const data = await getSubmissionsByAssessment(assessmentId);
      const submitted = [...data]
        .filter((s) => s.status === "SUBMITTED")
        .sort((a, b) => (b.attemptNumber ?? 0) - (a.attemptNumber ?? 0));
      setSubmissions(submitted);
    } catch {
      toast.error("Failed to load results.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <DropdownMenu
      open={opened}
      onOpenChange={(o) => {
        setOpened(o);
        if (o) loadSubmissions();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-3.5 w-3.5 mr-1" /> Results
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-[220px] overflow-y-auto">
        <DropdownMenuLabel className="text-xs">Past Attempts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isFetching ? (
          <div className="p-2 space-y-1.5">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-3 py-4 text-xs text-center text-muted-foreground">
            No submitted attempts yet.
          </div>
        ) : (
          submissions.map((s) => {
            const passed = s.isPassed === true;
            return (
              <DropdownMenuItem
                key={s.id}
                className="flex items-center justify-between gap-2 cursor-pointer"
                onClick={() => navigate(`/assessments/result/${s.id}`)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                  <span className="text-xs truncate">
                    Attempt {s.attemptNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {s.totalScore != null && (
                    <span className="text-xs text-muted-foreground">{s.totalScore} pts</span>
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
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
