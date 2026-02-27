import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { courseApi } from "@/api/courseApi";
import { CourseDetail } from "./components/CourseDetail";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import StudentCourseDetailPage from "@/pages/learning/StudentCourseDetailPage";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>();
  const [loading, setLoading] = useState(true);
  const { hasPermission } = usePermissions();
  const isStudentMode = !hasPermission("COURSE_UPDATE");

  useEffect(() => {
    if (id && !isStudentMode) loadCourse();
  }, [id, isStudentMode]);

  const loadCourse = async () => {
    try {
      const data = await courseApi.getCourseById(id!);
      setCourse(data);
    } catch {
      toast.error("Failed to load course detail");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  // Student: render the full student detail view
  if (isStudentMode) return <StudentCourseDetailPage />;

  const courseTitle = course?.courseName ?? "Detail";

  return (
    <MainLayout
      pathName={id ? { courses: "Course", [id]: courseTitle } : undefined}
    >
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (
        <CourseDetail
          course={course}
          onBack={() => navigate("/courses")}
          onRefresh={loadCourse}
        />
      )}
    </MainLayout>
  );
};
export default CourseDetailPage;
