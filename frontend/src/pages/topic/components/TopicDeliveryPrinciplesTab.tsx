import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FiEdit,
  FiSave,
  FiX,
  FiUsers,
  FiStar,
  FiBookOpen,
  FiFileText,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { topicApi, type TopicDeliveryPrinciple } from "@/api/topicApi";

interface Props {
  topicId: string;
}

const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const textareaCls = inputCls + " resize-none";

export function TopicDeliveryPrinciplesTab({ topicId }: Props) {
  const [data, setData] = useState<TopicDeliveryPrinciple | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<TopicDeliveryPrinciple>();

  const load = async () => {
    try {
      setLoading(true);
      const res = await topicApi.getDeliveryPrinciple(topicId);
      setData(res);
    } catch {
      // No data yet — that's OK, backend will create on first PUT
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [topicId]);

  const startEdit = () => {
    reset({
      maxTraineesPerClass: data?.maxTraineesPerClass ?? undefined,
      minTrainerLevel: data?.minTrainerLevel ?? undefined,
      minMentorLevel: data?.minMentorLevel ?? undefined,
      trainingGuidelines: data?.trainingGuidelines ?? "",
      markingPolicy: data?.markingPolicy ?? "",
      waiverNotes: data?.waiverNotes ?? "",
      otherNotes: data?.otherNotes ?? "",
    });
    setIsEditing(true);
  };

  const onSubmit = async (form: TopicDeliveryPrinciple) => {
    try {
      setSaving(true);
      const updated = await topicApi.saveDeliveryPrinciple(topicId, {
        maxTraineesPerClass: form.maxTraineesPerClass
          ? Number(form.maxTraineesPerClass)
          : null,
        minTrainerLevel: form.minTrainerLevel
          ? Number(form.minTrainerLevel)
          : null,
        minMentorLevel: form.minMentorLevel
          ? Number(form.minMentorLevel)
          : null,
        trainingGuidelines: form.trainingGuidelines || null,
        markingPolicy: form.markingPolicy || null,
        waiverNotes: form.waiverNotes || null,
        otherNotes: form.otherNotes || null,
      });
      setData(updated);
      setIsEditing(false);
      toast.success("Delivery principles saved");
    } catch {
      toast.error("Failed to save delivery principles");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
    );
  }

  /* ── READ-ONLY VIEW ── */
  if (!isEditing) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">Delivery Principles</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Class size limits, trainer requirements and content guidelines
            </p>
          </div>
          <button
            onClick={startEdit}
            className="flex items-center text-sm gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiEdit /> Edit
          </button>
        </div>

        {/* Numeric stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<FiUsers className="text-blue-500" />}
            label="Max Trainees / Class"
            value={data?.maxTraineesPerClass}
            unit="trainees"
            color="blue"
          />
          <StatCard
            icon={<FiStar className="text-amber-500" />}
            label="Min Trainer Level"
            value={data?.minTrainerLevel}
            unit="level"
            color="amber"
          />
          <StatCard
            icon={<FiStar className="text-purple-500" />}
            label="Min Mentor Level"
            value={data?.minMentorLevel}
            unit="level"
            color="purple"
          />
        </div>

        {/* Text sections */}
        <div className="grid grid-cols-2 gap-4">
          <TextSection
            icon={<FiBookOpen className="text-blue-400" />}
            title="Training Guidelines"
            value={data?.trainingGuidelines}
          />
          <TextSection
            icon={<FiFileText className="text-green-400" />}
            title="Marking Policy"
            value={data?.markingPolicy}
          />
          <TextSection
            icon={<FiAlertCircle className="text-orange-400" />}
            title="Waiver Notes"
            value={data?.waiverNotes}
          />
          <TextSection
            icon={<FiInfo className="text-gray-400" />}
            title="Other Notes"
            value={data?.otherNotes}
          />
        </div>
      </div>
    );
  }

  /* ── EDIT MODE ── */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 animate-in zoom-in-95 duration-200"
    >
      {/* Edit header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">
            Edit Delivery Principles
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Update class size limits, trainer requirements and content
            guidelines
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center text-sm gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FiX /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center text-sm gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <FiSave /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Numeric fields */}
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Max Trainees / Class" icon={<FiUsers />}>
          <input
            type="number"
            min={1}
            placeholder="e.g. 30"
            {...register("maxTraineesPerClass")}
            className={inputCls}
          />
        </FormField>
        <FormField label="Min Trainer Level" icon={<FiStar />}>
          <input
            type="number"
            min={1}
            max={5}
            placeholder="1 – 5"
            {...register("minTrainerLevel")}
            className={inputCls}
          />
        </FormField>
        <FormField label="Min Mentor Level" icon={<FiStar />}>
          <input
            type="number"
            min={1}
            max={5}
            placeholder="1 – 5"
            {...register("minMentorLevel")}
            className={inputCls}
          />
        </FormField>
      </div>

      {/* Text fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Training Guidelines" icon={<FiBookOpen />}>
          <textarea
            rows={5}
            placeholder="Describe training approach, methods, tools…"
            {...register("trainingGuidelines")}
            className={textareaCls}
          />
        </FormField>
        <FormField label="Marking Policy" icon={<FiFileText />}>
          <textarea
            rows={5}
            placeholder="Grading criteria, pass mark, re-assessment rules…"
            {...register("markingPolicy")}
            className={textareaCls}
          />
        </FormField>
        <FormField label="Waiver Notes" icon={<FiAlertCircle />}>
          <textarea
            rows={4}
            placeholder="Conditions under which requirements may be waived…"
            {...register("waiverNotes")}
            className={textareaCls}
          />
        </FormField>
        <FormField label="Other Notes" icon={<FiInfo />}>
          <textarea
            rows={4}
            placeholder="Any additional delivery notes…"
            {...register("otherNotes")}
            className={textareaCls}
          />
        </FormField>
      </div>
    </form>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number | null;
  unit: string;
  color: "blue" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-100",
    amber: "bg-amber-50 border-amber-100",
    purple: "bg-purple-50 border-purple-100",
  };
  const textMap = {
    blue: "text-blue-700",
    amber: "text-amber-700",
    purple: "text-purple-700",
  };

  return (
    <div
      className={`rounded-xl border p-5 flex items-start gap-4 ${colorMap[color]}`}
    >
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1">
          {label}
        </p>
        {value != null ? (
          <p className={`text-2xl font-bold ${textMap[color]}`}>
            {value}{" "}
            <span className="text-xs font-normal text-gray-400">{unit}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">Not set</p>
        )}
      </div>
    </div>
  );
}

function TextSection({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
          {title}
        </p>
      </div>
      {value ? (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {value}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">Not specified</p>
      )}
    </div>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 ml-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
