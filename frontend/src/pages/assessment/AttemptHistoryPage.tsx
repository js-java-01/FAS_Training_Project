import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Submission } from "@/types/exam";
import { ChevronLeft, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getMockAttemptHistory, getMockAssessment } from "./mockExamData";

export default function AttemptHistoryPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentTitle, setAssessmentTitle] = useState<string>();

  useEffect(() => {
    if (!assessmentId) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      setSubmissions(getMockAttemptHistory(assessmentId));
      const assessment = getMockAssessment(assessmentId);
      setAssessmentTitle(assessment?.title);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [assessmentId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.status === "IN_PROGRESS") {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (submission.isPassed === true) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Passed
        </Badge>
      );
    }
    if (submission.isPassed === false) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return <Badge variant="secondary">Submitted</Badge>;
  };

  return (
    <MainLayout
      pathName={assessmentId && assessmentTitle ? { history: "History", [assessmentId]: assessmentTitle } : undefined}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/assessments")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Assessments
          </Button>
          <p className="text-sm text-muted-foreground">
            Showing all attempts, newest first
          </p>
        </div>

        {isLoading ? (
          <Card className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        ) : submissions.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p>No attempts found for this assessment.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-24">Score</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub, idx) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{submissions.length - idx}</TableCell>
                    <TableCell className="text-sm">{formatDate(sub.startedAt)}</TableCell>
                    <TableCell className="text-sm">{formatDate(sub.submittedAt)}</TableCell>
                    <TableCell className="font-semibold">
                      {sub.totalScore !== null ? sub.totalScore : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub)}</TableCell>
                    <TableCell className="text-right">
                      {sub.status === "SUBMITTED" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/assessments/result/${sub.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/assessments/quiz/${sub.id}`)}
                        >
                          Continue
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
