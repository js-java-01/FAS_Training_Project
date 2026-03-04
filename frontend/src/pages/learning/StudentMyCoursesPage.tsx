import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { enrollmentApi, type EnrolledCourse } from "@/api/enrollmentApi";
import type { Course, CourseLevel } from "@/types/course";
import {
  BookOpen,
  User,
  Globe,
  Clock,
  Search,
  Wifi,
  X,
  Play,
} from "lucide-react";
import { StudentLayout } from "@/components/layout/StudentLayout";

// ─── Gradient palettes ────────────────────────────────────────────────────────
const CARD_GRADIENTS = [
  "from-teal-400 to-cyan-500",
  "from-blue-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-violet-500",
  "from-orange-400 to-amber-500",
  "from-green-400 to-emerald-500",
];
function getGradient(idx: number) {
  return CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
}

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};
const LEVEL_COLORS: Record<CourseLevel, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  ADVANCED: "bg-red-100 text-red-700",
};

// ─── Course Card ──────────────────────────────────────────────────────────────
function MyCourseCard({ course, index }: { course: Course; index: number }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/learn/${course.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div
        className={`relative h-36 bg-linear-to-br ${getGradient(index)} p-4`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-4 w-16 h-16 border-4 border-white rounded-xl rotate-12" />
          <div className="absolute bottom-2 right-4 w-10 h-10 border-4 border-white rounded-full" />
          <div className="absolute top-8 right-8 w-8 h-8 border-4 border-white rotate-45" />
        </div>
        <span className="relative z-10 inline-flex items-center gap-1 bg-blue-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          <Wifi className="w-3 h-3" />
          {course.courseCode}
        </span>
        {/* Play hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/25 backdrop-blur-sm rounded-full p-3">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Body */}
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
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {course.level && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level]}`}
            >
              {LEVEL_LABELS[course.level]}
            </span>
          )}
          {course.estimatedTime && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {course.estimatedTime}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentMyCoursesPage() {
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<CourseLevel | "ALL">("ALL");

  useEffect(() => {
    enrollmentApi
      .getMyEnrolledCourses()
      .then((data: EnrolledCourse[]) =>
        setEnrolled(data.map((e) => e.course).filter(Boolean)),
      )
      .catch(() => setEnrolled([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enrolled.filter((c) => {
      const matchSearch =
        !q ||
        c.courseName.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        (c.trainerName ?? "").toLowerCase().includes(q);
      const matchLevel = levelFilter === "ALL" || c.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [enrolled, search, levelFilter]);

  const levels: (CourseLevel | "ALL")[] = [
    "ALL",
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
  ];
  const levelLabels: Record<CourseLevel | "ALL", string> = {
    ALL: "Tất cả",
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
  };

  return (
    <StudentLayout active="/student-my-courses">
      {/* ── Header banner ───────────────────────────────────────────────── */}
      <div className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            My Courses
          </h1>
          <p className="mt-1 text-blue-200 text-sm">
            Tất cả các khóa học bạn đã đăng ký
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Search & filter bar ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên khóa học, mã, giảng viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Level filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {levels.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevelFilter(lv)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    levelFilter === lv
                      ? "bg-blue-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {levelLabels[lv]}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="mt-3 text-xs text-gray-500">
            {loading ? (
              "Đang tải..."
            ) : (
              <>
                Hiển thị{" "}
                <span className="font-semibold text-blue-800">
                  {filtered.length}
                </span>{" "}
                / {enrolled.length} khóa học
              </>
            )}
          </p>
        </div>

        {/* ── Course grid ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-52 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            {enrolled.length === 0 ? (
              <>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Bạn chưa đăng ký khóa học nào
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  Hãy khám phá và đăng ký khóa học để bắt đầu học tập.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-blue-900 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Khám phá khóa học
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Không tìm thấy kết quả phù hợp
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setLevelFilter("ALL");
                  }}
                  className="text-sm text-blue-800 hover:underline font-medium"
                >
                  Xoá bộ lọc
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((course, i) => (
              <MyCourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
