import type { SemesterResponse, TrainingClass } from "@/types/trainingClass";
import dayjs from "dayjs";
import type { PagedData } from "@/types/response";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";

/* ── editable form data ── */
export interface ClassInfoFormData {
    className: string;
    classCode: string;
    description: string;
    startDate: string;
    endDate: string;
    semesterId: string;
    trainingProgramId: string;
}

/* ── read-only / editable field ── */
const Field = ({
    label,
    value,
    required = false,
    charCount,
    maxChars,
    isEditing = false,
    onChange,
    name,
    error,
}: {
    label: string;
    value?: string | null;
    required?: boolean;
    charCount?: number;
    maxChars?: number;
    isEditing?: boolean;
    onChange?: (name: string, value: string) => void;
    name?: string;
    error?: string;
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
        {isEditing && onChange && name ? (
            <div>
                <input
                    type="text"
                    value={value ?? ""}
                    onChange={(e) => onChange(name, e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-foreground bg-background outline-none transition
                        ${error ? "border-red-500 focus:ring-red-200" : "border-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
        ) : (
            <div className="px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground min-h-10.5 flex items-center">
                {value || <span className="text-muted-foreground italic">—</span>}
            </div>
        )}
    </div>
);

/* ── date field ── */
const DateField = ({
    label,
    value,
    required = false,
    isEditing = false,
    onChange,
    name,
    error,
    min,
}: {
    label: string;
    value?: string | null;
    required?: boolean;
    isEditing?: boolean;
    onChange?: (name: string, value: string) => void;
    name?: string;
    error?: string;
    min?: string;
}) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {isEditing && onChange && name ? (
            <div>
                <input
                    type="date"
                    value={value ?? ""}
                    min={min}
                    onChange={(e) => onChange(name, e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-foreground bg-background outline-none transition
                        ${error ? "border-red-500 focus:ring-red-200" : "border-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
        ) : (
            <div className="px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground min-h-10.5 flex items-center">
                {value ? dayjs(value).format("DD-MM-YYYY") : <span className="text-muted-foreground italic">—</span>}
            </div>
        )}
    </div>
);

/* ── select-like read-only / editable field ── */
const SelectField = ({
    label,
    value,
    required = false,
    isEditing = false,
    onChange,
    name,
    options,
    selectedValue,
    loading,
}: {
    label: string;
    value?: string | null;
    required?: boolean;
    isEditing?: boolean;
    onChange?: (name: string, value: string) => void;
    name?: string;
    options?: { id: string; label: string }[];
    selectedValue?: string;
    loading?: boolean;
}) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {isEditing && onChange && name && options ? (
            <select
                value={selectedValue ?? ""}
                onChange={(e) => onChange(name, e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-foreground bg-background outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">{loading ? "Loading..." : `Select ${label.toLowerCase()}`}</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label}
                    </option>
                ))}
            </select>
        ) : (
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
        )}
    </div>
);

/* ── status pill ── */
const CLASS_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const REQUEST_STATUS_OPTIONS = [
    { value: "PENDING_APPROVAL", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
];

const getStatusActiveStyle = (value: string) => {
    if (value === "PENDING_APPROVAL") {
        return {
            container: "border-yellow-400 bg-yellow-50 text-yellow-700",
            dot: "bg-yellow-500",
        };
    }

    if (value === "APPROVED") {
        return {
            container: "border-green-400 bg-green-50 text-green-700",
            dot: "bg-green-500",
        };
    }

    if (value === "ACTIVE" || value === "INACTIVE") {
        return {
            container: "border-blue-400 bg-blue-50 text-blue-700",
            dot: "bg-blue-500",
        };
    }

    if (value === "REJECTED") {
        return {
            container: "border-red-400 bg-red-50 text-red-700",
            dot: "bg-red-500",
        };
    }

    return {
        container: "border-border bg-muted text-foreground",
        dot: "bg-muted-foreground/60",
    };
};

const StatusSelector = ({
    label,
    current,
    options,
}: {
    label: string;
    current: string;
    options: { value: string; label: string }[];
}) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
            {label}<span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
            {options.map((s) => {
                const isActive = s.value === current;
                const activeStyle = getStatusActiveStyle(s.value);
                return (
                    <div
                        key={s.value}
                        className={`
                            inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium cursor-default transition
                            ${isActive ? activeStyle.container : "border-border bg-background text-muted-foreground"}
                        `}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${isActive ? activeStyle.dot : "bg-muted-foreground/40"}`}
                        />
                        {s.label}
                    </div>
                );
            })}
        </div>
    </div>
);

/* ============================================================ */

interface ClassInfoTabProps {
    trainingClass: TrainingClass;
    isEditing?: boolean;
    formData?: ClassInfoFormData;
    onFieldChange?: (name: string, value: string) => void;
    errors?: Record<string, string>;
    semesters?: PagedData<SemesterResponse> | SemesterResponse[];
    loadingSemesters?: boolean;
    trainingPrograms?: PagedData<any> | any[];
    loadingTrainingPrograms?: boolean;
    enrollmentKey?: string;
    onEdit?: () => void;
    onCancel?: () => void;
    onSave?: () => void;
    canEditClass?: boolean;
    saving?: boolean;
}

export default function ClassInfoTab({
    trainingClass,
    isEditing = false,
    formData,
    onFieldChange,
    errors = {},
    semesters,
    loadingSemesters = false,
    trainingPrograms,
    loadingTrainingPrograms = false,
    onEdit,
    onCancel,
    onSave,
    canEditClass = false,
    saving = false,
}: ClassInfoTabProps) {
    const rawRequestStatus = String(trainingClass.status ?? "").toUpperCase();
    const requestStatusValue = rawRequestStatus === "PENDING_APPROVAL"
        ? "PENDING_APPROVAL"
        : rawRequestStatus === "REJECTED"
            ? "REJECTED"
            : "APPROVED";
    const classStatusValue = trainingClass.isActive ? "ACTIVE" : "INACTIVE";
    const todayString = dayjs().format("YYYY-MM-DD");
    const minEndDate = formData?.startDate
        ? dayjs(formData.startDate).add(1, "day").isBefore(dayjs(todayString))
            ? todayString
            : dayjs(formData.startDate).add(1, "day").format("YYYY-MM-DD")
        : todayString;
    const displayName = isEditing ? formData?.className : trainingClass.className;
    const displayCode = isEditing ? formData?.classCode : trainingClass.classCode;
    const nameLen = (displayName ?? "").length;
    const codeLen = (displayCode ?? "").length;

    const semesterList = Array.isArray(semesters)
        ? semesters
        : (semesters?.items ?? []);

    const semesterOptions = semesterList.map((semester) => ({
        id: semester.id,
        label: semester.name,
    }));

    const trainingProgramList = Array.isArray(trainingPrograms)
        ? trainingPrograms
        : (trainingPrograms?.items ?? []);

    const trainingProgramOptions = trainingProgramList.map((tp) => ({
        id: tp.id,
        label: tp.name,
    }));

    const canEditTrainingProgram = isEditing && requestStatusValue === "PENDING_APPROVAL";

    return (
        <div className="space-y-8 w-full">
            {/* ── Basic Information ── */}
            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={onCancel}
                                disabled={saving}
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={onSave}
                                disabled={saving}
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    ) : (
                        canEditClass && (
                            <Button
                                size="sm"
                                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={onEdit}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>
                        )
                    )}
                </div>

                {/* Row 1: Name + Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field
                        label="Name"
                        value={displayName}
                        required
                        charCount={nameLen}
                        maxChars={100}
                        isEditing={isEditing}
                        onChange={onFieldChange}
                        name="className"
                        error={errors.className}
                    />
                    <Field
                        label="Code"
                        value={displayCode}
                        required
                        charCount={codeLen}
                        maxChars={100}
                        isEditing={isEditing}
                        onChange={onFieldChange}
                        name="classCode"
                        error={errors.classCode}
                    />
                    <SelectField label="Admin" value={trainingClass.approverName} />

                </div>

                {/* Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <SelectField
                        label="Training Program"
                        value={trainingClass.trainingProgramName}
                        required
                        isEditing={canEditTrainingProgram}
                        onChange={onFieldChange}
                        name="trainingProgramId"
                        options={trainingProgramOptions}
                        selectedValue={formData?.trainingProgramId}
                        loading={loadingTrainingPrograms}
                    />
                    <StatusSelector
                        label="Class Status"
                        current={classStatusValue}
                        options={CLASS_STATUS_OPTIONS}
                    />
                    <StatusSelector
                        label="Request Status"
                        current={requestStatusValue}
                        options={REQUEST_STATUS_OPTIONS}
                    />
                </div>
            </section>

            {/* ── Additional Details ── */}
            <section className="space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <SelectField
                        label="Semester"
                        value={trainingClass.semesterName}
                        isEditing={isEditing}
                        onChange={onFieldChange}
                        name="semesterId"
                        options={semesterOptions}
                        selectedValue={formData?.semesterId}
                        loading={loadingSemesters}
                    />
                    <DateField
                        label="Start Date"
                        value={
                            isEditing
                                ? formData?.startDate
                                : trainingClass.startDate
                        }
                        isEditing={isEditing}
                        onChange={onFieldChange}
                        name="startDate"
                        error={errors.startDate}
                        min={todayString}
                    />
                    <DateField
                        label="End Date"
                        value={
                            isEditing
                                ? formData?.endDate
                                : trainingClass.endDate
                        }
                        isEditing={isEditing}
                        onChange={onFieldChange}
                        name="endDate"
                        error={errors.endDate}
                        min={minEndDate}
                    />

                </div>
            </section>
        </div>
    );
}