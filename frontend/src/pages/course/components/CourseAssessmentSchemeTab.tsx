import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiClipboard,
  FiEdit,
  FiX,
} from "react-icons/fi";
import { DatabaseBackup } from "lucide-react";
import dayjs from "dayjs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import {
  courseApi,
  COURSE_ASSESSMENT_TYPES,
  type CourseAssessmentSchemeConfig,
  type CourseAssessmentComponentResponse,
  type CourseAssessmentComponentRequest,
  type CourseAssessmentComponentType,
} from "@/api/courseApi";

/* ─── helpers ─── */
const typeLabel: Record<CourseAssessmentComponentType, string> = {
  QUIZ: "QUIZ",
  ASSIGNMENT: "ASSIGNMENT",
  FINAL_EXAM: "FINAL_EXAM",
  LAB: "LAB",
  PROJECT: "PROJECT",
};

const inputCls =
  "w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

interface EditableComponent extends CourseAssessmentComponentResponse {
  _isNew?: boolean;
  _localId: string;
}

/* ─── Main Tab ──────────────────────────────────────────────── */
interface Props {
  courseId: string;
}

export function CourseAssessmentSchemeTab({ courseId }: Props) {
  /* ── config state ── */
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configEditing, setConfigEditing] = useState(false);

  const {
    register: regCfg,
    handleSubmit: handleCfgSubmit,
    reset: resetCfg,
    watch: watchCfg,
    setValue: setCfgVal,
  } = useForm<CourseAssessmentSchemeConfig>();

  const allowRetake = watchCfg("allowFinalRetake");

  /* ── components state ── */
  const [components, setComponents] = useState<EditableComponent[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [compSaving, setCompSaving] = useState(false);
  const [hasCompChanges, setHasCompChanges] = useState(false);

  /* ── load ── */
  const loadConfig = useCallback(async () => {
    try {
      setConfigLoading(true);
      const data = await courseApi.getSchemeConfig(courseId);
      resetCfg(data);
    } catch {
      const defaults: CourseAssessmentSchemeConfig = {
        minGpaToPass: 6,
        minAttendance: 80,
        allowFinalRetake: false,
      };
      resetCfg(defaults);
    } finally {
      setConfigLoading(false);
    }
  }, [courseId, resetCfg]);

  const loadComponents = useCallback(async () => {
    try {
      setCompLoading(true);
      const data = await courseApi.getComponents(courseId);
      setComponents(data.map((c) => ({ ...c, _localId: c.id })));
      setHasCompChanges(false);
    } catch {
      toast.error("Failed to load assessment components");
    } finally {
      setCompLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadConfig();
    loadComponents();
  }, [loadConfig, loadComponents]);

  /* ── config save ── */
  const onSaveConfig = async (form: CourseAssessmentSchemeConfig) => {
    try {
      setConfigSaving(true);
      await courseApi.updateSchemeConfig(courseId, {
        minGpaToPass: Number(form.minGpaToPass),
        minAttendance: Number(form.minAttendance),
        allowFinalRetake: form.allowFinalRetake,
      });
      toast.success("Scheme configuration saved");
      setConfigEditing(false);
      await loadConfig();
    } catch {
      toast.error("Failed to save scheme configuration");
    } finally {
      setConfigSaving(false);
    }
  };

  const onCancelConfig = () => {
    setConfigEditing(false);
    loadConfig();
  };

  /* ── component helpers ── */
  const totalWeight = components.reduce(
    (sum, c) => sum + (Number(c.weight) || 0),
    0,
  );
  const weightOk = Math.abs(totalWeight - 100) < 0.01;

  const updateComp = (
    localId: string,
    field: keyof EditableComponent,
    value: unknown,
  ) => {
    setComponents((prev) =>
      prev.map((c) => (c._localId === localId ? { ...c, [field]: value } : c)),
    );
    setHasCompChanges(true);
  };

  const [importExportOpen, setImportExportOpen] = useState(false);

  /* ── import/export helpers ── */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const blob = await courseApi.exportComponents(courseId);
      const date = dayjs().format("YYYY-MM-DD");
      downloadBlob(
        blob,
        `assessment_components_course_${courseId}_${date}.xlsx`,
      );
      toast.success("Exported successfully");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = async (file: File) => {
    const result = await courseApi.importComponents(courseId, file);
    await loadComponents();
    return result;
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await courseApi.downloadComponentsTemplate(courseId);
      downloadBlob(blob, "assessment_components_template.xlsx");
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
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
      graded: true,
    };
    setComponents((prev) => [...prev, newComp]);
    setHasCompChanges(true);
  };

  const removeComponent = (comp: EditableComponent) => {
    setComponents((prev) => prev.filter((c) => c._localId !== comp._localId));
    setHasCompChanges(true);
  };

  const onCancelComponents = () => {
    loadComponents();
  };

  const onSaveComponents = async () => {
    if (!weightOk) {
      toast.error("Total weight must equal 100%");
      return;
    }
    try {
      setCompSaving(true);
      const payload: CourseAssessmentComponentRequest[] =
        components.map(buildRequest);
      await courseApi.updateComponents(courseId, payload);
      toast.success("Assessment components saved");
      await loadComponents();
    } catch {
      toast.error("Failed to save assessment components");
    } finally {
      setCompSaving(false);
    }
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
          <div className="flex items-center gap-2">
            {configEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={onCancelConfig}
                >
                  <FiX className="mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCfgSubmit(onSaveConfig)}
                  disabled={configSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <FiSave className="mr-1.5" />
                  {configSaving ? "Saving…" : "Save Scheme Config"}
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setConfigEditing(true)}
              >
                <FiEdit size={13} /> Edit
              </Button>
            )}
          </div>
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
                disabled={!configEditing}
                {...regCfg("minGpaToPass", { valueAsNumber: true })}
                className={
                  inputCls +
                  (!configEditing
                    ? " bg-gray-50 text-gray-600 cursor-default"
                    : "")
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Min Attendance % (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                disabled={!configEditing}
                {...regCfg("minAttendance", { valueAsNumber: true })}
                className={
                  inputCls +
                  (!configEditing
                    ? " bg-gray-50 text-gray-600 cursor-default"
                    : "")
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-gray-50/40">
            <span className="text-sm font-medium text-gray-700">
              Allow Final Retake
            </span>
            <Switch
              checked={!!allowRetake}
              disabled={!configEditing}
              onCheckedChange={(v: boolean) =>
                configEditing && setCfgVal("allowFinalRetake", v)
              }
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

            {/* import/export */}
            <Button
              variant="secondary"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setImportExportOpen(true)}
            >
              <DatabaseBackup size={14} />
              Import / Export
            </Button>

            {/* add component */}
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              onClick={addComponent}
            >
              <FiPlus size={14} /> Add Component
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
                    begin, or clone from a topic.
                  </td>
                </tr>
              ) : (
                components.map((comp) => (
                  <ComponentRow
                    key={comp._localId}
                    comp={comp}
                    onChange={updateComp}
                    onDelete={removeComponent}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ImportExportModal
        title="Assessment Components"
        open={importExportOpen}
        setOpen={setImportExportOpen}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        validateFile={(file) => {
          if (!file.name.match(/\.(xlsx|xls)$/i)) {
            return "Only .xlsx or .xls files are supported";
          }
          return null;
        }}
      />
    </div>
  );
}

/* ─── Component row ──────────────────────────────────────────── */
function ComponentRow({
  comp,
  onChange,
  onDelete,
}: {
  comp: EditableComponent;
  onChange: (
    id: string,
    field: keyof EditableComponent,
    value: unknown,
  ) => void;
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
            onChange(
              id,
              "type",
              e.target.value as CourseAssessmentComponentType,
            )
          }
          className="w-40 border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
        >
          {COURSE_ASSESSMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {typeLabel[t]}
            </option>
          ))}
        </select>
      </td>

      {/* name */}
      <td className="px-4 py-2">
        <input
          value={comp.name}
          onChange={(e) => onChange(id, "name", e.target.value)}
          placeholder="Component name"
          className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
      </td>

      {/* count */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={comp.count}
          onChange={(e) => onChange(id, "count", Number(e.target.value))}
          className="w-16 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
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
          className="w-20 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
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
          className="w-20 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
      </td>

      {/* order */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={comp.displayOrder}
          onChange={(e) => onChange(id, "displayOrder", Number(e.target.value))}
          className="w-16 border rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
      </td>

      {/* graded */}
      <td className="px-3 py-2 text-center">
        <Switch
          checked={!!comp.graded}
          onCheckedChange={(v: boolean) => onChange(id, "graded", v)}
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
function buildRequest(c: EditableComponent): CourseAssessmentComponentRequest {
  return {
    name: c.name,
    type: c.type,
    count: Number(c.count),
    weight: Number(c.weight),
    duration: c.duration ? Number(c.duration) : null,
    displayOrder: Number(c.displayOrder),
    graded: !!c.graded,
  };
}
