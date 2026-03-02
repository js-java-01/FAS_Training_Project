import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiClipboard,
} from "react-icons/fi";
import { DatabaseBackup } from "lucide-react";
import dayjs from "dayjs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import {
  topicApi,
  ASSESSMENT_TYPES,
  type AssessmentSchemeConfig,
  type AssessmentComponentResponse,
  type AssessmentComponentRequest,
  type AssessmentComponentType,
} from "@/api/topicApi";

/* ─── helpers ─── */
const typeLabel: Record<AssessmentComponentType, string> = {
  QUIZ: "QUIZ",
  ASSIGNMENT: "ASSIGNMENT",
  FINAL_EXAM: "FINAL_EXAM",
  LAB: "LAB",
  PROJECT: "PROJECT",
};

const inputCls =
  "w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

interface EditableComponent extends AssessmentComponentResponse {
  _isNew?: boolean;
  _localId: string; // temp id for new rows
}

type ComponentFieldError = Partial<
  Record<"type" | "name" | "count" | "weight" | "duration" | "displayOrder", string>
>;

/* ─── Main Tab ──────────────────────────────────────────────── */
interface Props {
  topicId: string;
}

export function TopicAssessmentSchemeTab({ topicId }: Props) {
  /* ── config state ── */
  const [config, setConfig] = useState<AssessmentSchemeConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);

  const {
    register: regCfg,
    handleSubmit: handleCfgSubmit,
    reset: resetCfg,
    watch: watchCfg,
    setValue: setCfgVal,
    formState: { errors: configErrors },
  } = useForm<AssessmentSchemeConfig>();

  const allowRetake = watchCfg("allowFinalRetake");

  /* ── components state ── */
  const [components, setComponents] = useState<EditableComponent[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [compSaving, setCompSaving] = useState(false);
  const [hasCompChanges, setHasCompChanges] = useState(false);
  const [componentErrors, setComponentErrors] = useState<
    Record<string, ComponentFieldError>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<EditableComponent | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── import/export state ── */
  const [importExportOpen, setImportExportOpen] = useState(false);

  /* ── load ── */
  const loadConfig = useCallback(async () => {
    try {
      setConfigLoading(true);
      const data = await topicApi.getSchemeConfig(topicId);
      setConfig(data);
      resetCfg(data);
    } catch {
      // fresh topic – set defaults
      const defaults: AssessmentSchemeConfig = {
        minGpaToPass: 6,
        minAttendance: 80,
        allowFinalRetake: false,
      };
      setConfig(defaults);
      resetCfg(defaults);
    } finally {
      setConfigLoading(false);
    }
  }, [topicId, resetCfg]);

  const loadComponents = useCallback(async () => {
    try {
      setCompLoading(true);
      const data = await topicApi.getComponents(topicId);
      setComponents(data.map((c) => ({ ...c, _localId: c.id })));
      setHasCompChanges(false);
      setComponentErrors({});
    } catch {
      toast.error("Failed to load assessment components");
    } finally {
      setCompLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    loadConfig();
    loadComponents();
  }, [loadConfig, loadComponents]);

  /* ── config save ── */
  const onSaveConfig = async (form: AssessmentSchemeConfig) => {
    try {
      setConfigSaving(true);
      const updated = await topicApi.updateSchemeConfig(topicId, {
        minGpaToPass: Number(form.minGpaToPass),
        minAttendance: Number(form.minAttendance),
        allowFinalRetake: form.allowFinalRetake,
      });
      setConfig(updated);
      resetCfg(updated);
      toast.success("Scheme configuration saved");
    } catch {
      toast.error("Failed to save scheme configuration");
    } finally {
      setConfigSaving(false);
    }
  };

  /* ── component helpers ── */
  const totalWeight = components.reduce(
    (sum, c) => sum + (Number(c.weight) || 0),
    0,
  );
  const weightOk = Math.abs(totalWeight - 100) < 0.01;

  const validateOneComponent = (comp: EditableComponent): ComponentFieldError => {
    const errors: ComponentFieldError = {};

    if (!comp.type) {
      errors.type = "Type is required";
    }
    if (!comp.name?.trim()) {
      errors.name = "Name is required";
    }
    if (!Number.isInteger(Number(comp.count)) || Number(comp.count) <= 0) {
      errors.count = "Count must be a positive integer";
    }
    if (!Number.isFinite(Number(comp.weight))) {
      errors.weight = "Weight must be a valid number";
    }
    if (
      comp.duration !== null &&
      comp.duration !== undefined &&
      (!Number.isInteger(Number(comp.duration)) || Number(comp.duration) < 0)
    ) {
      errors.duration = "Duration must be a non-negative integer or empty";
    }
    if (
      !Number.isInteger(Number(comp.displayOrder)) ||
      Number(comp.displayOrder) <= 0
    ) {
      errors.displayOrder = "Order must be a positive integer";
    }

    return errors;
  };

  const validateComponents = (
    items: EditableComponent[],
  ): Record<string, ComponentFieldError> => {
    const nextErrors: Record<string, ComponentFieldError> = {};
    for (const item of items) {
      const rowErrors = validateOneComponent(item);
      if (Object.keys(rowErrors).length > 0) {
        nextErrors[item._localId] = rowErrors;
      }
    }
    return nextErrors;
  };

  const updateComp = (
    localId: string,
    field: keyof EditableComponent,
    value: unknown,
  ) => {
    setComponents((prev) => {
      const next = prev.map((c) =>
        c._localId === localId ? { ...c, [field]: value } : c,
      );

      const updated = next.find((c) => c._localId === localId);
      if (updated) {
        const rowErrors = validateOneComponent(updated);
        setComponentErrors((prevErrors) => {
          if (Object.keys(rowErrors).length === 0) {
            const { [localId]: _removed, ...rest } = prevErrors;
            return rest;
          }
          return { ...prevErrors, [localId]: rowErrors };
        });
      }

      return next;
    });
    setHasCompChanges(true);
  };

  const addComponent = () => {
    const nextOrder = components.length + 1;
    const newComp: EditableComponent = {
      id: "",
      _localId: `new-${Date.now()}`,
      _isNew: true,
      name: "",
      type: "QUIZ",
      count: 1,
      weight: 0,
      duration: null,
      displayOrder: nextOrder,
      isGraded: true,
    };
    setComponents((prev) => [...prev, newComp]);
    setComponentErrors((prev) => ({
      ...prev,
      [newComp._localId]: validateOneComponent(newComp),
    }));
    setHasCompChanges(true);
  };

  const removeLocalComponent = (comp: EditableComponent) => {
    setComponents((prev) => prev.filter((c) => c._localId !== comp._localId));
    setComponentErrors((prev) => {
      const { [comp._localId]: _removed, ...rest } = prev;
      return rest;
    });
    setHasCompChanges(true);
  };

  const confirmDeleteComponent = async () => {
    if (!deleteTarget) return;

    if (deleteTarget._isNew || !deleteTarget.id) {
      removeLocalComponent(deleteTarget);
      setDeleteTarget(null);
      return;
    }

    try {
      setDeleting(true);
      await topicApi.deleteComponent(topicId, deleteTarget.id);
      toast.success("Assessment component deleted");
      setDeleteTarget(null);
      await loadComponents();
    } catch {
      toast.error("Failed to delete assessment component");
    } finally {
      setDeleting(false);
    }
  };

  const onCancelComponents = () => {
    loadComponents();
  };

  const onSaveComponents = async () => {
    const validationErrors = validateComponents(components);
    setComponentErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix invalid component fields before saving");
      return;
    }

    if (!weightOk) {
      toast.error("Total weight must equal 100%");
      return;
    }

    try {
      setCompSaving(true);
      const existingComponents = components.filter((c) => !c._isNew && c.id);
      const newComponents = components.filter((c) => c._isNew || !c.id);

      if (existingComponents.length > 0) {
        await topicApi.updateComponents(
          topicId,
          existingComponents.map((c) => buildRequest(c)),
        );
      }

      for (const c of newComponents) {
        await topicApi.addComponent(topicId, buildRequest(c));
      }

      toast.success("Assessment components saved");
      await loadComponents();
    } catch {
      toast.error("Failed to save assessment components");
    } finally {
      setCompSaving(false);
    }
  };

  /* ── import / export ── */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const blob = await topicApi.exportAssessmentComponents(topicId);
    downloadBlob(
      blob,
      `assessment-components-${dayjs().format("DD-MM-YYYY_HH-mm-ss")}.xlsx`,
    );
  };

  /** Called by ImportModal "Download Template" button */
  const handleDownloadTemplate = async () => {
    const blob = await topicApi.downloadAssessmentComponentsTemplate(topicId);
    downloadBlob(
      blob,
      `assessment-components-template-${dayjs().format("DD-MM-YYYY_HH-mm-ss")}.xlsx`,
    );
  };

  /** Called by ImportModal after user picks file and clicks Import */
  const handleImport = async (file: File) => {
    const res = await topicApi.importAssessmentComponents(topicId, file);
    await loadComponents();
    return res;
  };

  const validateImportFile = (file: File): string | null => {
    if (!file.name.match(/\.json$/i)) {
      return "Invalid file format. Only JSON files (.json) are allowed.";
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size exceeds 10MB limit.";
    }

    return null;
  };

  /* ── render ── */
  if (configLoading || compLoading) {
    return (
      <div className="py-20 text-center text-gray-400 text-sm">
        Loading assessment scheme…
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── SECTION 1 – SCHEME CONFIG ──────────────────────── */}
      <div className="border rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/60">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
            <FiClipboard className="text-blue-500" />
            Assessment Scheme Configuration
          </div>
          <Button
            size="sm"
            onClick={handleCfgSubmit(onSaveConfig)}
            disabled={configSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <FiSave className="mr-1.5" />
            {configSaving ? "Saving…" : "Save Scheme Config"}
          </Button>
        </div>

        <form className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Min GPA To Pass (0-10)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={10}
                {...regCfg("minGpaToPass", {
                  valueAsNumber: true,
                  required: "Min GPA is required",
                  min: { value: 0, message: "Min GPA must be between 0 and 10" },
                  max: {
                    value: 10,
                    message: "Min GPA must be between 0 and 10",
                  },
                })}
                className={inputCls}
              />
              {configErrors.minGpaToPass && (
                <p className="text-xs text-red-500 mt-1">
                  {configErrors.minGpaToPass.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Min Attendance % (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                {...regCfg("minAttendance", {
                  valueAsNumber: true,
                  required: "Min attendance is required",
                  min: {
                    value: 0,
                    message: "Min attendance must be between 0 and 100",
                  },
                  max: {
                    value: 100,
                    message: "Min attendance must be between 0 and 100",
                  },
                })}
                className={inputCls}
              />
              {configErrors.minAttendance && (
                <p className="text-xs text-red-500 mt-1">
                  {configErrors.minAttendance.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-gray-50/40">
            <span className="text-sm font-medium text-gray-700">
              Allow Final Retake
            </span>
            <Switch
              checked={!!allowRetake}
              onCheckedChange={(v: boolean) => setCfgVal("allowFinalRetake", v)}
            />
          </div>
        </form>
      </div>

      {/* ─── SECTION 2 – COMPONENTS ──────────────────────────── */}
      <div className="border rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/60">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
            <FiClipboard className="text-blue-500" />
            Assessment Components
          </div>

          <div className="flex items-center gap-3">
            {/* total weight badge */}
            <span className="text-xs font-semibold">
              Total Weight:{" "}
              <span className={weightOk ? "text-green-600" : "text-red-500"}>
                {totalWeight.toFixed(2)}%
              </span>
            </span>
            {!weightOk && (
              <span className="text-xs text-red-500">
                Total weight must equal 100% before saving.
              </span>
            )}

            {/* import / export */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setImportExportOpen(true)}
              className="gap-2"
            >
              <DatabaseBackup className="h-4 w-4" />
              Import / Export
            </Button>

            {/* cancel / save */}
            {hasCompChanges && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelComponents}
                  className="text-xs"
                >
                  ✕ Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={compSaving}
                  onClick={onSaveComponents}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <FiSave className="mr-1.5" />
                  {compSaving ? "Saving…" : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/40 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-44">Type</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-center px-3 py-3 w-20">Count</th>
                <th className="text-center px-3 py-3 w-24">Weight %</th>
                <th className="text-center px-3 py-3 w-24">Duration (min)</th>
                <th className="text-center px-3 py-3 w-20">Order</th>
                <th className="text-center px-3 py-3 w-20">Graded</th>
                <th className="text-center px-3 py-3 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No assessment components yet. Click "+ Add Component" to
                    begin.
                  </td>
                </tr>
              ) : (
                components.map((comp) => (
                  <ComponentRow
                    key={comp._localId}
                    comp={comp}
                    onChange={updateComp}
                    errors={componentErrors[comp._localId]}
                    onDelete={(selected) => setDeleteTarget(selected)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* add row */}
        <div className="px-4 py-3 border-t bg-gray-50/30">
          <button
            onClick={addComponent}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiPlus size={14} /> Add Component
          </button>
        </div>
      </div>

      <ImportExportModal
        title="Assessment Components"
        open={importExportOpen}
        setOpen={setImportExportOpen}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Confirm delete"
        message="Are you sure you want to delete this assessment component? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteComponent}
      />
    </div>
  );
}

/* ─── Component row ──────────────────────────────────────────── */
function ComponentRow({
  comp,
  onChange,
  errors,
  onDelete,
}: {
  comp: EditableComponent;
  onChange: (
    id: string,
    field: keyof EditableComponent,
    value: unknown,
  ) => void;
  errors?: ComponentFieldError;
  onDelete: (c: EditableComponent) => void;
}) {
  const id = comp._localId;

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50/40 transition-colors">
      {/* type */}
      <td className="px-4 py-2">
        <select
          value={comp.type}
          onChange={(e) =>
            onChange(id, "type", e.target.value as AssessmentComponentType)
          }
          className={`w-40 border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium ${
            errors?.type ? "border-red-500" : ""
          }`}
        >
          {ASSESSMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {typeLabel[t]}
            </option>
          ))}
        </select>
        {errors?.type && <p className="text-[11px] text-red-500 mt-1">{errors.type}</p>}
      </td>

      {/* name */}
      <td className="px-4 py-2">
        <input
          value={comp.name}
          onChange={(e) => onChange(id, "name", e.target.value)}
          placeholder="Component name"
          className={`w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
            errors?.name ? "border-red-500" : ""
          }`}
        />
        {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
      </td>

      {/* count */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={comp.count}
          onChange={(e) => onChange(id, "count", Number(e.target.value))}
          className={`w-16 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
            errors?.count ? "border-red-500" : ""
          }`}
        />
        {errors?.count && <p className="text-[11px] text-red-500 mt-1">{errors.count}</p>}
      </td>

      {/* weight */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={comp.weight}
          onChange={(e) => onChange(id, "weight", Number(e.target.value))}
          className={`w-20 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
            errors?.weight ? "border-red-500" : ""
          }`}
        />
        {errors?.weight && <p className="text-[11px] text-red-500 mt-1">{errors.weight}</p>}
      </td>

      {/* duration */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          placeholder="-"
          value={comp.duration ?? ""}
          onChange={(e) =>
            onChange(
              id,
              "duration",
              e.target.value ? Number(e.target.value) : null,
            )
          }
          className={`w-20 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
            errors?.duration ? "border-red-500" : ""
          }`}
        />
        {errors?.duration && <p className="text-[11px] text-red-500 mt-1">{errors.duration}</p>}
      </td>

      {/* order */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={comp.displayOrder}
          onChange={(e) => onChange(id, "displayOrder", Number(e.target.value))}
          className={`w-16 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
            errors?.displayOrder ? "border-red-500" : ""
          }`}
        />
        {errors?.displayOrder && (
          <p className="text-[11px] text-red-500 mt-1">{errors.displayOrder}</p>
        )}
      </td>

      {/* graded */}
      <td className="px-3 py-2 text-center">
        <Switch
          checked={!!comp.isGraded}
          onCheckedChange={(v: boolean) => onChange(id, "isGraded", v)}
        />
      </td>

      {/* actions */}
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => onDelete(comp)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
          title="Delete component"
        >
          <FiTrash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

/* ─── util ── */
function buildRequest(c: EditableComponent): AssessmentComponentRequest {
  return {
    name: c.name,
    type: c.type,
    count: Number(c.count),
    weight: Number(c.weight),
    duration: c.duration ? Number(c.duration) : null,
    displayOrder: Number(c.displayOrder),
    isGraded: !!c.isGraded,
    note: c.note ?? null,
  };
}
