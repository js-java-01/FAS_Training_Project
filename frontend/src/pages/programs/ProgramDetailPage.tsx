import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { courseApi } from "@/api/courseApi";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, FileText, Hash, Layers, MapPin } from "lucide-react";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTrainingProgramById } from "./services/queries";
import type { Course } from "@/types/course";

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useGetTrainingProgramById(id);
  const { data: coursesData } = useQuery({
    queryKey: ["program-detail-courses"],
    queryFn: () => courseApi.getCourses({ page: 0, size: 200, sort: "courseName,asc" }),
  });

  const relatedCourses = useMemo(() => {
    if (!data?.programCourseIds || data.programCourseIds.length === 0) return [] as Course[];
    const idSet = new Set(data.programCourseIds);
    return (coursesData?.items || []).filter((course) => idSet.has(course.id));
  }, [data?.programCourseIds, coursesData?.items]);

  const totalHours = useMemo(
    () => relatedCourses.reduce((sum, course) => sum + (course.estimatedTime || 0), 0) / 60,
    [relatedCourses],
  );

  return (
    <MainLayout pathName={{ programs: "Programs", detail: "Detail" }}>
      <div className="mx-auto w-full max-w-7xl py-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="text-muted-foreground">Programs details and configuration</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        </div>

        {isLoading && (
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        )}

        {isError && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Unable to load program details.
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{data.name}</h2>
              <Badge variant="outline">{data.version}</Badge>
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Program Information</CardTitle>
                <CardDescription>Overview and metadata of this training program</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Program ID"
                  value={data.id}
                />
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Created At"
                  value={dayjs(data.createdAt).format("HH:mm DD-MM-YYYY")}
                />
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Updated At"
                  value={dayjs(data.updatedAt).format("HH:mm DD-MM-YYYY")}
                />
                <InfoRow
                  icon={<Layers className="h-4 w-4" />}
                  label="Technical Group"
                  value="Common"
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value="N/A"
                />
                <InfoRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Description"
                  value={data.description || "No description"}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Info</CardTitle>
                  <CardDescription>Courses currently linked with this program</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">No.</TableHead>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedCourses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                              No courses linked yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          relatedCourses.map((course, index) => (
                            <TableRow key={course.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{course.courseCode}</TableCell>
                              <TableCell>{course.courseName}</TableCell>
                              <TableCell>{course.level || "-"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Summary</CardTitle>
                  <CardDescription>Quick overview of linked courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SummaryRow label="Total Courses" value={`${relatedCourses.length}`} />
                  <SummaryRow
                    label="Beginner"
                    value={`${relatedCourses.filter((course) => course.level === "BEGINNER").length}`}
                  />
                  <SummaryRow
                    label="Intermediate"
                    value={`${relatedCourses.filter((course) => course.level === "INTERMEDIATE").length}`}
                  />
                  <SummaryRow
                    label="Advanced"
                    value={`${relatedCourses.filter((course) => course.level === "ADVANCED").length}`}
                  />
                  <SummaryRow label="Estimated Hours" value={`${totalHours.toFixed(1)}h`} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border p-3 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}
