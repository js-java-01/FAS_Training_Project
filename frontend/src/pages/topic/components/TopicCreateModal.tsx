import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { topicApi, type Topic } from "@/api/topicApi";
import { FiX, FiBookOpen, FiHash, FiFileText } from "react-icons/fi";
import { forwardRef } from "react";

type FormValues = {
  topicName: string;
  topicCode: string;
  status: string;
  description?: string;
  note?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  topic?: Topic | null;
}

export function TopicCreateModal({ open, onClose, onSuccess, topic }: Props) {
  const isEdit = !!topic;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { status: "ACTIVE" },
  });

  useEffect(() => {
    if (open) {
      if (topic) {
        reset({
          topicName: topic.topicName,
          topicCode: topic.topicCode,
          status: topic.status,
          description: topic.description,
          note: topic.note,
        });
      } else {
        reset({
          topicName: "",
          topicCode: "",
          status: "ACTIVE",
          description: "",
          note: "",
        });
      }
    }
  }, [topic, open, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      if (isEdit) {
        await topicApi.updateTopic(topic!.id, data);
        toast.success("Topic updated");
      } else {
        await topicApi.createTopic(data);
        toast.success("Topic created");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Operation failed");
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
        className="bg-white w-full max-w-xl rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Topic" : "Create Topic"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? `Editing: ${topic?.topicCode}`
                : "Configure topic information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            icon={<FiBookOpen />}
            label="Topic Name *"
            error={errors.topicName?.message}
            {...register("topicName", { required: "Required" })}
          />
          <Input
            icon={<FiHash />}
            label="Topic Code *"
            error={errors.topicCode?.message}
            {...register("topicCode", { required: "Required" })}
          />

          <Select
            label="Status"
            options={["ACTIVE", "INACTIVE"]}
            {...register("status")}
          />

          <Textarea
            icon={<FiFileText />}
            label="Description"
            {...register("description")}
          />
          <Textarea label="Note" {...register("note")} />

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
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Processing..."
                : isEdit
                  ? "Save Changes"
                  : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
    label?: string;
    error?: string;
  }
>(({ icon, label, error, ...props }, ref) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
      {icon}
      {label}
    </label>

    <input
      ref={ref}
      {...props}
      className="w-full border rounded-md px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
));

Input.displayName = "Input";

const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    options?: string[];
  }
>(({ label, options = [], ...props }, ref) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
      {label}
    </label>

    <select
      ref={ref}
      {...props}
      className="w-full border rounded-md px-3 py-1 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
));

Select.displayName = "Select";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    icon?: React.ReactNode;
    label?: string;
  }
>(({ icon, label, ...props }, ref) => (
  <div>
    <label className="flex items-center gap-2 text-sm mb-1 text-gray-700">
      {icon}
      {label}
    </label>

    <textarea
      ref={ref}
      rows={3}
      {...props}
      className="w-full border rounded-md px-3 py-1 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
));

Textarea.displayName = "Textarea";