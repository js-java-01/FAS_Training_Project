import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { courseApi } from "@/api/courseApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import { courseOnlineFeedbackApi } from "@/api/courseOnlineFeedbackApi";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Course } from "@/types/course";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StarRating as InteractiveStarRating } from '@/pages/course/components/material/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Loader2,
  X,
  Award,
  Play,
  Edit2,
  Trash2,
  FileText,
  Target,
  MessageSquare,
  Home,
  ChevronRight,
  Users,
} from "lucide-react";

// ── Learning Outcomes (Generic) ───────────────────────────────────────────────
const LEARNING_OUTCOMES = [
  "Understand core concepts and terminology of the subject",
  "Apply practical skills to real-world scenarios",
  "Build projects from scratch with confidence",
  "Debug, test and optimize solutions effectively",
  "Collaborate using modern development workflows",
  "Prepare for professional assessments and certifications",
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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [_objectives, setObjectives] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // Feedback form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  // Edit feedback state
  const [editingFeedback, setEditingFeedback] = useState<any>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete feedback state
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch feedbacks
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['courseFeedbacks', id],
    queryFn: () => id ? courseOnlineFeedbackApi.getByCourse(id) : Promise.reject('No course ID'),
    enabled: !!id,
  });

  // Submit feedback mutation
  const submitMutation = useMutation({
    mutationFn: courseOnlineFeedbackApi.create,
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã đánh giá khóa học!');
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['courseFeedbacks', id] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi gửi đánh giá!';
      toast.error(errorMessage);
      console.error('Feedback submission error:', error.response?.data);
    }
  });

  // Update feedback mutation
  const updateMutation = useMutation({
    mutationFn: courseOnlineFeedbackApi.update,
    onSuccess: () => {
      toast.success('Cập nhật đánh giá thành công!');
      setShowEditModal(false);
      setEditingFeedback(null);
      queryClient.invalidateQueries({ queryKey: ['courseFeedbacks', id] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi cập nhật!';
      toast.error(errorMessage);
    }
  });

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: courseOnlineFeedbackApi.delete,
    onSuccess: () => {
      toast.success('Xóa đánh giá thành công!');
      setShowDeleteConfirm(false);
      setDeletingFeedbackId(null);
      queryClient.invalidateQueries({ queryKey: ['courseFeedbacks', id] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi xóa!';
      toast.error(errorMessage);
    }
  });

  const handleSubmitFeedback = () => {
    if (!id) return;
    submitMutation.mutate({
      courseOnlineId: id,
      rating,
      comment,
    });
  };

  const handleEditFeedback = (feedback: any) => {
    setEditingFeedback(feedback);
    setEditRating(feedback.rating);
    setEditComment(feedback.comment || '');
    setShowEditModal(true);
  };

  const handleUpdateFeedback = () => {
    if (!editingFeedback?.id) return;
    updateMutation.mutate({
      id: editingFeedback.id,
      data: {
        rating: editRating,
        comment: editComment,
      }
    });
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    setDeletingFeedbackId(feedbackId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deletingFeedbackId) return;
    deleteMutation.mutate(deletingFeedbackId);
  };

  // Check if feedback belongs to current user (compare first name)
  const isOwnFeedback = (feedback: any) => {
    return feedback.studentName === user?.firstName;
  };

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
  
  // Calculate real average rating from feedback data
  const feedbacks = feedbackData?.content || [];
  const avgRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbacks.length 
    : 0;
  const reviewCount = feedbacks.length;
  const studentCount = reviewCount * 14; // Estimated student count

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

              {/* META */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(avgRating)} />
                    <span className="text-gray-500 text-xs">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}

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

                {/* ── Outcomes ── */}
                {activeTab === "outcomes" && (
                  <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    What you'll learn
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {LEARNING_OUTCOMES.map((outcome, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle
                          size={16}
                          className="text-green-500 shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-gray-700">{outcome}</span>
                      </div>
                    ))}
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

                {/* ── Reviews ── */}
                {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* ─── FORM GỬI ĐÁNH GIÁ ─── */}
                  <div className="bg-slate-50 p-6 rounded-lg border">
                    <h4 className="font-semibold mb-4">Để lại đánh giá của bạn</h4>
                    <div className="mb-4">
                      <InteractiveStarRating rating={rating} setRating={setRating} />
                    </div>
                    <Textarea 
                      placeholder="Khóa học này như thế nào? Giảng viên dạy dễ hiểu không?" 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mb-4"
                      rows={3}
                    />
                    <Button 
                      onClick={handleSubmitFeedback} 
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </Button>
                  </div>

                  {/* ─── THỐNG KÊ ĐÁNH GIÁ ─── */}
                  {avgRating > 0 && (
                    <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-center shrink-0">
                        <div className="text-4xl font-bold text-gray-900">
                          {avgRating.toFixed(1)}
                        </div>
                        <StarRating rating={Math.round(avgRating)} />
                        <div className="text-xs text-gray-400 mt-1">
                          Course Rating
                        </div>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = feedbacks.filter((f: any) => f.rating === star).length;
                          const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
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
                  )}

                  {/* ─── DANH SÁCH ĐÁNH GIÁ ─── */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Learner Reviews
                    </h2>
                    {feedbackLoading ? (
                      <div className="flex items-center justify-center py-8 text-gray-400">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Đang tải đánh giá...
                      </div>
                    ) : feedbacks.length === 0 ? (
                      <p className="text-gray-500 italic py-8 text-center">
                        Chưa có đánh giá nào cho khóa học này. Hãy là người đầu tiên đánh giá!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {feedbacks.map((feedback: any) => (
                          <div
                            key={feedback.id}
                            className="border border-gray-100 rounded-xl p-4 bg-white"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-linear-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold">
                                    {feedback.studentName?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-sm text-gray-900">
                                    {feedback.studentName || 'Học viên ẩn danh'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString('vi-VN') : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRating rating={feedback.rating} />
                                {isOwnFeedback(feedback) && (
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => handleEditFeedback(feedback)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Sửa đánh giá"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFeedback(feedback.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Xóa đánh giá"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {feedback.comment && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {feedback.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
              )}
              </div>
            </div>
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

      {/* Edit Feedback Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Chỉnh sửa đánh giá</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Đánh giá của bạn
                </label>
                <InteractiveStarRating rating={editRating} setRating={setEditRating} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Nhận xét
                </label>
                <Textarea 
                  placeholder="Chia sẻ trải nghiệm của bạn..." 
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleUpdateFeedback} 
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-red-600 to-red-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Xác nhận xóa</h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmDelete} 
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
