import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { enrollmentApi, type EnrolledCourse } from "@/api/enrollmentApi";
import { courseApi } from "@/api/courseApi";
import type { Course } from "@/types/course";
import {
  BookOpen,
  GraduationCap,
  User,
  Clock,
  ArrowRight,
  Wifi,
  Megaphone,
  FileText,
  Layers,
  Bell,
} from "lucide-react";
import { StudentLayout } from "@/components/layout/StudentLayout";

// ─── Gradient palettes for course cards ──────────────────────────────────────
const CARD_GRADIENTS = [
  "from-teal-400 to-cyan-500",
  "from-blue-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-violet-500",
  "from-orange-400 to-amber-500",
  "from-green-400 to-emerald-500",
];

function getGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

// ─── Mock notifications ───────────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    id: 1,
    icon: <Megaphone size={22} />,
    title: "Thông báo lịch học kỳ mới",
    body: "Kỳ học mới bắt đầu từ ngày 10/03/2026. Vui lòng kiểm tra thời khoá biểu của bạn.",
    time: "2 giờ trước",
  },
  {
    id: 2,
    icon: <FileText size={22} />,
    title: "Nhắc nhở nộp bài tập",
    body: "Bạn có 2 bài tập sắp đến hạn nộp trong tuần này.",
    time: "5 giờ trước",
  },
  {
    id: 3,
    icon: <GraduationCap size={22} />,
    title: "Kết quả học tập",
    body: "Kết quả học tập kỳ trước đã được cập nhật. Hãy kiểm tra điểm của bạn.",
    time: "1 ngày trước",
  },
];

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({
  course,
  index,
  isOnline,
}: {
  course: Course;
  index: number;
  isOnline?: boolean;
}) {
  const navigate = useNavigate();
  const gradient = getGradient(index);

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`relative h-36 bg-linear-to-br ${gradient} p-4`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-4 w-16 h-16 border-4 border-white rounded-xl rotate-12" />
          <div className="absolute bottom-2 right-4 w-10 h-10 border-4 border-white rounded-full" />
          <div className="absolute top-8 right-8 w-8 h-8 border-4 border-white rotate-45" />
        </div>
        <span className="relative z-10 inline-flex items-center gap-1 bg-blue-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {isOnline && <Wifi className="w-3 h-3" />}
          {course.courseCode}
        </span>
        {isOnline && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/30">
            Online
          </span>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-sm font-semibold text-blue-800 group-hover:text-blue-900 line-clamp-2 leading-snug">
          {course.courseName}
        </h4>
        {course.trainerName && (
          <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {course.trainerName}
          </p>
        )}
        {course.estimatedTime && (
          <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.estimatedTime}h
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentHomePage() {
  const { firstName, lastName, email } = useSelector(
    (state: RootState) => state.auth,
  );

  const [semesterCourses, setSemesterCourses] = useState<Course[]>([]);
  const [onlineCourses, setOnlineCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;

  useEffect(() => {
    async function loadData() {
      try {
        const [enrolled, pageResult] = await Promise.all([
          enrollmentApi
            .getMyEnrolledCourses()
            .catch(() => [] as EnrolledCourse[]),
          courseApi.getCourses({ status: "ACTIVE", size: 20 }).catch(() => ({
            items: [] as Course[],
            pagination: {
              page: 0,
              pageSize: 20,
              totalPages: 0,
              totalElements: 0,
            },
          })),
        ]);

        const enrolledList: Course[] = enrolled
          .map((e) => e.course)
          .filter(Boolean);
        setOnlineCourses(enrolledList);

        const enrolledIds = new Set(enrolledList.map((c) => c.id));
        const semester = pageResult.items.filter((c) => !enrolledIds.has(c.id));
        setSemesterCourses(semester.slice(0, 8));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <StudentLayout active="/student-home">
      {/* ── Hero / Greeting ───────────────────────────────────────────────── */}
      <div className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold">
            Xin chào, {firstName || fullName}! 👋
          </h1>
          <p className="mt-1 text-blue-100 text-sm">
            Chào mừng bạn quay trở lại hệ thống học tập FPT University
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/student-my-courses"
              className="inline-flex items-center gap-2 bg-white text-blue-800 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              Tiếp tục học
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
            >
              Khám phá khóa học
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── Notifications ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-700" />
              Thông báo
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-4">
                <span className="text-2xl shrink-0 mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {n.body}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                  {n.time}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Semester Courses ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-700" />
              Khóa học trong kỳ
            </h2>
            <Link
              to="/courses"
              className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-52 animate-pulse border border-gray-100"
                />
              ))}
            </div>
          ) : semesterCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Chưa có khóa học nào trong kỳ này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {semesterCourses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── Online Enrolled Courses ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-700" />
              Khóa học đã đăng ký Online
            </h2>
            <Link
              to="/student-my-courses"
              className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-52 animate-pulse border border-gray-100"
                />
              ))}
            </div>
          ) : onlineCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <Wifi className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Bạn chưa đăng ký khóa học online nào.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-blue-900 transition-colors mt-4"
              >
                <BookOpen className="w-4 h-4" />
                Khám phá khóa học
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {onlineCourses.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i + 2}
                  isOnline
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentLayout>
  );
}
