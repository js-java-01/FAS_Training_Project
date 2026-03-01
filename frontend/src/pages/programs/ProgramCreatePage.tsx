import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import { courseApi } from "@/api/courseApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Course } from "@/types/course";

type FormState = {
  name: string;
  version: string;
  description: string;
};

type SelectableCourse = {
  id: string;
  code: string;
  name: string;
  level?: string;
};

const MOCK_COURSES: SelectableCourse[] = [
  { id: "mock-1", code: "JAVA-CORE", name: "Java Core", level: "INTERMEDIATE" },
  { id: "mock-2", code: "SPRING-BOOT", name: "Spring Boot Web Development", level: "INTERMEDIATE" },
  { id: "mock-3", code: "DB-SQL", name: "SQL for Backend", level: "BEGINNER" },
  { id: "mock-4", code: "DSA", name: "Data Structures & Algorithms", level: "ADVANCED" },
];

export default function ProgramCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [form, setForm] = useState<FormState>({
    name: "",
    version: "1.0.0",
    description: "",
  });
  const [courseKeyword, setCourseKeyword] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<SelectableCourse[]>([]);

  const { data: courseData, isLoading: isCourseLoading } = useQuery({
    queryKey: ["program-create-courses"],
    queryFn: () => courseApi.getCourses({ page: 0, size: 100, sort: "courseName,asc" }),
  });

  const coursePool = useMemo<SelectableCourse[]>(() => {
    const fromApi = (courseData?.items || []).map((course: Course) => ({
      id: course.id,
      code: course.courseCode,
      name: course.courseName,
      level: course.level,
    }));
    return fromApi.length > 0 ? fromApi : MOCK_COURSES;
  }, [courseData]);

  const availableCourses = useMemo(() => {
    const selectedIds = new Set(selectedCourses.map((course) => course.id));
    return coursePool.filter(
      (course) =>
        !selectedIds.has(course.id) &&
        (`${course.code} ${course.name}`).toLowerCase().includes(courseKeyword.toLowerCase()),
    );
  }, [coursePool, selectedCourses, courseKeyword]);

  const filteredSelectedCourses = useMemo(
    () =>
      selectedCourses.filter((course) =>
        `${course.code} ${course.name}`.toLowerCase().includes(selectedKeyword.toLowerCase()),
      ),
    [selectedCourses, selectedKeyword],
  );

  const validate = () => {
    const nextErrors: Partial<FormState> = {};

    if (!form.name.trim()) nextErrors.name = "Program name is required";
    if (!form.version.trim()) nextErrors.version = "Version is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Temporary backend contract: create only supports basic fields.
      // Do not send programCourseIds until backend confirms stable linkage IDs.
      await trainingProgramApi.createTrainingProgram({
        name: form.name.trim(),
        version: form.version.trim(),
        description: form.description.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["training-programs"] });
      toast.success("Training program created successfully");
      navigate("/programs");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create training program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCourse = (course: SelectableCourse) => {
    if (selectedCourses.some((item) => item.id === course.id)) return;
    setSelectedCourses((prev) => [...prev, course]);
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  return (
    <MainLayout pathName={{ programs: "Programs", new: "New" }}>
      <div className="mx-auto w-full max-w-7xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Training Program</h1>
          <p className="text-muted-foreground">
            Fill in details to create a new training program.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Program Information</CardTitle>
              <CardDescription>
                Core fields for training program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{form.name.length}/100</span>
                </div>
                <Input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Enter training program name"
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{form.version.length}/20</span>
                </div>
                <Input
                  value={form.version}
                  onChange={(event) => handleChange("version", event.target.value)}
                  placeholder="e.g. 1.0.0"
                  maxLength={20}
                />
                {errors.version && <p className="text-sm text-red-500">{errors.version}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Description</label>
                  <span className="text-xs text-muted-foreground">{form.description.length}/500</span>
                </div>
                <Textarea
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  placeholder="Enter training program description"
                  rows={7}
                  maxLength={300}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Choose or search a course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={courseKeyword}
                  onChange={(event) => setCourseKeyword(event.target.value)}
                  placeholder="Choose or Search a Course"
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md h-96 overflow-y-auto">
                {isCourseLoading ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">
                    Loading courses...
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">
                    No courses available
                  </div>
                ) : (
                  availableCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => addCourse(course)}
                      className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-accent transition"
                    >
                      <p className="text-sm font-medium">[{course.code}] - {course.name}</p>
                      <p className="text-xs text-muted-foreground">Level: {course.level || "-"}</p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Selected Courses</CardTitle>
              <CardDescription>{selectedCourses.length} course(s) selected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={selectedKeyword}
                  onChange={(event) => setSelectedKeyword(event.target.value)}
                  placeholder="Search selected courses"
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md h-96 overflow-y-auto p-2 space-y-2">
                {filteredSelectedCourses.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">
                    No courses selected
                  </div>
                ) : (
                  filteredSelectedCourses.map((course) => (
                    <div key={course.id} className="border rounded-md p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">[{course.code}]</p>
                          <p className="text-sm">{course.name}</p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {course.level || "-"}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCourse(course.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Note: Current backend create API does not accept courseIds yet. Selected courses are for UI preparation.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/programs")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
