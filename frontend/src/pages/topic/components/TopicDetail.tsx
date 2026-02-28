import { useState } from "react";
import { useForm } from "react-hook-form";
import { topicApi, type Topic } from "@/api/topicApi";
import { toast } from "sonner";
import {
  FiEdit,
  FiBookOpen,
  FiHash,
  FiBarChart2,
  FiCalendar,
  FiUser,
  FiX,
  FiSave,
  FiFileText,
  FiLayers,
} from "react-icons/fi";
import { TopicSkillsTab } from "./TopicSkillsTab";

const tabs = [
  "Overview",
  "Skills",
  "Objectives",
  "Assessment Scheme",
  "Delivery Principles",
  "Outline & Schedule",
  "Time Allocation",
];

const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function TopicDetail({ topic, onBack, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [skillsEditing, setSkillsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();

  const startEdit = () => {
    reset({
      topicName: topic.topicName,
      topicCode: topic.topicCode,
      status: topic.status,
      description: topic.description,
      note: topic.note,
    });
    setIsEditing(true);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await topicApi.updateTopic(topic.id, data);
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
          <p className="text-sm text-gray-500">
            View and manage topic knowledge base
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200"
        >
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
            {isEditing ? (
              <>
                <FiX /> Cancel
              </>
            ) : (
              <>
                <FiEdit /> Edit
              </>
            )}
          </button>
        )}
        {activeTab === "Skills" && !skillsEditing && (
          <button
            onClick={() => setSkillsEditing(true)}
            className="flex items-center text-sm gap-2 mb-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiEdit /> Edit
          </button>
        )}
        {activeTab === "Skills" && skillsEditing && (
          <button
            onClick={() => setSkillsEditing(false)}
            className="flex items-center text-sm gap-2 mb-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors"
          >
            Done
          </button>
        )}
      </div>

      {/* CONTENT: OVERVIEW - READ ONLY */}
      {activeTab === "Overview" && !isEditing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Block title="Primary Information">
            <div className="grid grid-cols-2 gap-4">
              <Info
                icon={<FiBookOpen />}
                label="Topic Name"
                value={topic.topicName}
              />
              <Info
                icon={<FiHash />}
                label="Topic Code"
                value={topic.topicCode}
              />
              <Info
                icon={<FiBarChart2 />}
                label="Status"
                value={topic.status}
              />
            </div>
          </Block>

          <div className="grid grid-cols-2 gap-6">
            <Block title="Metadata">
              <div className="space-y-4">
                <Info
                  icon={<FiCalendar />}
                  label="Created Date"
                  value={new Date(topic.createdDate).toLocaleString("vi-VN")}
                />
                <Info
                  icon={<FiUser />}
                  label="Created By"
                  value={topic.createdByName}
                />
              </div>
            </Block>
            <Block title="Additional Information">
              <div className="space-y-4">
                <Info
                  icon={<FiFileText />}
                  label="Description"
                  value={topic.description}
                />
                <Info icon={<FiFileText />} label="Note" value={topic.note} />
              </div>
            </Block>
          </div>
        </div>
      )}

      {/* CONTENT: OVERVIEW - EDIT MODE */}
      {activeTab === "Overview" && isEditing && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 animate-in zoom-in-95 duration-200"
        >
          <div className="border rounded-lg p-4 bg-gray-50/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">
                Edit Topic Information
              </h2>
              <button
                disabled={loading}
                className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-md px-4 py-1.5 hover:bg-blue-700"
              >
                <FiSave /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field icon={<FiBookOpen />} label="Topic Name">
                <input
                  {...register("topicName", { required: true })}
                  className={inputCls}
                />
              </Field>
              <Field icon={<FiHash />} label="Topic Code">
                <input
                  {...register("topicCode", { required: true })}
                  className={inputCls}
                />
              </Field>
              <Field icon={<FiLayers />} label="Status">
                <select
                  {...register("status")}
                  className={inputCls + " bg-white"}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </Field>
            </div>

            <div className="mt-4 space-y-4">
              <Field icon={<FiFileText />} label="Description">
                <textarea
                  rows={3}
                  {...register("description")}
                  className={inputCls}
                />
              </Field>
              <Field icon={<FiFileText />} label="Note">
                <textarea rows={2} {...register("note")} className={inputCls} />
              </Field>
            </div>
          </div>
        </form>
      )}

      {/* SKILLS TAB */}
      {activeTab === "Skills" && (
        <TopicSkillsTab topicId={topic.id} isEditMode={skillsEditing} />
      )}

      {/* OTHER TABS PLACEHOLDER */}
      {activeTab !== "Overview" && activeTab !== "Skills" && (
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
      <div className="text-blue-500 mt-1 shrink-0 bg-blue-50 p-1.5 rounded-md">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
          {label}
        </p>
        <p className="font-medium text-gray-900 leading-tight">
          {value || "---"}
        </p>
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
