import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { courseApi } from "@/api/courseApi";
import { toast } from "sonner";

import { OutlineTab } from "./OutlineTab";
import CourseObjectivesTab from "./CourseObjectivesTab";
import { TimeAllocationTab } from "./TimeAllocationTab";
import { MaterialTab } from "./material/MaterialTab";
import { CourseAssessmentSchemeTab } from "./CourseAssessmentSchemeTab";
import {
  FiEdit,
  FiBookOpen,
  FiHash,
  FiTag,
  FiBarChart2,
  FiClock,
  FiImage,
  FiCalendar,
  FiUser,
  FiX,
  FiSave,
  FiLayers,
  FiFileText,
  FiUpload,
} from "react-icons/fi";
import { userApi } from "@/api";
import type { User } from "@/types";

type EditForm = {
  courseName: string;
  courseCode: string;
  level?: string;
  estimatedTime?: number;
  status: string;
  description?: string;
  note?: string;
  trainerId?: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

const tabs = [
  "Overview",
  "Assessment Scheme",
  "Outline",
  "Objectives",
  "Materials",
  "Time Allocation",
];

const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function CourseDetail({ course, onBack, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm<EditForm>();

  useEffect(() => {
    userApi
      .getAllUsers({ page: 0, size: 100 })
      .then((res) => setUsers(res?.items ?? []))
      .catch(() => {});
  }, []);

  const startEdit = () => {
    reset({
      courseName: course.courseName ?? "",
      courseCode: course.courseCode ?? "",
      level: course.level ?? "",
      estimatedTime: course.estimatedTime ?? undefined,
      status: course.status ?? "DRAFT",
      description: course.description ?? "",
      note: course.note ?? "",
      trainerId: course.trainerId ?? "",
    });
    setThumbnailPreview(course.thumbnailUrl ?? null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setThumbnailPreview(null);
  };

  const onSubmit = async (data: EditForm) => {
    try {
      setLoading(true);
      const payload: any = {
        courseName: data.courseName,
        courseCode: data.courseCode,
        status: data.status,
      };
      if (data.estimatedTime && !isNaN(data.estimatedTime))
        payload.estimatedTime = Number(data.estimatedTime);
      if (data.level) payload.level = data.level;
      if (data.description) payload.description = data.description;
      if (data.note) payload.note = data.note;
      if (data.trainerId) payload.trainerId = data.trainerId;

      await courseApi.updateCourse(course.id, payload);
      toast.success("Course updated");
      setIsEditing(false);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh tối đa 5MB");
      return;
    }
    setThumbnailPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Details</h1>
          <p className="text-sm text-gray-500">
            Course details management and configuration
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200"
        >
          ← Back to list
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex justify-between items-center border-b mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm transition-all ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" &&
          (isEditing ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center text-sm gap-2 -mt-3 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors"
            >
              <FiX /> Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center text-sm gap-2 -mt-3 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiEdit /> Edit
            </button>
          ))}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div
          key={`${activeTab}-${isEditing}`}
          className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full"
        >
          {/* READ-ONLY */}
          {activeTab === "Overview" && !isEditing && (
            <div>
              <OverviewTab course={course} />
            </div>
          )}
          {/* INLINE EDIT FORM */}
          {activeTab === "Overview" && isEditing && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-700">
                    Basic Information
                  </h2>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-md px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    <FiSave size={13} />
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field icon={<FiBookOpen />} label="Course Name">
                    <input
                      {...register("courseName", { required: true })}
                      className={inputCls}
                    />
                  </Field>
                  <Field icon={<FiHash />} label="Course Code">
                    <input
                      {...register("courseCode", { required: true })}
                      className={inputCls}
                    />
                  </Field>
                  <Field icon={<FiTag />} label="Topic">
                    <input
                      disabled
                      value={course.topic ?? "-"}
                      className={inputCls + " bg-gray-50 text-gray-400"}
                    />
                  </Field>
                </div>
              </div>

              {/* Course Details + Metadata */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 space-y-3">
                  <h2 className="font-semibold text-gray-700">
                    Course Details
                  </h2>

                  <Field icon={<FiLayers />} label="Level">
                    <select
                      {...register("level")}
                      className={inputCls + " bg-white"}
                    >
                      <option value="">Select level</option>
                      {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field icon={<FiBarChart2 />} label="Status">
                    <select
                      {...register("status")}
                      className={inputCls + " bg-white"}
                    >
                      {["DRAFT", "UNDER_REVIEW", "ACTIVE"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field icon={<FiClock />} label="Estimated Time (minutes)">
                    <input
                      type="number"
                      min={0}
                      {...register("estimatedTime", { valueAsNumber: true })}
                      className={inputCls}
                    />
                  </Field>

                  <Field icon={<FiUser />} label="Trainer">
                    <select
                      {...register("trainerId")}
                      className={inputCls + " bg-white"}
                    >
                      <option value="">Select trainer</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Thumbnail */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <FiImage size={13} /> Thumbnail
                    </label>
                    {thumbnailPreview && (
                      <div className="mb-2 relative w-full h-32 rounded-md overflow-hidden border">
                        <img
                          src={thumbnailPreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setThumbnailPreview(null)}
                          className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:bg-red-50"
                        >
                          <FiX size={12} className="text-red-500" />
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 hover:bg-gray-50 cursor-pointer w-full justify-center"
                    >
                      <FiUpload size={14} />
                      Upload Thumbnail
                    </button>
                    <p className="text-xs text-gray-400 mt-1">
                      Chỉ chấp nhận file ảnh, tối đa 5MB
                    </p>
                  </div>
                </div>

                {/* Metadata read-only */}
                <div className="border rounded-lg p-4">
                  <h2 className="font-semibold text-gray-700 mb-4">Metadata</h2>
                  <div className="space-y-4">
                    <InfoRO
                      icon={<FiCalendar />}
                      label="Date Created"
                      value={formatDate(course.createdDate)}
                    />
                    <InfoRO
                      icon={<FiUser />}
                      label="Creator"
                      value={course.createdByName ?? course.createdBy}
                    />
                    <InfoRO
                      icon={<FiCalendar />}
                      label="Date Updated"
                      value={formatDate(course.updatedDate)}
                    />
                    <InfoRO
                      icon={<FiUser />}
                      label="Updater"
                      value={course.updatedByName ?? course.updatedBy}
                    />
                  </div>
                </div>
              </div>

              {/* Description & Note */}
              <div className="border rounded-lg p-4 space-y-4">
                <h2 className="font-semibold text-gray-700">Additional</h2>
                <Field icon={<FiFileText />} label="Description">
                  <textarea
                    rows={3}
                    {...register("description")}
                    className={inputCls}
                  />
                </Field>
                <Field icon={<FiFileText />} label="Note">
                  <textarea
                    rows={2}
                    {...register("note")}
                    className={inputCls}
                  />
                </Field>
              </div>
            </form>
          )}
          {activeTab === "Assessment Scheme" && (
            <CourseAssessmentSchemeTab courseId={course.id} />
          )}
          {activeTab === "Outline" && (
            <OutlineTab courseId={course.id} course={course} />
          )}
          {activeTab === "Materials" && <MaterialTab courseId={course.id} />}
          {activeTab === "Objectives" && (
            <CourseObjectivesTab courseId={course.id} />
          )}
          {activeTab === "Time Allocation" && (
            <TimeAllocationTab courseId={course.id} />
          )}
          {![
            "Overview",
            "Assessment Scheme",
            "Outline",
            "Objectives",
            "Materials",
            "Time Allocation",
          ].includes(activeTab) && (
            <div className="text-gray-400 text-sm py-10 text-center border-2 border-dashed rounded-lg">
              This tab ({activeTab}) is being developed by another team.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Read-only Overview ─────────────────────────────────── */
function OverviewTab({ course }: any) {
  const statusCls: Record<string, string> = {
    ACTIVE: "text-emerald-700 border-emerald-300",
    DRAFT: "text-amber-700 border-amber-300",
    UNDER_REVIEW: "text-blue-700 border-blue-300",
    INACTIVE: "text-gray-500 border-gray-300",
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Identity card */}
      <div className="rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FiBookOpen size={14} className="text-blue-500 shrink-0" />
              <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                {course.courseCode}
              </span>
              {course.topic && (
                <span className="text-xs text-gray-400">· {course.topic}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {course.courseName}
            </h2>
            {course.description && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-2xl">
                {course.description}
              </p>
            )}
          </div>
          {course.status && (
            <span
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                statusCls[course.status] ?? "text-gray-500 border-gray-300"
              }`}
            >
              {course.status}
            </span>
          )}
        </div>
      </div>

      {/* Duration strip */}
      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Duration
          </p>
          <p className="text-lg font-bold text-gray-900">
            {course.estimatedTime != null ? `${course.estimatedTime} min` : "—"}
          </p>
        </div>
      </div>

      {/* Details + Metadata */}
      <div className="grid grid-cols-2 gap-5">
        <Block title="Course Details">
          <div className="space-y-4">
            <Info icon={<FiBarChart2 />} label="Level" value={course.level} />
            <Info
              icon={<FiUser />}
              label="Trainer"
              value={course.trainerName ?? course.trainerId ?? undefined}
            />
            {course.note && (
              <Info icon={<FiFileText />} label="Note" value={course.note} />
            )}
          </div>
        </Block>

        <Block title="Metadata">
          <div className="space-y-4">
            <Info
              icon={<FiCalendar />}
              label="Date Created"
              value={formatDate(course.createdDate)}
            />
            <Info
              icon={<FiUser />}
              label="Creator"
              value={course.createdByName ?? course.createdBy}
            />
            <Info
              icon={<FiCalendar />}
              label="Date Updated"
              value={formatDate(course.updatedDate)}
            />
            <Info
              icon={<FiUser />}
              label="Updater"
              value={course.updatedByName ?? course.updatedBy}
            />
          </div>
        </Block>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */
function Field({ icon, label, children }: any) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function InfoRO({ icon, label, value }: any) {
  return (
    <div className="flex gap-2">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}

function Block({ title, children }: any) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <div className="flex gap-3">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
