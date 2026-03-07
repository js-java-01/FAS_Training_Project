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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((assessment) => {
                  const isStarting = startingId === assessment.id;
                  const isActive = assessment.status === "ACTIVE";

                  return (
                    <Card
                      key={assessment.id}
                      className={`group flex flex-col transition-all duration-300 hover:shadow-lg border-muted/60 hover:border-primary/20 ${!isActive ? "opacity-75 grayscale-[0.5]" : ""
                        }`}
                    >
                      <CardHeader className="pb-3 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0">
                            <Badge variant="outline" className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-muted/30">
                              {assessment.code}
                            </Badge>
                            <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                              {assessment.title}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={`shrink-0 shadow-sm ${isActive
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                          >
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                            {assessment.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-5 pb-5">
                        {assessment.description ? (
                          <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                            {assessment.description}
                          </p>
                        ) : (
                          <div className="h-[4.5rem] flex items-center italic text-xs text-muted-foreground/60">
                            No description provided for this assessment.
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-muted/20">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-background shadow-xs border border-muted/20">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-tight">Time</span>
                              <span className="text-xs font-medium">{assessment.timeLimitMinutes ?? "—"} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-background shadow-xs border border-muted/20">
                              <Target className="h-3.5 w-3.5 text-orange-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-tight">Passing</span>
                              <span className="text-xs font-medium">{assessment.passScore}/{assessment.totalScore}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 col-span-2 pt-1 border-t border-muted/20 mt-1">
                            <RotateCcw className="h-3.5 w-3.5 text-purple-500 ml-1.5" />
                            <span className="text-xs font-medium">
                              {assessment.attemptLimit > 0 ? `${assessment.attemptLimit} attempts allowed` : "Unlimited attempts"}
                            </span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-4 pb-5 px-6 border-t bg-muted/10 flex items-center justify-between gap-4">
                        <ResultsDropdown assessmentId={assessment.id} />
                        <Button
                          className="flex-1 shadow-sm transition-all hover:translate-x-0.5 active:scale-[0.98]"
                          disabled={isStarting || !isActive}
                          onClick={() => handleStart(assessment)}
                        >
                          {isStarting ? (
                            "Starting..."
                          ) : (
                            <>
                              Start Assessment <ChevronRight className="h-4 w-4 ml-1.5" />
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
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <History className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-2 shadow-xl border-muted/40">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Past Attempts</DropdownMenuLabel>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">{submissions.length}</Badge>
        </div>
        <DropdownMenuSeparator className="-mx-2 mb-2" />
        {isFetching ? (
          <div className="p-3 space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-3 py-8 text-xs text-center text-muted-foreground italic flex flex-col items-center gap-2">
            <History className="h-8 w-8 opacity-20" />
            No submitted attempts yet.
          </div>
        ) : (
          <div className="space-y-1">
            {submissions.map((s) => {
              const passed = s.isPassed === true;
              return (
                <DropdownMenuItem
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg cursor-pointer transition-colors focus:bg-muted"
                  onClick={() => navigate(`/assessments/result/${s.id}`)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${passed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                      {passed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">
                        Attempt {s.attemptNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.totalScore != null ? `${s.totalScore} points` : "N/A"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] px-2 py-0 border-transparent shadow-none ${passed
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                      : "bg-rose-100 text-rose-800 hover:bg-rose-100"
                      }`}
                  >
                    {passed ? "Pass" : "Fail"}
                  </Badge>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
