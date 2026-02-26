import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserAssessment } from "@/types/exam";
import { toast } from "sonner";
import { Clock, Target, RotateCcw, ChevronRight, AlertCircle } from "lucide-react";
import { MOCK_ASSESSMENTS } from "./mockExamData";

type TabFilter = "all" | "new" | "in_progress" | "completed";

export default function SelectAssessmentPage() {
  const navigate = useNavigate();
  const [assessments] = useState<UserAssessment[]>(MOCK_ASSESSMENTS);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return assessments;
    if (activeTab === "new") return assessments.filter((a) => a.latestStatus === "NEW");
    if (activeTab === "in_progress") return assessments.filter((a) => a.latestStatus === "IN_PROGRESS");
    // completed
    return assessments.filter((a) => a.latestStatus === "SUBMITTED");
  }, [assessments, activeTab]);

  const handleStart = (assessment: UserAssessment) => {
    // If there's an in-progress submission, resume it
    if (assessment.latestStatus === "IN_PROGRESS" && assessment.lastSubmissionId) {
      navigate(`/exam/quiz/${assessment.lastSubmissionId}`);
      return;
    }

    // Check attempt limit
    if (assessment.attemptLimit > 0 && assessment.attemptCount >= assessment.attemptLimit) {
      toast.error("You have reached the maximum number of attempts for this assessment.");
      return;
    }

    // Mock: generate a fake submission ID and navigate
    setStartingId(assessment.assessmentId);
    const mockSubId = `mock-sub-${assessment.assessmentId}-${Date.now()}`;
    setTimeout(() => {
      setStartingId(null);
      navigate(`/exam/quiz/${mockSubId}`);
    }, 400);
  };

  const getStatusBadge = (assessment: UserAssessment) => {
    if (assessment.latestStatus === "SUBMITTED" && assessment.isPassed === true) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Passed</Badge>;
    }
    if (assessment.latestStatus === "SUBMITTED" && assessment.isPassed === false) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
    }
    if (assessment.latestStatus === "IN_PROGRESS") {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">In Progress</Badge>;
    }
    return <Badge variant="secondary">New</Badge>;
  };

  const getCta = (assessment: UserAssessment) => {
    if (assessment.latestStatus === "IN_PROGRESS") {
      return { label: "Continue", variant: "default" as const };
    }
    if (assessment.latestStatus === "SUBMITTED") {
      if (assessment.attemptLimit > 0 && assessment.attemptCount >= assessment.attemptLimit) {
        return { label: "No attempts left", variant: "secondary" as const, disabled: true };
      }
      return { label: "Retake", variant: "outline" as const };
    }
    return { label: "Start", variant: "default" as const };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select an assessment to begin or continue your exam.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
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
                  const cta = getCta(assessment);
                  return (
                    <Card key={assessment.assessmentId} className="flex flex-col transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <CardTitle className="text-base leading-tight truncate">
                              {assessment.title}
                            </CardTitle>
                            <CardDescription className="text-xs">{assessment.code}</CardDescription>
                          </div>
                          {getStatusBadge(assessment)}
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
                            {assessment.timeLimitMinutes} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" />
                            Pass: {assessment.passScore}/{assessment.totalScore}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <RotateCcw className="h-3.5 w-3.5" />
                            {assessment.attemptCount}/{assessment.attemptLimit > 0 ? assessment.attemptLimit : "∞"} attempts
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="flex items-center justify-between pt-3 border-t">
                        {assessment.latestStatus === "SUBMITTED" && assessment.lastSubmissionId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/exam/history/${assessment.assessmentId}`)}
                          >
                            History
                          </Button>
                        )}
                        <div className="ml-auto">
                          <Button
                            variant={cta.variant}
                            size="sm"
                            disabled={cta.disabled || startingId === assessment.assessmentId}
                            onClick={() => handleStart(assessment)}
                          >
                            {startingId === assessment.assessmentId ? (
                              "Starting..."
                            ) : (
                              <>
                                {cta.label}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
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
