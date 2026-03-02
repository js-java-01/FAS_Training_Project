import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiClipboard,
  FiCheckCircle,
  FiDownload,
} from "react-icons/fi";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImportModal } from "@/components/ImportModal";
import {
  topicApi,
  ASSESSMENT_TYPES,
  type AssessmentSchemeConfig,
  type AssessmentComponentResponse,
  type AssessmentComponentRequest,
  type AssessmentComponentType,
} from "@/api/topicApi";

interface ImportResult {
  configUpdated: boolean;
  componentsAdded: number;
}

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
  } = useForm<AssessmentSchemeConfig>();

  const allowRetake = watchCfg("allowFinalRetake");

  /* ── components state ── */
  const [components, setComponents] = useState<EditableComponent[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [compSaving, setCompSaving] = useState(false);
  const [hasCompChanges, setHasCompChanges] = useState(false);

  /* ── import/export state ── */
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

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
      // 1. Fetch ALL backend components and delete them
      const backendComponents = await topicApi.getComponents(topicId);
      for (const c of backendComponents) {
        await topicApi.deleteComponent(topicId, c.id);
      }
      // 2. Re-add every component currently in the local table
      for (const c of components) {
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
  const handleExport = () => {
    const payload = {
      schemeConfig: config,
      components: components.map(
        ({
          name,
          type,
          count,
          weight,
          duration,
          displayOrder,
          isGraded,
          note,
        }) => ({
          name,
          type,
          count,
          weight,
          duration,
          displayOrder,
          isGraded,
          note,
        }),
      ),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-scheme-${topicId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Called by ImportModal "Download Template" button */
  const handleDownloadTemplate = () => {
    const template = {
      schemeConfig: {
        minGpaToPass: 6,
        minAttendance: 80,
        allowFinalRetake: false,
      },
      components: [
        {
          name: "Quiz",
          type: "QUIZ",
          count: 1,
          weight: 30,
          duration: null,
          displayOrder: 1,
          isGraded: true,
        },
        {
          name: "Assignment",
          type: "ASSIGNMENT",
          count: 1,
          weight: 30,
          duration: null,
          displayOrder: 2,
          isGraded: true,
        },
        {
          name: "Final Exam",
          type: "FINAL_EXAM",
          count: 1,
          weight: 40,
          duration: 90,
          displayOrder: 3,
          isGraded: true,
        },
      ],
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assessment-scheme-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Called by ImportModal after user picks file and clicks Import */
  const handleImport = async (file: File): Promise<void> => {
    const text = await file.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON file. Please check the file format.");
    }

    let configUpdated = false;
    let componentsAdded = 0;

    if (parsed.schemeConfig) {
      await topicApi.updateSchemeConfig(topicId, parsed.schemeConfig);
      await loadConfig();
      configUpdated = true;
    }

    if (Array.isArray(parsed.components) && parsed.components.length > 0) {
      // Delete all current saved components, then add from file
      const current = await topicApi.getComponents(topicId);
      for (const c of current) {
        await topicApi.deleteComponent(topicId, c.id);
      }
      for (const c of parsed.components as AssessmentComponentRequest[]) {
        await topicApi.addComponent(topicId, c);
      }
      componentsAdded = parsed.components.length;
      await loadComponents();
    }

    setImportResult({ configUpdated, componentsAdded });
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
                {...regCfg("minGpaToPass", { valueAsNumber: true })}
                className={inputCls}
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
                {...regCfg("minAttendance", { valueAsNumber: true })}
                className={inputCls}
              />
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

            {/* import / export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportResult(null);
                setImportOpen(true);
              }}
              className="text-xs"
            >
              <FiDownload className="mr-1.5 rotate-180" /> Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-xs"
            >
              <FiDownload className="mr-1.5" /> Export
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
                    onDelete={removeComponent}
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

      {/* ─── IMPORT RESULT BANNER ── */}
      {importResult && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <FiCheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800 mb-1">
              Import successful
            </p>
            <ul className="text-xs text-green-700 space-y-0.5">
              {importResult.configUpdated && (
                <li>
                  ✓ Scheme configuration updated (Min GPA, Min Attendance, Allow
                  Retake)
                </li>
              )}
              {importResult.componentsAdded > 0 && (
                <li>
                  ✓ {importResult.componentsAdded} assessment component
                  {importResult.componentsAdded > 1 ? "s" : ""} imported
                </li>
              )}
              {!importResult.configUpdated &&
                importResult.componentsAdded === 0 && (
                  <li>No changes — file had no recognisable content.</li>
                )}
            </ul>
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="text-green-400 hover:text-green-600 shrink-0 text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── IMPORT MODAL ── */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Assessment Scheme"
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
        acceptedFileTypes=".json"
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
            onChange(id, "type", e.target.value as AssessmentComponentType)
          }
          className={`w-40 border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium`}
        >
          {ASSESSMENT_TYPES.map((t) => (
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
          className={`w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white`}
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
