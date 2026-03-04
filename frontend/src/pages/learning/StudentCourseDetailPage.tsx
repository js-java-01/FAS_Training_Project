import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { courseApi } from "@/api/courseApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Loader2,
  X,
  Award,
  Play,
  Home,
  ChevronRight,
  FileText,
  Target,
  MessageSquare,
} from "lucide-react";
import type { CourseObjective } from "@/types/courseObjective";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_OUTCOMES = [
  "Understand core concepts and terminology of the subject",
  "Apply practical skills to real-world scenarios",
  "Build projects from scratch with confidence",
  "Debug, test and optimize solutions effectively",
  "Collaborate using modern development workflows",
  "Prepare for professional assessments and certifications",
];

interface MockReview {
  name: string;
  rating: number;
  comment: string;
  date: string;
}
const MOCK_REVIEWS: MockReview[] = [
  {
    name: "Nguyen Van A",
    rating: 5,
    comment:
      "Excellent course! Very well structured and easy to follow. I learned so much from this.",
    date: "Jan 2026",
  },
  {
    name: "Tran Thi B",
    rating: 4,
    comment:
      "Great content overall. Some sections could be explained in more detail, but very helpful.",
    date: "Dec 2025",
  },
  {
    name: "Le Van C",
    rating: 5,
    comment:
      "The instructor explains everything clearly. Highly recommend this course to beginners.",
    date: "Nov 2025",
  },
  {
    name: "Pham Thi D",
    rating: 4,
    comment:
      "Solid foundation course. I built 3 projects by the end and feel much more confident.",
    date: "Oct 2025",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
          }
        />
      ))}
    </div>
  );
}

// ── Enroll Modal ──────────────────────────────────────────────────────────────
interface ConfirmEnrollModalProps {
  course: Course;
  onClose: () => void;
  onEnrolled: () => void;
}

function ConfirmEnrollModal({
  course,
  onClose,
  onEnrolled,
}: ConfirmEnrollModalProps) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollmentApi.enroll(course.id);
      toast.success(`Enrolled in ${course.courseName} successfully!`);
      onEnrolled();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        "Enrollment failed";
      toast.error(String(msg));
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-r from-blue-700 to-indigo-600 px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">
              Confirm Enrollment
            </h2>
            <p className="text-blue-100 text-sm line-clamp-1">
              {course.courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Course summary:
            </p>
            {(
              [
                ["Course", course.courseName],
                course.level ? ["Level", course.level] : null,
                course.estimatedTime
                  ? [
                    "Duration",
                    `${Math.round(course.estimatedTime / 60)} hours`,
                  ]
                  : null,
                ["Price", course.price ? "Paid" : "Free"],
              ] as ([string, string] | null)[]
            )
              .filter((x): x is [string, string] => x !== null)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {enrolling ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Confirm Enrollment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = "about" | "outcomes" | "modules" | "reviews";
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "about", label: "About", icon: <FileText size={14} /> },
  { key: "outcomes", label: "Outcomes", icon: <Target size={14} /> },
  { key: "modules", label: "Modules", icon: <BookOpen size={14} /> },
  { key: "reviews", label: "Reviews", icon: <MessageSquare size={14} /> },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [objectives, setObjectives] = useState<CourseObjective[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  useEffect(() => {
    if (!id) return;
    Promise.all([
      courseApi.getCourseById(id),
      enrollmentApi.getMyEnrolledCourses().catch(() => []),
      courseApi.getObjectivesByCourse(id),
      courseApi.getLessonsByCourse(id),
    ])
      .then(([courseData, enrolled, objectivesData, lessonsData]) => {
        setCourse(courseData);
        setObjectives(objectivesData);
        setLessons(lessonsData);

        const match = enrolled.find((ec) => ec?.course?.id === id);
        if (match) setIsEnrolled(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnrolled = () => {
    setShowEnrollModal(false);
    setIsEnrolled(true);
    navigate(`/learn/${id}`);
  };

  if (loading) {
    return (
      <StudentLayout active="/courses">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm">Loading course...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!course) return null;

  const hours = course.estimatedTime
    ? Math.round(course.estimatedTime / 60)
    : null;
  const avgRating = 4.7;
  const reviewCount = MOCK_REVIEWS.length * 198;
  const studentCount = reviewCount * 14;

  return (
    <StudentLayout active="/courses">
      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 ml-16">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-sm text-gray-500">
          <button
            onClick={() => navigate("/student-home")}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Home size={13} />
            Home
          </button>
          <ChevronRight size={13} className="text-gray-300" />
          <button
            onClick={() => navigate(-1)}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            All Courses
          </button>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-800 font-medium truncate max-w-xs">
            {course.courseName}
          </span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Decorative arc */}
        <div className="absolute right-0 top-0 h-full w-1/3 pointer-events-none">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full opacity-20"
          >
            <path
              d="M320 40 A240 240 0 0 1 360 280"
              stroke="#93c5fd"
              strokeWidth="48"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M280 20 A280 280 0 0 1 390 320"
              stroke="#bfdbfe"
              strokeWidth="32"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M340 80 A200 200 0 0 1 340 300"
              stroke="#dbeafe"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
          {/* Topic badge */}
          {course.topic && (
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
              {course.topic}
            </p>
          )}

          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3 max-w-2xl">
            {course.courseName}
          </h1>

          {course.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5 max-w-2xl line-clamp-3">
              {course.description}
            </p>
          )}

          {course.trainerName && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                {course.trainerName[0]}
              </div>
              <span>
                Instructor:{" "}
                <span className="font-semibold text-blue-700 underline cursor-pointer">
                  {course.trainerName}
                </span>
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <button
              onClick={() =>
                isEnrolled ? navigate(`/learn/${id}`) : setShowEnrollModal(true)
              }
              className={`px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${isEnrolled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
                }`}
            >
              {isEnrolled ? (
                <>
                  <Play size={15} /> Continue Learning
                </>
              ) : (
                "Go To Course"
              )}
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {studentCount.toLocaleString()} already enrolled
            </span>
          </div>

          {/* Stats strip */}
          <div className="bg-white border border-gray-200 rounded-xl mt-6 shadow-sm mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
              {/* Rating */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-gray-900 text-sm">
                    {avgRating}
                  </span>
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-xs text-gray-500">
                  from {reviewCount.toLocaleString()} reviews
                </p>
              </div>

              {/* Level */}
              <div className="px-5 py-4">
                <p className="font-bold text-gray-900 text-sm mb-0.5">
                  {course.level
                    ? course.level.charAt(0) +
                    course.level.slice(1).toLowerCase()
                    : "All levels"}
                </p>
                <p className="text-xs text-gray-500">
                  {course.level === "BEGINNER"
                    ? "No prior experience required"
                    : "Some experience helpful"}
                </p>
              </div>

              {/* Hours */}
              {hours && (
                <div className="px-5 py-4">
                  <p className="font-bold text-gray-900 text-sm mb-0.5">
                    {hours} hours
                  </p>
                  <p className="text-xs text-gray-500">Estimated duration</p>
                </div>
              )}

              {/* Schedule */}
              <div className="px-5 py-4">
                <p className="font-bold text-gray-900 text-sm mb-0.5">
                  Flexible
                </p>
                <p className="text-xs text-gray-500">Learn at your own pace</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── Left: Tabs ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Tab nav — pill style */}
              <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="animate-in fade-in duration-200">
                {/* About */}
                {activeTab === "about" && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-blue-500" />
                        <h2 className="text-base font-bold text-gray-900">
                          About this course
                        </h2>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {course.description ||
                          "This course provides a comprehensive introduction to the subject matter. You will gain practical skills and theoretical knowledge through a structured learning path designed by expert instructors."}
                      </p>
                    </div>

                    {(course.minGpaToPass ||
                      course.minAttendancePercent !== undefined ||
                      course.allowFinalRetake !== undefined) && (
                        <div className="grid grid-cols-3 gap-3">
                          {course.minGpaToPass && (
                            <div className="bg-white rounded-2xl p-5 border border-blue-100 text-center shadow-sm">
                              <div className="text-3xl font-extrabold text-blue-600 mb-1">
                                {course.minGpaToPass}
                              </div>
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Min GPA
                              </div>
                            </div>
                          )}
                          {course.minAttendancePercent !== undefined && (
                            <div className="bg-white rounded-2xl p-5 border border-emerald-100 text-center shadow-sm">
                              <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                                {course.minAttendancePercent}%
                              </div>
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Attendance
                              </div>
                            </div>
                          )}
                          {course.allowFinalRetake !== undefined && (
                            <div className="bg-white rounded-2xl p-5 border border-purple-100 text-center shadow-sm">
                              <div className="text-3xl font-extrabold text-60 mb-1">
                                {course.allowFinalRetake ? "Yes" : "No"}
                              </div>
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Final Retake
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* Outcomes */}
                {activeTab === "outcomes" && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Target size={16} className="text-emerald-500" />
                        <h2 className="text-base font-bold text-gray-900">
                          What you'll learn
                        </h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {objectives.length === 0 ? (
                          <p className="text-sm text-gray-500">No outcomes available.</p>
                        ) : (
                          objectives.map((obj) => (
                            <div key={obj.id} className="flex items-start gap-3">
                              <CheckCircle
                                size={16}
                                className="text-green-500 shrink-0 mt-0.5"
                              />
                              <span className="text-sm text-gray-700">
                                {obj.description}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="p-5 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-start gap-4 text-white shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Award size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-base mb-1">
                          Earn a Certificate of Completion
                        </p>
                        <p className="text-sm text-blue-100/90 leading-relaxed">
                          Upon successfully completing this course and meeting
                          all requirements, you'll receive an official
                          certificate to share on your professional profile.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modules */}
                {activeTab === "modules" && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-500" />
                        <div>
                          <h2 className="text-base font-bold text-gray-900">
                            Course Content
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {lessons.length} lessons · Approx. {hours ?? "—"} hours total
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full border border-blue-100">
                          31 lessons
                        </span>
                      </div>
                    </div>
                    {/* Module list */}
                    <div className="divide-y divide-gray-50">
                      {lessons.length === 0 ? (
                        <p className="text-sm text-gray-500 px-6 py-4">
                          No modules available.
                        </p>
                      ) : (
                        lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {lesson.lessonName}
                              </p>

                              {lesson.description && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {lesson.description}
                                </p>
                              )}

                              {lesson.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                  <Clock size={11} />
                                  {lesson.duration} mins
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {/* Rating overview */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <MessageSquare size={16} className="text-yellow-500" />
                        <h2 className="text-base font-bold text-gray-900">
                          Student Reviews
                        </h2>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center shrink-0 w-24">
                          <div className="text-5xl font-extrabold text-gray-900 leading-none mb-2">
                            {avgRating}
                          </div>
                          <StarRating
                            rating={Math.round(avgRating)}
                            size={15}
                          />
                          <div className="text-xs text-gray-400 mt-1.5">
                            Course Rating
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const pct =
                              star === 5
                                ? 68
                                : star === 4
                                  ? 22
                                  : star === 3
                                    ? 6
                                    : star === 2
                                      ? 3
                                      : 1;
                            return (
                              <div
                                key={star}
                                className="flex items-center gap-2.5"
                              >
                                <span className="text-xs text-gray-500 w-3 text-right shrink-0">
                                  {star}
                                </span>
                                <Star
                                  size={10}
                                  className="text-yellow-400 fill-yellow-400 shrink-0"
                                />
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                  <div
                                    className="bg-yellow-400 h-1.5 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-7 text-right shrink-0">
                                  {pct}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Review cards */}
                    <div className="space-y-3">
                      {MOCK_REVIEWS.map((review, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {review.name[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-gray-900">
                                  {review.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {review.date}
                                </div>
                              </div>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* animate-in */}
            </div>
            {/* flex-1 left col */}

            {/* ── Right: Sidebar ─────────────────────────────────────── */}
            <div className="lg:w-72 xl:w-80 shrink-0 space-y-4 lg:sticky lg:top-6">
              {/* CTA card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-linear-to-br from-blue-600 to-indigo-600 px-5 py-4">
                  <p className="text-white font-bold text-base mb-0.5">
                    Ready to start?
                  </p>
                  <p className="text-blue-100 text-xs">
                    Join thousands of learners today
                  </p>
                </div>
                <div className="p-5">
                  <button
                    onClick={() =>
                      isEnrolled
                        ? navigate(`/learn/${id}`)
                        : setShowEnrollModal(true)
                    }
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${isEnrolled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                      }`}
                  >
                    {isEnrolled ? (
                      <>
                        <Play size={14} /> Continue Learning
                      </>
                    ) : (
                      <>
                        <Play size={14} /> Go To Course
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    {studentCount.toLocaleString()} already enrolled
                  </p>
                </div>
              </div>

              {/* Course includes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-sm text-gray-900 mb-3">
                  This course includes
                </p>
                <ul className="space-y-2.5">
                  {[
                    {
                      icon: <Play size={14} className="text-blue-500" />,
                      label: "On-demand video lectures",
                    },
                    {
                      icon: <FileText size={14} className="text-indigo-500" />,
                      label: "Downloadable resources",
                    },
                    {
                      icon: <BookOpen size={14} className="text-emerald-500" />,
                      label: "Practical exercises",
                    },
                    {
                      icon: <Award size={14} className="text-yellow-500" />,
                      label: "Certificate of completion",
                    },
                    {
                      icon: <Clock size={14} className="text-gray-400" />,
                      label: "Full lifetime access",
                    },
                  ].map(({ icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 text-sm text-gray-600"
                    >
                      {icon}
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              {course.topic && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="font-bold text-sm text-gray-900 mb-3">
                    Skills you'll gain
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      course.topic,
                      "Problem Solving",
                      "Best Practices",
                      "Real-world Projects",
                      "Collaboration",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-100 font-medium px-2.5 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor mini card */}
              {course.trainerName && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="font-bold text-sm text-gray-900 mb-3">
                    Your instructor
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base shrink-0">
                      {course.trainerName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {course.trainerName}
                      </p>
                      <p className="text-xs text-gray-400">Course Instructor</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* sidebar */}
          </div>
          {/* flex-row */}
        </div>
        {/* max-w-7xl */}
      </div>
      {/* bg-gray-50 */}

      {showEnrollModal && course && (
        <ConfirmEnrollModal
          course={course}
          onClose={() => setShowEnrollModal(false)}
          onEnrolled={handleEnrolled}
        />
      )}
    </StudentLayout>
  );
}
