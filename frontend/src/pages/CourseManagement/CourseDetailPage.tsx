import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { courseApi } from "@/api/courseApi";
import { CourseDetail } from "./components/CourseDetail";
import { toast } from "sonner";
import MainHeader from "@/components/layout/MainHeader";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCourse();
  }, [id]);

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

  return (
    <MainLayout pathName={id ? { [id]: "Detail" } : undefined}>
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
