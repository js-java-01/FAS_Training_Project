import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FiClock,
  FiSave,
  FiBook,
  FiZap,
  FiUser,
  FiHeadphones,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  topicApi,
  type TopicTimeAllocation,
  type AssessmentComponentResponse,
} from "@/api/topicApi";

/* ─── Types ──────────────────────────────────────────────── */
interface TimeFormValues {
  trainingHours: number | "";
  practiceHours: number | "";
  selfStudyHours: number | "";
  coachingHours: number | "";
  notes: string;
}

/* ─── Colour palette for bars ──────────────────────────── */
const categoryColour = {
  training: "#3B82F6", // blue
  practice: "#10B981", // green
  selfStudy: "#8B5CF6", // purple
  coaching: "#F59E0B", // amber
  assessment: "#EF4444", // red
};

const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

/* ─── Main Component ─────────────────────────────────────── */
interface Props {
  topicId: string;
}

export function TopicTimeAllocationTab({ topicId }: Props) {
  const [alloc, setAlloc] = useState<TopicTimeAllocation | null>(null);
  const [components, setComponents] = useState<AssessmentComponentResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, reset } = useForm<TimeFormValues>();

  /* ── computed values ── */
  const assessmentHours =
    alloc?.assessmentHours ?? calcAssessmentHours(components);
  const formValues = watch();

  const trainingH = Number(formValues.trainingHours) || 0;
  const practiceH = Number(formValues.practiceHours) || 0;
  const selfStudyH = Number(formValues.selfStudyHours) || 0;
  const coachingH = Number(formValues.coachingHours) || 0;
  const totalH =
    trainingH + practiceH + selfStudyH + coachingH + assessmentHours;

  /* ── load ── */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [allocData, compData] = await Promise.all([
        topicApi
          .getTimeAllocation(topicId)
          .catch(() => ({}) as TopicTimeAllocation),
        topicApi
          .getComponents(topicId)
          .catch(() => [] as AssessmentComponentResponse[]),
      ]);
      setAlloc(allocData);
      setComponents(compData);
      reset({
        trainingHours: allocData.trainingHours ?? "",
        practiceHours: allocData.practiceHours ?? "",
        selfStudyHours: allocData.selfStudyHours ?? "",
        coachingHours: allocData.coachingHours ?? "",
        notes: allocData.notes ?? "",
      });
    } finally {
      setLoading(false);
    }
  }, [topicId, reset]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── save ── */
  const onSubmit = async (form: TimeFormValues) => {
    try {
      setSaving(true);
      const updated = await topicApi.saveTimeAllocation(topicId, {
        trainingHours:
          form.trainingHours !== "" ? Number(form.trainingHours) : null,
        practiceHours:
          form.practiceHours !== "" ? Number(form.practiceHours) : null,
        selfStudyHours:
          form.selfStudyHours !== "" ? Number(form.selfStudyHours) : null,
        coachingHours:
          form.coachingHours !== "" ? Number(form.coachingHours) : null,
        notes: form.notes || null,
      });
      setAlloc(updated);
      toast.success("Time allocation saved");
    } catch {
      toast.error("Failed to save time allocation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 text-sm">
        Loading time allocation…
      </div>
    );
  }

  /* ─── render ──────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── TOP SUMMARY ── */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard
          icon={<FiBook />}
          label="Training"
          value={trainingH}
          colour={categoryColour.training}
        />
        <SummaryCard
          icon={<FiZap />}
          label="Practice"
          value={practiceH}
          colour={categoryColour.practice}
        />
        <SummaryCard
          icon={<FiUser />}
          label="Self-Study"
          value={selfStudyH}
          colour={categoryColour.selfStudy}
        />
        <SummaryCard
          icon={<FiHeadphones />}
          label="Coaching"
          value={coachingH}
          colour={categoryColour.coaching}
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="Assessment"
          value={assessmentHours}
          colour={categoryColour.assessment}
          readonly
        />
      </div>

      {/* ── TOTAL BAR ── */}
      {totalH > 0 && (
        <div className="border rounded-xl p-5 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FiClock className="text-blue-500" /> Total Hours
            </div>
            <span className="text-lg font-bold text-gray-900">
              {totalH.toFixed(1)} h
            </span>
          </div>

          {/* stacked progress bar */}
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            <Bar
              pct={(trainingH / totalH) * 100}
              color={categoryColour.training}
              label="Training"
            />
            <Bar
              pct={(practiceH / totalH) * 100}
              color={categoryColour.practice}
              label="Practice"
            />
            <Bar
              pct={(selfStudyH / totalH) * 100}
              color={categoryColour.selfStudy}
              label="Self-Study"
            />
            <Bar
              pct={(coachingH / totalH) * 100}
              color={categoryColour.coaching}
              label="Coaching"
            />
            <Bar
              pct={(assessmentHours / totalH) * 100}
              color={categoryColour.assessment}
              label="Assessment"
            />
          </div>

          {/* legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { label: "Training", val: trainingH, c: categoryColour.training },
              { label: "Practice", val: practiceH, c: categoryColour.practice },
              {
                label: "Self-Study",
                val: selfStudyH,
                c: categoryColour.selfStudy,
              },
              { label: "Coaching", val: coachingH, c: categoryColour.coaching },
              {
                label: "Assessment",
                val: assessmentHours,
                c: categoryColour.assessment,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 text-xs text-gray-600"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: item.c }}
                />
                {item.label}: {item.val.toFixed(1)} h (
                {totalH > 0 ? ((item.val / totalH) * 100).toFixed(0) : 0}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ASSESSMENT COMPONENTS BREAKDOWN ── */}
      {components.length > 0 && (
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50/60 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FiCheckCircle className="text-red-500" />
            Assessment Time Breakdown
            <span className="ml-auto text-xs text-gray-400 font-normal">
              Computed from Assessment Scheme
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/40 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5">Type</th>
                  <th className="text-left px-4 py-2.5">Name</th>
                  <th className="text-center px-4 py-2.5">Count</th>
                  <th className="text-center px-4 py-2.5">
                    Duration / session (min)
                  </th>
                  <th className="text-center px-4 py-2.5">Total (min)</th>
                  <th className="text-center px-4 py-2.5">Total (h)</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c) => {
                  const totalMin = (c.duration ?? 0) * c.count;
                  return (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-gray-50/30"
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">{c.name}</td>
                      <td className="px-4 py-2.5 text-center">{c.count}</td>
                      <td className="px-4 py-2.5 text-center">
                        {c.duration != null ? (
                          c.duration
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center font-medium">
                        {c.duration != null ? (
                          totalMin
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-red-600">
                        {c.duration != null ? (
                          (totalMin / 60).toFixed(2)
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold text-sm border-t-2">
                  <td
                    colSpan={4}
                    className="px-4 py-2.5 text-right text-gray-600"
                  >
                    Total Assessment Time
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {(assessmentHours * 60).toFixed(0)} min
                  </td>
                  <td className="px-4 py-2.5 text-center text-red-600">
                    {assessmentHours.toFixed(2)} h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INPUT FORM ── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FiClock className="text-blue-500" />
              Time Allocation Configuration
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <FiSave className="mr-1.5" />
              {saving ? "Saving…" : "Save Time Allocation"}
            </Button>
          </div>

          <div className="px-5 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              {/* Training */}
              <AllocationField
                icon={<FiBook style={{ color: categoryColour.training }} />}
                label="Training / Lecture Hours"
                description="Hours spent in classroom or instructor-led sessions"
              >
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  placeholder="e.g. 24"
                  {...register("trainingHours")}
                  className={inputCls}
                />
              </AllocationField>

              {/* Practice */}
              <AllocationField
                icon={<FiZap style={{ color: categoryColour.practice }} />}
                label="Practice / Lab Hours"
                description="Hands-on exercises, coding labs, workshops"
              >
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  placeholder="e.g. 16"
                  {...register("practiceHours")}
                  className={inputCls}
                />
              </AllocationField>

              {/* Self-study */}
              <AllocationField
                icon={<FiUser style={{ color: categoryColour.selfStudy }} />}
                label="Self-Study Hours"
                description="Reading, online courses, pre/post-class preparation"
              >
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  placeholder="e.g. 8"
                  {...register("selfStudyHours")}
                  className={inputCls}
                />
              </AllocationField>

              {/* Coaching */}
              <AllocationField
                icon={
                  <FiHeadphones style={{ color: categoryColour.coaching }} />
                }
                label="Coaching / Mentoring Hours"
                description="1:1 sessions, code reviews, feedback meetings"
              >
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  placeholder="e.g. 4"
                  {...register("coachingHours")}
                  className={inputCls}
                />
              </AllocationField>
            </div>

            {/* Assessment (readonly) */}
            <AllocationField
              icon={
                <FiCheckCircle style={{ color: categoryColour.assessment }} />
              }
              label="Assessment Hours (Computed)"
              description="Auto-calculated from Assessment Scheme components"
            >
              <div
                className={`${inputCls} bg-gray-50 text-gray-700 font-medium cursor-not-allowed`}
              >
                {assessmentHours.toFixed(2)} h
              </div>
            </AllocationField>

            {/* Notes */}
            <AllocationField
              icon={<FiFileText className="text-gray-400" />}
              label="Notes"
              description="Any additional information about time allocation"
            >
              <textarea
                rows={3}
                placeholder="Optional notes…"
                {...register("notes")}
                className={inputCls}
              />
            </AllocationField>

            {/* Total (computed) */}
            {totalH > 0 && (
              <div className="flex items-center justify-between rounded-lg border-2 border-blue-100 bg-blue-50/40 px-5 py-3">
                <span className="text-sm font-semibold text-gray-700">
                  Total Topic Duration
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {totalH.toFixed(1)} h
                </span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function SummaryCard({
  icon,
  label,
  value,
  colour,
  readonly,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colour: string;
  readonly?: boolean;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white relative overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ background: colour }}
      />
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
        <span style={{ color: colour }}>{icon}</span>
        {label}
        {readonly && (
          <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 rounded px-1">
            auto
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</p>
      <p className="text-xs text-gray-400 mt-0.5">hours</p>
    </div>
  );
}

function Bar({
  pct,
  color,
  label,
}: {
  pct: number;
  color: string;
  label: string;
}) {
  if (pct <= 0) return null;
  return (
    <div
      title={`${label}: ${pct.toFixed(1)}%`}
      style={{ width: `${pct}%`, background: color }}
      className="transition-all"
    />
  );
}

function AllocationField({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        {icon} {label}
      </label>
      <p className="text-[11px] text-gray-400">{description}</p>
      {children}
    </div>
  );
}

/* ─── util ── */
function calcAssessmentHours(
  components: AssessmentComponentResponse[],
): number {
  const totalMin = components
    .filter((c) => c.duration != null)
    .reduce((sum, c) => sum + (c.duration ?? 0) * c.count, 0);
  return Math.round((totalMin / 60) * 100) / 100;
}
