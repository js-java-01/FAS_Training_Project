import { useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { useGetTrainingClassById } from "./services/queries";
import { useGetAllSemesters } from "./services/queries/useSemesters";
import { trainingClassApi } from "@/api/trainingClassApi";
import { trainingClassKeys } from "./keys";
import type { TrainingClass } from "@/types/trainingClass";
import type { ClassInfoFormData } from "./components/ClassInfoTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileBarChartIcon, Pencil, Save, X } from "lucide-react";
import ClassInfoTab from "./components/ClassInfoTab";
import { getTrainingClassStatusPresentation } from "./utils/statusPresentation";
import { decodeRouteId } from "@/utils/routeIdCodec";
import TopicMarkModal from "../topic-mark/TopicMarkManagement";

const TABS = [
    { value: "class-info", label: "Class Info" },
    { value: "trainee-list", label: "Trainee List" },
    { value: "calendar", label: "Calendar" },
    { value: "course-assignment", label: "Course Assignment" },
    { value: "budget-operation", label: "Budget & Operation Info" },
    { value: "activities", label: "Activities" },
] as const;

/* ── helpers ── */
const buildFormData = (tc: TrainingClass): ClassInfoFormData => ({
    className: tc.className ?? "",
    classCode: tc.classCode ?? "",
    description: tc.description ?? "",
    startDate: tc.startDate ? tc.startDate.slice(0, 10) : "",
    endDate: tc.endDate ? tc.endDate.slice(0, 10) : "",
    semesterId: "",
});

const validateForm = (data: ClassInfoFormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDateValue = data.startDate ? new Date(data.startDate) : null;
    const endDateValue = data.endDate ? new Date(data.endDate) : null;

    if (startDateValue) startDateValue.setHours(0, 0, 0, 0);
    if (endDateValue) endDateValue.setHours(0, 0, 0, 0);

    if (!data.className.trim()) errs.className = "Class name is required";
    if (!data.classCode.trim()) errs.classCode = "Class code is required";
    if (!data.startDate) errs.startDate = "Start date is required";
    if (!data.endDate) errs.endDate = "End date is required";
    if (startDateValue && startDateValue < today) {
        errs.startDate = "Start date cannot be in the past";
    }
    if (endDateValue && endDateValue < today) {
        errs.endDate = "End date cannot be in the past";
    }
    if (startDateValue && endDateValue && startDateValue >= endDateValue) {
        errs.endDate = "End date must be after start date";
    }
    return errs;
};

export default function ClassDetailPage() {
    const { id } = useParams<{ id: string }>();
    const decodedClassId = id ? decodeRouteId("classes", id) : null;
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [openTopicMark, setOpenTopicMark] = useState(false);

    /* Data passed from the table via navigate state */
    const stateClass = (location.state as { trainingClass?: TrainingClass })?.trainingClass ?? null;

    /* Fetch from API (will also work for direct URL navigation) */
    const { data: fetchedClass, isLoading } = useGetTrainingClassById(decodedClassId ?? undefined);

    /* Prefer fetched data, fall back to route state */
    const trainingClass = fetchedClass ?? stateClass;
    const statusPresentation = trainingClass
        ? getTrainingClassStatusPresentation(trainingClass)
        : null;

    /* ── Edit mode state ── */
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ClassInfoFormData>(() =>
        trainingClass ? buildFormData(trainingClass) : {
            className: "", classCode: "", description: "", startDate: "", endDate: "", semesterId: "",
        },
    );
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    /* Semesters for edit mode */
    const { data: semesters = [], isLoading: loadingSemesters } = useGetAllSemesters();

    const handleEdit = useCallback(() => {
        if (trainingClass) {
            setFormData(buildFormData(trainingClass));
            setFormErrors({});
            setIsEditing(true);
        }
    }, [trainingClass]);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setFormErrors({});
        if (trainingClass) setFormData(buildFormData(trainingClass));
    }, [trainingClass]);

    const handleFieldChange = useCallback((name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const handleSave = useCallback(async () => {
        const errs = validateForm(formData);
        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            return;
        }

        if (!decodedClassId) return;
        setSaving(true);
        try {
            await trainingClassApi.updateTrainingClass(decodedClassId, {
                className: formData.className,
                classCode: formData.classCode,
                description: formData.description || undefined,
                startDate: formData.startDate,
                endDate: formData.endDate,
                semesterId: formData.semesterId || undefined,
            });
            toast.success("Class updated successfully");
            await queryClient.invalidateQueries({ queryKey: trainingClassKeys.detail(decodedClassId) });
            await queryClient.invalidateQueries({ queryKey: ["training-classes"] });
            setIsEditing(false);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err as { message?: string })?.message ||
                "Failed to update class";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }, [decodedClassId, formData, queryClient]);

    return (
      <MainLayout
        pathName={
          decodedClassId && trainingClass
            ? {
                classes: "Classes",
                [id as string]: trainingClass.className ?? "Detail",
              }
            : undefined
        }
      >
            {isLoading && !trainingClass ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading…
                </div>
            ) : !trainingClass ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <p className="text-muted-foreground">Training class not found.</p>
                    <Button variant="outline" onClick={() => navigate("/classes")}>
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
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        <Save className="h-4 w-4" />
                                        {saving ? "Saving..." : "Save"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => navigate("/classes")}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to list
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={handleEdit}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                </>
                            )}
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
                            className={statusPresentation?.badgeClassName}
                        >
                            {statusPresentation?.label}
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
                            <ClassInfoTab
                                trainingClass={trainingClass}
                                isEditing={isEditing}
                                formData={formData}
                                onFieldChange={handleFieldChange}
                                errors={formErrors}
                                semesters={semesters}
                                loadingSemesters={loadingSemesters}
                            />
                        </TabsContent>

                        {/* Placeholder tabs */}
                  <TabsContent value="trainee-list" className="pt-6 overflow-y-auto flex-1">
                     <Button variant='outline' onClick={() => setOpenTopicMark(true)}><FileBarChartIcon/> Topic mark</Button>
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

            {trainingClass && (
              <TopicMarkModal
                open={openTopicMark}
                onOpenChange={setOpenTopicMark}
                trainingClass={trainingClass}
              />
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
