import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useGetTrainingClassById } from "./services/queries";
import type { TrainingClass } from "@/types/trainingClass";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import ClassInfoTab from "./components/ClassInfoTab";

function ClassBreadcrumb() {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/training-classes">Classes</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Detail</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

const TABS = [
    { value: "class-info", label: "Class Info" },
    { value: "trainee-list", label: "Trainee List" },
    { value: "calendar", label: "Calendar" },
    { value: "course-assignment", label: "Course Assignment" },
    { value: "budget-operation", label: "Budget & Operation Info" },
    { value: "activities", label: "Activities" },
] as const;

export default function ClassDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    /* Data passed from the table via navigate state */
    const stateClass = (location.state as { trainingClass?: TrainingClass })?.trainingClass ?? null;

    /* Fetch from API (will also work for direct URL navigation) */
    const { data: fetchedClass, isLoading } = useGetTrainingClassById(id);

    /* Prefer fetched data, fall back to route state */
    const trainingClass = fetchedClass ?? stateClass;

    return (
        <MainLayout customBreadcrumb={<ClassBreadcrumb />}>
            {isLoading && !trainingClass ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading…
                </div>
            ) : !trainingClass ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <p className="text-muted-foreground">Training class not found.</p>
                    <Button variant="outline" onClick={() => navigate("/training-classes")}>
                        Back to list
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-4 h-full">
                    {/* ── Page Title Row ── */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
                            <p className="text-sm text-muted-foreground">
                                Classes details and configuration
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => navigate("/training-classes")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to list
                            </Button>
                        </div>
                    </div>

                    {/* ── Class Name + Code + Badge ── */}
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">
                            {trainingClass.className}
                        </h2>
                        <span className="font-mono text-sm text-muted-foreground">
                            {trainingClass.classCode}
                        </span>
                        <Badge
                            className={
                                trainingClass.isActive
                                    ? "bg-blue-100 text-blue-700 border-blue-200 shadow-none"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-none"
                            }
                        >
                            {trainingClass.isActive ? "Planning" : "Pending"}
                        </Badge>
                    </div>

                    {/* ── Tabs ── */}
                    <Tabs defaultValue="class-info" className="flex-1 flex flex-col min-h-0">
                        <TabsList variant="line" className="border-b w-full justify-start">
                            {TABS.map((tab) => (
                                <TabsTrigger key={tab.value} value={tab.value}>
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Class Info */}
                        <TabsContent value="class-info" className="pt-6 overflow-y-auto flex-1">
                            <ClassInfoTab trainingClass={trainingClass} />
                        </TabsContent>

                        {/* Placeholder tabs */}
                        <TabsContent value="trainee-list" className="pt-6 overflow-y-auto flex-1">
                            <PlaceholderTab label="Trainee List" />
                        </TabsContent>
                        <TabsContent value="calendar" className="pt-6 overflow-y-auto flex-1">
                            <PlaceholderTab label="Calendar" />
                        </TabsContent>
                        <TabsContent value="course-assignment" className="pt-6 overflow-y-auto flex-1">
                            <PlaceholderTab label="Course Assignment" />
                        </TabsContent>
                        <TabsContent value="budget-operation" className="pt-6 overflow-y-auto flex-1">
                            <PlaceholderTab label="Budget & Operation Info" />
                        </TabsContent>
                        <TabsContent value="activities" className="pt-6 overflow-y-auto flex-1">
                            <PlaceholderTab label="Activities" />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </MainLayout>
    );
}

/* temporary empty state for other tabs */
function PlaceholderTab({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p>{label} — coming soon</p>
        </div>
    );
}
