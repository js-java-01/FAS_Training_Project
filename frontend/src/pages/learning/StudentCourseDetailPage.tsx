import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { courseApi } from "@/api/courseApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import {
  ChevronLeft,
  BookOpen,
  Clock,
  User,
  Star,
  Users,
  CheckCircle,
  Loader2,
  X,
  Award,
  BarChart2,
  Video,
  FileText,
  Infinity,
  ShoppingCart,
  Play,
} from "lucide-react";

// ── Mocked outcomes & reviews (since backend doesn't have these yet) ──────────
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
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  ADVANCED: "bg-red-100 text-red-700",
};

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmtPrice(price?: number, discount?: number) {
  if (!price) return "Free";
  const final = discount ? price * (1 - discount / 100) : price;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(final);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
          }
        />
      ))}
    </div>
  );
}

// ── Enroll Modal (Direct Course Enrollment Confirmation) ──────────────────────
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Confirm Enrollment</h2>
            <p className="text-blue-100 text-sm mt-0.5">{course.courseName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              You are about to enroll in:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Course</span>
                <span className="font-medium text-gray-800">
                  {course.courseName}
                </span>
              </div>
              {course.level && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Level</span>
                  <span>{course.level}</span>
                </div>
              )}
            </div>
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
const TABS: { key: Tab; label: string }[] = [
  { key: "about", label: "About" },
  { key: "outcomes", label: "Outcomes" },
  { key: "modules", label: "Modules" },
  { key: "reviews", label: "Reviews" },
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

  useEffect(() => {
    if (!id) return;
    // Load course + enrollment status in parallel
    Promise.all([
      courseApi.getCourseById(id),
      enrollmentApi.getMyEnrolledCourses().catch(() => []),
    ])
      .then(([courseData, enrolled]) => {
        setCourse(courseData);
        const match = enrolled.find((ec) => ec?.course?.id === id);
        if (match) setIsEnrolled(true);
      })
      .catch(() => {
        toast.error("Failed to load course");
        navigate("/courses");
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
      <MainLayout>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={24} />
          Loading course...
        </div>
      </MainLayout>
    );
  }

  if (!course) return null;

  const hours = course.estimatedTime
    ? Math.round(course.estimatedTime / 60)
    : null;
  const avgRating = 4.7;
  const reviewCount = MOCK_REVIEWS.length * 198; // mock count

  return (
    <MainLayout pathName={{ [id!]: course.courseName }}>
      <div className="flex justify-end py-3">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 transition cursor-pointer border border-gray-200 rounded-lg px-2 py-1"
        >
          <ChevronLeft size={16} />
          All Courses
        </button>
      </div>

      <div className="min-h-full">
        <div className="bg-white border border-gray-200 shadow-sm rounded-md">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold text-blue-600 tracking-widest mb-2">
                {course.courseCode}
              </p>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {course.courseName}
              </h1>

              {course.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>
              )}

              {/* TRAINER */}
              {course.trainerName && (
                <p className="text-sm text-gray-600 mb-6">
                  Created by{" "}
                  <span className="font-semibold text-gray-900">
                    {course.trainerName}
                  </span>
                </p>
              )}

              {/* PRICE + CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-4">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {fmtPrice(course.price, course.discount)}
                  </span>

                  {course.price && course.discount && (
                    <span className="text-sm text-gray-400 line-through">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(course.price)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    isEnrolled
                      ? navigate(`/learn/${id}`)
                      : setShowEnrollModal(true)
                  }
                  className={
                    isEnrolled
                      ? "px-8 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-95 transition shadow-md hover:shadow-lg flex items-center gap-2"
                      : "px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition shadow-md hover:shadow-lg"
                  }
                >
                  {isEnrolled ? (
                    <>
                      <Play size={16} />
                      Continue Learning
                    </>
                  ) : (
                    "Enroll now"
                  )}
                </button>
              </div>

              {/* META */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900">{avgRating}</span>
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-gray-500 text-xs">
                    ({reviewCount} reviews)
                  </span>
                </div>

                <span className="flex items-center gap-1 text-gray-500">
                  <Users size={14} />
                  {(reviewCount * 14).toLocaleString()} students
                </span>

                {hours && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} />
                    {hours} hours
                  </span>
                )}

                {course.level && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    {course.level}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────── */}
        <div className="bg-white my-3">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-8 py-3 overflow-x-auto text-md">
              <div className="shrink-0 flex items-center gap-2 text-sm text-gray-600">
                <BookOpen size={17} className="text-blue-500" />
                <span className="font-semibold text-gray-800">4</span> modules
              </div>
              <div className="shrink-0 flex items-center gap-2 text-sm text-gray-600">
                <Star size={17} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-800">{avgRating}</span>
                <span className="text-gray-400 text-xs">
                  ({reviewCount.toLocaleString()} reviews)
                </span>
              </div>
              {course.level && (
                <div className="shrink-0 flex items-center gap-2 text-sm text-gray-600">
                  <BarChart2 size={17} className="text-blue-500" />
                  <span className="font-semibold text-gray-800 capitalize">
                    {course.level.charAt(0) +
                      course.level.slice(1).toLowerCase()}
                  </span>{" "}
                  level
                </div>
              )}
              {hours !== null && (
                <div className="shrink-0 flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={17} className="text-blue-500" />
                  Approx.{" "}
                  <span className="font-semibold text-gray-800">{hours}h</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 mb-3">
          {/* Tab nav */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ── About ── */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      About this course
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {course.description ||
                        "This course provides a comprehensive introduction to the subject matter. You will gain practical skills and theoretical knowledge through a structured learning path designed by expert instructors."}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {course.minGpaToPass && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                        <div className="text-2xl font-bold text-blue-700 mb-1">
                          {course.minGpaToPass}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min GPA to Pass
                        </div>
                      </div>
                    )}
                    {course.minAttendancePercent && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                        <div className="text-2xl font-bold text-green-700 mb-1">
                          {course.minAttendancePercent}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Min Attendance
                        </div>
                      </div>
                    )}
                    {course.allowFinalRetake !== undefined && (
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                        <div className="text-2xl font-bold text-purple-700 mb-1">
                          {course.allowFinalRetake ? "Yes" : "No"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Final Retake
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Outcomes ── */}
              {activeTab === "outcomes" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    What you'll learn
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {MOCK_OUTCOMES.map((outcome, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle
                          size={16}
                          className="text-green-500 shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{outcome}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Award
                      size={18}
                      className="text-blue-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">
                        Earn a Certificate
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Upon successful completion, you will earn a certificate
                        that can be shared on your professional profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Modules ── */}
              {activeTab === "modules" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    Course Modules
                  </h2>
                  <p className="text-sm text-gray-500 mb-5">
                    4 modules · Approx. {hours ?? "—"} hours total
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        num: 1,
                        title: "Introduction & Foundations",
                        desc: "Set up your environment and understand the core principles.",
                        duration: "~2 hours",
                        items: 6,
                      },
                      {
                        num: 2,
                        title: "Core Concepts in Depth",
                        desc: "Dive deeper with practical exercises and case studies.",
                        duration: "~3 hours",
                        items: 8,
                      },
                      {
                        num: 3,
                        title: "Applied Skills & Projects",
                        desc: "Build real projects from scratch.",
                        duration: "~4 hours",
                        items: 10,
                      },
                      {
                        num: 4,
                        title: "Advanced Topics & Assessment",
                        desc: "Explore advanced patterns and complete the final assessment.",
                        duration: "~3 hours",
                        items: 7,
                      },
                    ].map((mod) => (
                      <div
                        key={mod.num}
                        className="flex items-start gap-4 border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {mod.num}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-0.5">
                            Module {mod.num}: {mod.title}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {mod.desc}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {mod.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen size={11} />
                              {mod.items} lessons
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Reviews ── */}
              {activeTab === "reviews" && (
                <div>
                  {/* Summary */}
                  <div className="flex items-center gap-6 mb-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-center shrink-0">
                      <div className="text-4xl font-bold text-gray-900">
                        {avgRating}
                      </div>
                      <StarRating rating={Math.round(avgRating)} />
                      <div className="text-xs text-gray-400 mt-1">
                        Course Rating
                      </div>
                    </div>
                    <div className="flex-1">
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
                            className="flex items-center gap-2 mb-1"
                          >
                            <span className="text-xs text-gray-500 w-3">
                              {star}
                            </span>
                            <Star
                              size={10}
                              className="text-yellow-400 fill-yellow-400"
                            />
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-yellow-400 h-1.5 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Learner Reviews
                  </h2>
                  <div className="space-y-3">
                    {MOCK_REVIEWS.map((review, i) => (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-xl p-4 bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
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
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <ConfirmEnrollModal
          course={course}
          onClose={() => setShowEnrollModal(false)}
          onEnrolled={handleEnrolled}
        />
      )}
    </MainLayout>
  );
}
