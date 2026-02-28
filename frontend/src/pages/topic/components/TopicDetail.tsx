import { useState } from "react";
import { useForm } from "react-hook-form";
import { topicApi, type Topic } from "@/api/topicApi";
import { toast } from "sonner";
import { FiEdit, FiBookOpen, FiHash, FiBarChart2, FiCalendar, FiUser, FiX, FiSave, FiFileText } from "react-icons/fi";

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("vi-VN");
}

const inputCls = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function TopicDetail({ topic, onBack, onRefresh }: any) {
  const [isEditing, setIsEditing] = useState(false);
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
      toast.success("Topic updated");
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Topic Details</h1>
          <p className="text-sm text-gray-500">View and manage topic information</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md border">← Back to list</button>
      </div>

      <div className="flex justify-end border-b mb-6">
        <button
          onClick={isEditing ? () => setIsEditing(false) : startEdit}
          className="flex items-center text-sm gap-2 mb-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
        >
          {isEditing ? <FiX /> : <FiEdit />} {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="border rounded-lg p-4 grid grid-cols-2 gap-4">
            <Info icon={<FiBookOpen />} label="Topic Name" value={topic.topicName} />
            <Info icon={<FiHash />} label="Topic Code" value={topic.topicCode} />
            <Info icon={<FiBarChart2 />} label="Status" value={topic.status} />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="border rounded-lg p-4 space-y-4">
                <h2 className="font-semibold text-gray-700">Metadata</h2>
                <Info icon={<FiCalendar />} label="Created At" value={formatDate(topic.createdDate)} />
                <Info icon={<FiUser />} label="Created By" value={topic.createdByName} />
             </div>
             <div className="border rounded-lg p-4 space-y-4">
                <h2 className="font-semibold text-gray-700">Additional</h2>
                <Info icon={<FiFileText />} label="Description" value={topic.description} />
                <Info icon={<FiFileText />} label="Note" value={topic.note} />
             </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">Edit Information</h2>
              <button disabled={loading} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-md px-3 py-1.5 hover:bg-blue-700">
                <FiSave /> {loading ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field icon={<FiBookOpen />} label="Topic Name"><input {...register("topicName")} className={inputCls} /></Field>
              <Field icon={<FiHash />} label="Topic Code"><input {...register("topicCode")} className={inputCls} /></Field>
              <Field icon={<FiBarChart2 />} label="Status">
                <select {...register("status")} className={inputCls + " bg-white"}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field icon={<FiFileText />} label="Description"><textarea rows={3} {...register("description")} className={inputCls} /></Field>
              <Field icon={<FiFileText />} label="Note"><textarea rows={2} {...register("note")} className={inputCls} /></Field>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <div className="flex gap-2">
      <div className="text-gray-400 mt-1 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: any) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">{icon} {label}</label>
      {children}
    </div>
  );
}