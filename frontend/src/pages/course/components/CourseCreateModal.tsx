import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { courseApi } from "@/api/courseApi";
import { userApi } from "@/api/userApi";
import type { User } from "@/types/auth";
import type { Course } from "@/types/course";
import {
  FiX,
  FiBookOpen,
  FiHash,
  FiDollarSign,
  FiClock,
  FiLayers,
  FiFileText,
  FiUser,
  FiUpload,
  FiImage,
} from "react-icons/fi";

type FormValues = {
  courseName: string;
  courseCode: string;
  price?: number;
  estimatedTime?: number;
  level?: string;
  status: string;
  description?: string;
  note?: string;
  trainerId?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Pass a course to switch to edit mode with pre-filled values */
  course?: Course | null;
}

export function CourseCreateModal({ open, onClose, onSuccess, course }: Props) {
  const isEdit = !!course;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { status: "DRAFT" },
  });

  // Fetch users once
  useEffect(() => {
    userApi
      .getAllUsers(0, 100)
      .then((res) => setUsers(res.content ?? []))
      .catch(() => {});
  }, []);

  // Pre-fill form whenever the target course changes
  useEffect(() => {
    if (course) {
      reset({
        courseName: course.courseName ?? "",
        courseCode: course.courseCode ?? "",
        price: course.price ?? undefined,
        estimatedTime: course.estimatedTime ?? undefined,
        level: course.level ?? "",
        status: course.status ?? "DRAFT",
        description: course.description ?? "",
        note: course.note ?? "",
        trainerId: course.trainerId ?? "",
      });
      setThumbnailPreview(course.thumbnailUrl ?? null);
    } else {
      reset({ status: "DRAFT" });
      setThumbnailPreview(null);
    }
  }, [course, reset]);

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

  if (!open) return null;

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const payload: any = {
        courseName: data.courseName,
        courseCode: data.courseCode,
        status: data.status,
      };

      if (data.price && !isNaN(data.price)) payload.price = data.price;
      if (data.estimatedTime && !isNaN(data.estimatedTime))
        payload.estimatedTime = data.estimatedTime;
      if (data.level) payload.level = data.level;
      if (data.description) payload.description = data.description;
      if (data.note) payload.note = data.note;
      if (data.trainerId) payload.trainerId = data.trainerId;

      if (isEdit) {
        await courseApi.updateCourse(course!.id, payload);
        toast.success("Course updated");
      } else {
        await courseApi.createCourse(payload);
        toast.success("Course created");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          (isEdit ? "Update failed" : "Create failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Course" : "Create Course"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? `Editing: ${course?.courseCode}`
                : "Configure course information"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-3">
          <Input
            icon={<FiBookOpen />}
            label="Course Name *"
            error={errors.courseName?.message}
            {...register("courseName", { required: "Required" })}
          />

          <Input
            icon={<FiHash />}
            label="Course Code *"
            error={errors.courseCode?.message}
            {...register("courseCode", { required: "Required" })}
          />

          <div className="grid grid-cols-2 gap-5">
            <Input
              type="number"
              icon={<FiDollarSign />}
              label="Price"
              {...register("price", { valueAsNumber: true })}
            />

            <Input
              type="number"
              icon={<FiClock />}
              label="Estimated Time (minutes)"
              {...register("estimatedTime", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Select
              icon={<FiLayers />}
              label="Level"
              options={["BEGINNER", "INTERMEDIATE", "ADVANCED"]}
              {...register("level")}
            />

            <Select
              label="Status"
              options={["DRAFT", "UNDER_REVIEW", "ACTIVE"]}
              {...register("status")}
            />
          </div>

          <Select icon={<FiUser />} label="Trainer" {...register("trainerId")}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </Select>

          {/* Thumbnail Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
              <FiImage />
              Thumbnail
            </label>
            {thumbnailPreview && (
              <div className="mb-2 relative w-full h-36 rounded-md overflow-hidden border">
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

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 md:col-span-1">
              <Textarea
                icon={<FiFileText />}
                label="Description"
                {...register("description")}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <Textarea label="Note" {...register("note")} />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Input = ({ icon, label, error, ...props }: any) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
      {icon}
      {label}
    </label>

    <input
      {...props}
      className="w-full border rounded-md px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ icon, label, options = [], children, ...props }: any) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
      {icon}
      {label}
    </label>

    <select
      {...props}
      className="w-full border rounded-md px-3 py-1 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">Select</option>
      {children
        ? children
        : options.map((o: string) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const Textarea = ({ icon, label, ...props }: any) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
      {icon}
      {label}
    </label>

    <textarea
      rows={3}
      {...props}
      className="w-full border rounded-md px-3 py-1 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
