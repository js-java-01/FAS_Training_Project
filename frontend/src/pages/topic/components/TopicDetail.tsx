import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { useForm } from "react-hook-form";
import { topicApi } from "@/api/topicApi";
import { assessmentTypeApi } from "@/api/assessmentTypeApi";
import { topicAssessmentTypeWeightApi } from "@/api/topicAssessmentTypeWeightApi";
import { toast } from "sonner";
import { FiEdit, FiX } from "react-icons/fi";
import { AssessmentSchemeTab } from "./topic-detail/AssessmentSchemeTab";
import { CoursesTab } from "./topic-detail/CoursesTab";
import { OverviewTab } from "./topic-detail/OverviewTab";
import { tabs } from "./topic-detail/shared";
import type { SchemeItem, TopicDetailTab } from "./topic-detail/shared";

export function TopicDetail({ topic, onBack, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState<TopicDetailTab>("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessmentTypes, setAssessmentTypes] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [schemeItems, setSchemeItems] = useState<SchemeItem[]>([]);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [schemeSaving, setSchemeSaving] = useState(false);
  const [hasExistingScheme, setHasExistingScheme] = useState(false);
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

  const isSchemeWeightValid = totalWeight === 100;
  const canAddMoreAssessmentType = totalWeight < 100;
  const remainingWeight = Math.max(0, 100 - totalWeight);

  const addAssessmentTypeToScheme = (assessmentTypeId: string) => {
    if (!canAddMoreAssessmentType) {
      toast.error("Total weight has reached 100%. Please adjust current rows before adding.");
      return;
    }

    if (schemeItems.some((item) => item.assessmentTypeId === assessmentTypeId)) {
      return;
    }

    const selectedType = assessmentTypes.find((type) => type.id === assessmentTypeId);
    if (!selectedType) return;

    setSchemeItems((prev) => [
      ...prev,
      {
        localId: `${selectedType.id}-${Date.now()}`,
        assessmentTypeId: selectedType.id,
        assessmentTypeName: selectedType.name,
        assessmentTypeDescription: selectedType.description,
        weight: 0,
      },
    ]);
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

  const onTypeDragStart = (event: DragEvent<HTMLDivElement>, assessmentTypeId: string) => {
    event.dataTransfer.setData("text/plain", assessmentTypeId);
    event.dataTransfer.effectAllowed = "copy";
  };

  const onSchemeDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const assessmentTypeId = event.dataTransfer.getData("text/plain");
    if (!assessmentTypeId) return;
    addAssessmentTypeToScheme(assessmentTypeId);
  };

  const saveAssessmentScheme = async () => {
    if (!topic?.id) return;

    if (schemeItems.some((item) => !item.assessmentTypeId)) {
      toast.error("Some rows are missing assessment type mapping");
      return;
    }

    if (!isSchemeWeightValid) {
      toast.error("Total weight must be exactly 100% before saving");
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
        level: topic.level,
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
    <div className="max-w-310 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-start md:items-center gap-3 mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Topic Details</h1>
          <p className="text-sm text-gray-500">View and manage topic knowledge base</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
          ← Back to list
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex justify-between items-center border-b pb-1">
        <div className="flex gap-5 overflow-x-auto pr-2">
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

      {activeTab === "Overview" && (
        <OverviewTab
          topic={topic}
          isEditing={isEditing}
          loading={loading}
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
        />
      )}

      {activeTab === "Assessment Scheme" && (
        <AssessmentSchemeTab
          availableAssessmentTypes={availableAssessmentTypes}
          schemeItems={schemeItems}
          totalWeight={totalWeight}
          remainingWeight={remainingWeight}
          canAddMoreAssessmentType={canAddMoreAssessmentType}
          isSchemeWeightValid={isSchemeWeightValid}
          schemeLoading={schemeLoading}
          schemeSaving={schemeSaving}
          onTypeDragStart={onTypeDragStart}
          onSchemeDrop={onSchemeDrop}
          addAssessmentTypeToScheme={addAssessmentTypeToScheme}
          updateSchemeWeight={updateSchemeWeight}
          removeSchemeItem={removeSchemeItem}
          saveAssessmentScheme={saveAssessmentScheme}
        />
      )}

      {activeTab === "Courses" && <CoursesTab />}
    </div>
  );
}
