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
import { ArrowLeft, CalendarDays, FileText, Hash } from "lucide-react";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTrainingProgramById } from "./services/queries";

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useGetTrainingProgramById(id);

  return (
    <MainLayout pathName={{ programs: "Programs", detail: "Detail" }}>
      <div className="mx-auto w-full max-w-5xl py-6 space-y-5">
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
                  icon={<FileText className="h-4 w-4" />}
                  label="Description"
                  value={data.description || "No description"}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
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
