import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { getMockAttemptHistory } from "./mockExamData";

export default function AttemptHistoryPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      setSubmissions(getMockAttemptHistory(assessmentId));
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
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/exam")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attempt History</h2>
            <p className="text-sm text-muted-foreground">
              All your attempts for this assessment, newest first.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No attempts found for this assessment.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20 text-right">Action</TableHead>
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
                          onClick={() => navigate(`/exam/result/${sub.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/exam/quiz/${sub.id}`)}
                        >
                          Continue
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
