import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { topicApi } from "@/api/topicApi";
import { assessmentTypeApi } from "@/api/assessmentTypeApi";
import { topicAssessmentTypeWeightApi } from "@/api/topicAssessmentTypeWeightApi";
import { toast } from "sonner";
import { 
  FiEdit, FiBookOpen, FiHash, FiBarChart2, FiCalendar, 
  FiUser, FiX, FiSave, FiFileText, FiLayers, FiPlus, FiTrash2, FiMenu
} from "react-icons/fi";
import {
  TOPIC_LEVEL_LABELS,
  TOPIC_LEVELS,
  TOPIC_STATUS_LABELS,
  TOPIC_STATUSES,
} from "../constants";

const tabs = ["Overview", "Courses", "Assessment Scheme"];

const inputCls = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

type SchemeItem = {
  localId: string;
  assessmentTypeId: string;
  assessmentTypeName: string;
  assessmentTypeDescription: string;
  weight: number;
};

export function TopicDetail({ topic, onBack, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessmentTypes, setAssessmentTypes] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [schemeItems, setSchemeItems] = useState<SchemeItem[]>([]);
  const [selectedAssessmentTypeId, setSelectedAssessmentTypeId] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("0");
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [schemeSaving, setSchemeSaving] = useState(false);
  const [hasExistingScheme, setHasExistingScheme] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<any>();

  const mapApiSchemeToUi = (
    rows: Array<{
      id: string;
      assessmentTypeId?: string;
      accessmentTypeName: string;
      assessmentTypeDescription?: string;
      weight: number;
    }>,
    typeOptions: Array<{ id: string; name: string; description: string }>,
  ) => {
    return rows.map((row) => {
      const normalizedName = row.accessmentTypeName?.trim().toLowerCase();
      const matchedType = row.assessmentTypeId
        ? typeOptions.find((type) => type.id === row.assessmentTypeId)
        : typeOptions.find((type) => type.name.trim().toLowerCase() === normalizedName);
      return {
        localId: row.id,
        assessmentTypeId: row.assessmentTypeId ?? matchedType?.id ?? "",
        assessmentTypeName: row.accessmentTypeName,
        assessmentTypeDescription: row.assessmentTypeDescription ?? matchedType?.description ?? "",
        weight: Number(row.weight ?? 0),
      };
    });
  };

  useEffect(() => {
    const loadAssessmentScheme = async () => {
      if (!topic?.id) return;

      try {
        setSchemeLoading(true);
        const [typesResp, weightsResp] = await Promise.all([
          assessmentTypeApi.getAll({ page: 0, size: 200 }),
          topicAssessmentTypeWeightApi.getByTopicId(topic.id),
        ]);

        const typeOptions = (typesResp?.content || []).map((type) => ({
          id: type.id,
          name: type.name,
          description: type.description ?? "",
        }));

        setAssessmentTypes(typeOptions);
        setSchemeItems(mapApiSchemeToUi(weightsResp || [], typeOptions));
        setHasExistingScheme((weightsResp || []).length > 0);
      } catch {
        toast.error("Failed to load assessment scheme");
      } finally {
        setSchemeLoading(false);
      }
    };

    void loadAssessmentScheme();
  }, [topic?.id]);

  const availableAssessmentTypes = useMemo(() => {
    const selectedIds = new Set(schemeItems.map((item) => item.assessmentTypeId).filter(Boolean));
    return assessmentTypes.filter((type) => !selectedIds.has(type.id));
  }, [assessmentTypes, schemeItems]);

  const totalWeight = useMemo(
    () => schemeItems.reduce((sum, item) => sum + (Number.isFinite(item.weight) ? item.weight : 0), 0),
    [schemeItems],
  );

  const addSchemeItem = () => {
    const weight = Number(selectedWeight);

    if (!selectedAssessmentTypeId) {
      toast.error("Please choose an assessment type");
      return;
    }
    if (Number.isNaN(weight) || weight < 0 || weight > 100) {
      toast.error("Weight must be from 0 to 100");
      return;
    }

    const selectedType = assessmentTypes.find((type) => type.id === selectedAssessmentTypeId);
    if (!selectedType) {
      toast.error("Invalid assessment type");
      return;
    }

    if (totalWeight + weight > 100) {
      toast.error("Total weight cannot exceed 100%");
      return;
    }

    setSchemeItems((prev) => [
      ...prev,
      {
        localId: `${selectedType.id}-${Date.now()}`,
        assessmentTypeId: selectedType.id,
        assessmentTypeName: selectedType.name,
        assessmentTypeDescription: selectedType.description,
        weight,
      },
    ]);

    setSelectedAssessmentTypeId("");
    setSelectedWeight("0");
  };

  const removeSchemeItem = (localId: string) => {
    setSchemeItems((prev) => prev.filter((item) => item.localId !== localId));
  };

  const updateSchemeWeight = (localId: string, nextWeight: string) => {
    const parsed = Number(nextWeight);
    setSchemeItems((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? { ...item, weight: Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed)) }
          : item,
      ),
    );
  };

  const moveSchemeItem = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setSchemeItems((prev) => {
      const fromIndex = prev.findIndex((item) => item.localId === sourceId);
      const toIndex = prev.findIndex((item) => item.localId === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const saveAssessmentScheme = async () => {
    if (!topic?.id) return;

    if (schemeItems.some((item) => !item.assessmentTypeId)) {
      toast.error("Some rows are missing assessment type mapping");
      return;
    }

    if (totalWeight > 100) {
      toast.error("Total weight cannot exceed 100%");
      return;
    }

    const payload = schemeItems.map((item) => ({
      topicId: topic.id,
      assessmentTypeId: item.assessmentTypeId,
      weight: Number(item.weight),
    }));

    try {
      setSchemeSaving(true);

      if (payload.length === 0) {
        await topicAssessmentTypeWeightApi.deleteAllByTopicId(topic.id);
      } else if (hasExistingScheme) {
        await topicAssessmentTypeWeightApi.updateByTopicId(topic.id, payload);
      } else {
        await topicAssessmentTypeWeightApi.createByTopicId(topic.id, payload);
      }

      setHasExistingScheme(true);
      toast.success("Assessment scheme saved");
    } catch {
      toast.error("Failed to save assessment scheme");
    } finally {
      setSchemeSaving(false);
    }
  };

  const startEdit = () => {
    reset({
      topicName: topic.topicName,
      topicCode: topic.topicCode,
      level: topic.level ?? "BEGINNER",
      status: topic.status ?? "DRAFT",
      description: topic.description,
    });
    setIsEditing(true);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await topicApi.updateTopic(topic.id, {
        topicName: data.topicName,
        topicCode: data.topicCode,
        level: data.level,
        status: data.status,
        description: data.description,
      });
      toast.success("Topic updated successfully");
      setIsEditing(false);
      onRefresh?.();
    } catch (err: any) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Topic Details</h1>
          <p className="text-sm text-gray-500">View and manage topic knowledge base</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
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

        {activeTab === "Overview" && (
          <button
            onClick={isEditing ? () => setIsEditing(false) : startEdit}
            className="flex items-center text-sm gap-2 mb-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEditing ? <><FiX /> Cancel</> : <><FiEdit /> Edit</>}
          </button>
        )}
      </div>

      {/* CONTENT: OVERVIEW - READ ONLY */}
      {activeTab === "Overview" && !isEditing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Block title="Primary Information">
            <div className="grid grid-cols-2 gap-4">
              <Info icon={<FiBookOpen />} label="Topic Name" value={topic.topicName} />
              <Info icon={<FiHash />} label="Topic Code" value={topic.topicCode} />
              <Info icon={<FiLayers />} label="Level" value={topic.level ? TOPIC_LEVEL_LABELS[topic.level as keyof typeof TOPIC_LEVEL_LABELS] ?? topic.level : "---"} />
              <Info icon={<FiBarChart2 />} label="Status" value={topic.status ? TOPIC_STATUS_LABELS[topic.status as keyof typeof TOPIC_STATUS_LABELS] ?? topic.status : "---"} />
            </div>
          </Block>

          <div className="grid grid-cols-2 gap-6">
            <Block title="Metadata">
              <div className="space-y-4">
                <Info icon={<FiCalendar />} label="Created Date" value={new Date(topic.createdDate).toLocaleString("vi-VN")} />
                <Info icon={<FiUser />} label="Created By" value={topic.createdByName} />
              </div>
            </Block>
            <Block title="Additional Information">
              <div className="space-y-4">
                <Info icon={<FiFileText />} label="Description" value={topic.description} />
                <Info icon={<FiFileText />} label="Version" value={topic.version} />
              </div>
            </Block>
          </div>
        </div>
      )}

      {/* CONTENT: OVERVIEW - EDIT MODE */}
      {activeTab === "Overview" && isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in zoom-in-95 duration-200">
          <div className="border rounded-lg p-4 bg-gray-50/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">Edit Topic Information</h2>
              <button disabled={loading} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-md px-4 py-1.5 hover:bg-blue-700">
                <FiSave /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Field icon={<FiBookOpen />} label="Topic Name">
                <input {...register("topicName", { required: true })} className={inputCls} />
              </Field>
              <Field icon={<FiHash />} label="Topic Code">
                <input {...register("topicCode", { required: true })} className={inputCls} />
              </Field>
              <Field icon={<FiLayers />} label="Level">
                <select {...register("level")} className={inputCls + " bg-white"}>
                  {TOPIC_LEVELS.map((level) => (
                    <option key={level} value={level}>{TOPIC_LEVEL_LABELS[level]}</option>
                  ))}
                </select>
              </Field>
              <Field icon={<FiLayers />} label="Status">
                <select {...register("status")} className={inputCls + " bg-white"}>
                  {TOPIC_STATUSES.map((status) => (
                    <option key={status} value={status}>{TOPIC_STATUS_LABELS[status]}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4 space-y-4">
              <Field icon={<FiFileText />} label="Description">
                <textarea rows={3} {...register("description")} className={inputCls} />
              </Field>
            </div>
          </div>
        </form>
      )}

      {activeTab === "Assessment Scheme" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-white space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Field icon={<FiLayers />} label="Assessment Type">
                <select
                  className={inputCls + " bg-white"}
                  value={selectedAssessmentTypeId}
                  onChange={(event) => setSelectedAssessmentTypeId(event.target.value)}
                >
                  <option value="">Select assessment type</option>
                  {availableAssessmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field icon={<FiBarChart2 />} label="Weight (%)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputCls}
                  value={selectedWeight}
                  onChange={(event) => setSelectedWeight(event.target.value)}
                />
              </Field>

              <button
                type="button"
                onClick={addSchemeItem}
                className="h-10 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white px-4 text-sm hover:bg-blue-700"
              >
                <FiPlus /> Add
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Drag rows to reorder priority</span>
              <span
                className={
                  totalWeight > 100
                    ? "text-red-600 font-semibold"
                    : totalWeight === 100
                      ? "text-green-600 font-semibold"
                      : "text-amber-600 font-semibold"
                }
              >
                Total: {totalWeight}%
              </span>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-[44px_1fr_1fr_120px_54px] bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 py-2">
                <span></span>
                <span>Assessment Type</span>
                <span>Description</span>
                <span>Weight</span>
                <span></span>
              </div>

              {schemeLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading assessment scheme...</div>
              ) : schemeItems.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No assessment type weight configured.</div>
              ) : (
                <div>
                  {schemeItems.map((item) => (
                    <div
                      key={item.localId}
                      draggable
                      onDragStart={() => setDraggingId(item.localId)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggingId) moveSchemeItem(draggingId, item.localId);
                        setDraggingId(null);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className="grid grid-cols-[44px_1fr_1fr_120px_54px] items-center px-3 py-2 border-t"
                    >
                      <div className="text-gray-400 cursor-grab"><FiMenu /></div>
                      <div className="text-sm font-medium text-gray-800">{item.assessmentTypeName}</div>
                      <div className="text-sm text-gray-600 line-clamp-2 pr-2">{item.assessmentTypeDescription || "-"}</div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-24 border rounded-md px-2 py-1 text-sm"
                        value={item.weight}
                        onChange={(event) => updateSchemeWeight(item.localId, event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSchemeItem(item.localId)}
                        className="inline-flex items-center justify-center text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveAssessmentScheme}
                disabled={schemeSaving || schemeLoading}
                className="inline-flex items-center gap-2 text-sm bg-blue-700 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
              >
                <FiSave /> {schemeSaving ? "Saving..." : "Save Assessment Scheme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS PLACEHOLDER */}
      {activeTab !== "Overview" && activeTab !== "Assessment Scheme" && (
        <div className="py-20 text-center border-2 border-dashed rounded-xl bg-gray-50 text-gray-400">
          <FiLayers size={40} className="mx-auto mb-2 opacity-20" />
          <p>Content for {activeTab} is being updated by the content team.</p>
        </div>
      )}
    </div>
  );
}

// Sub-components helpers (Đồng bộ style với Course)
function Block({ title, children }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
      <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <div className="flex gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
      <div className="text-blue-500 mt-1 shrink-0 bg-blue-50 p-1.5 rounded-md">{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
        <p className="font-medium text-gray-900 leading-tight">{value || "---"}</p>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 ml-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}