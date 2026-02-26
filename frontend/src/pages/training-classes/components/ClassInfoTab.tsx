import type { TrainingClass } from "@/types/trainingClass";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";

/* ── read-only field ── */
const Field = ({
    label,
    value,
    required = false,
    charCount,
    maxChars,
}: {
    label: string;
    value?: string | null;
    required?: boolean;
    charCount?: number;
    maxChars?: number;
}) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {charCount !== undefined && maxChars !== undefined && (
                <span className="text-xs text-muted-foreground">
                    {charCount}/{maxChars}
                </span>
            )}
        </div>
        <div className="px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground min-h-10.5 flex items-center">
            {value || <span className="text-muted-foreground italic">—</span>}
        </div>
    </div>
);

/* ── select-like read-only field ── */
const SelectField = ({
    label,
    value,
    required = false,
}: {
    label: string;
    value?: string | null;
    required?: boolean;
}) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground min-h-10.5 flex items-center justify-between">
            <span>
                {value || (
                    <span className="text-muted-foreground italic">—</span>
                )}
            </span>
            <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    </div>
);

/* ── status pill ── */
const STATUS_OPTIONS = [
    { value: "PLANNING", label: "Planning", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { value: "ASSIGNED", label: "Assigned", color: "bg-gray-200 text-gray-600 border-gray-300" },
    { value: "REVIEWING", label: "Reviewing", color: "bg-gray-200 text-gray-600 border-gray-300" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-gray-200 text-yellow-600 border-gray-300" },
    { value: "DECLINED", label: "Declined", color: "bg-gray-200 text-yellow-600 border-gray-300" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-gray-200 text-gray-600 border-gray-300" },
    { value: "PENDING_CLOSE", label: "Pending Close", color: "bg-gray-200 text-gray-600 border-gray-300" },
];

const StatusSelector = ({ current }: { current: string }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
            Status<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => {
                const isActive =
                    s.value === current ||
                    (current === "ACTIVE" && s.value === "PLANNING") ||
                    (!current && s.value === "PLANNING");
                return (
                    <div
                        key={s.value}
                        className={`
                            inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium cursor-default transition
                            ${isActive ? "border-blue-400 bg-blue-50 text-blue-700" : "border-border bg-background text-muted-foreground"}
                        `}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${isActive ? "bg-blue-500" : "bg-muted-foreground/40"}`}
                        />
                        {s.label}
                    </div>
                );
            })}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
            Selected:{" "}
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                {STATUS_OPTIONS.find(
                    (s) =>
                        s.value === current ||
                        (current === "ACTIVE" && s.value === "PLANNING"),
                )?.label ?? "Planning"}
            </Badge>
        </div>
    </div>
);

/* ============================================================ */

interface ClassInfoTabProps {
    trainingClass: TrainingClass;
}

export default function ClassInfoTab({ trainingClass }: ClassInfoTabProps) {
    const nameLen = trainingClass.className?.length ?? 0;
    const codeLen = trainingClass.classCode?.length ?? 0;

    return (
        <div className="space-y-8 max-w-6xl">
            {/* ── Basic Information ── */}
            <section className="space-y-5">
                <h2 className="text-lg font-semibold">Basic Information</h2>

                {/* Row 1: Name + Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field
                        label="Name"
                        value={trainingClass.className}
                        required
                        charCount={nameLen}
                        maxChars={100}
                    />
                    <Field
                        label="Code"
                        value={trainingClass.classCode}
                        required
                        charCount={codeLen}
                        maxChars={100}
                    />
                </div>

                {/* Row 2: BU Request + Training Program */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField label="BU Request (Optional)" value={null} />
                    <SelectField label="Training Program" value={null} required />
                </div>

                {/* Row 3: Master Trainer / Admin / Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <SelectField label="Master Trainer" value={trainingClass.creatorName} />
                    <SelectField label="Admin" value={trainingClass.approverName} />
                    <SelectField label="Location" value={null} required />
                </div>

                {/* Row 4: Format / Delivery / Subject / Scope / Trainee / Technical */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
                    <SelectField label="Format Type" value={null} />
                    <SelectField label="Delivery Type" value={null} />
                    <SelectField label="Subject Type" value={null} />
                    <SelectField label="Scope" value={null} />
                    <SelectField label="Trainee Type" value={null} required />
                    <SelectField label="Technical Group" value={null} required />
                </div>

                {/* Status */}
                <StatusSelector current={trainingClass.isActive ? "PLANNING" : "PLANNING"} />
            </section>

            {/* ── Additional Details ── */}
            <section className="space-y-5">
                <h2 className="text-lg font-semibold">Additional Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField label="Semester" value={trainingClass.semesterName} />
                    <Field
                        label="Start Date"
                        value={
                            trainingClass.startDate
                                ? dayjs(trainingClass.startDate).format("DD-MM-YYYY")
                                : undefined
                        }
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field
                        label="End Date"
                        value={
                            trainingClass.endDate
                                ? dayjs(trainingClass.endDate).format("DD-MM-YYYY")
                                : undefined
                        }
                    />
                    <Field label="Description" value={trainingClass.description} />
                </div>
            </section>
        </div>
    );
}
