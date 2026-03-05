import { FiBarChart2, FiBookOpen, FiCalendar, FiFileText, FiHash, FiLayers, FiSave } from "react-icons/fi";
import { TOPIC_STATUSES, TOPIC_STATUS_LABELS } from "../../constants";
import { Block, Field, Info, inputCls } from "./shared";

type OverviewTabProps = {
  topic: any;
  isEditing: boolean;
  loading: boolean;
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
};

export function OverviewTab({ topic, isEditing, loading, register, handleSubmit, onSubmit }: OverviewTabProps) {
  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in zoom-in-95 duration-200">
        <div className="border rounded-lg p-4 bg-gray-50/40">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Edit Topic Information</h2>
            <button disabled={loading} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-md px-4 py-1.5 hover:bg-blue-700 disabled:opacity-60">
              <FiSave /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field icon={<FiBookOpen />} label="Topic Name">
              <input {...register("topicName", { required: true })} className={inputCls} />
            </Field>
            <Field icon={<FiHash />} label="Topic Code">
              <input {...register("topicCode", { required: true })} className={inputCls} />
            </Field>
            <Field icon={<FiLayers />} label="Status">
              <select {...register("status")} className={inputCls + " bg-white"}>
                {TOPIC_STATUSES.map((status) => (
                  <option key={status} value={status}>{TOPIC_STATUS_LABELS[status]}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field icon={<FiFileText />} label="Description">
              <textarea rows={3} {...register("description")} className={inputCls} />
            </Field>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Block title="Primary Information">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <Info icon={<FiBookOpen />} label="Topic Name" value={topic.topicName} />
          <Info icon={<FiHash />} label="Topic Code" value={topic.topicCode} />
          <Info
            icon={<FiBarChart2 />}
            label="Status"
            value={topic.status ? TOPIC_STATUS_LABELS[topic.status as keyof typeof TOPIC_STATUS_LABELS] ?? topic.status : "---"}
          />
          <Info icon={<FiFileText />} label="Version" value={topic.version} />
        </div>
      </Block>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <Block title="Description">
          <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap min-h-24">
            {topic.description || "---"}
          </p>
        </Block>

        <Block title="Timeline">
          <div className="space-y-2">
            <Info
              icon={<FiCalendar />}
              label="Created Date"
              value={topic.createdDate ? new Date(topic.createdDate).toLocaleString("vi-VN") : "---"}
            />
            <Info
              icon={<FiCalendar />}
              label="Updated Date"
              value={topic.updatedDate ? new Date(topic.updatedDate).toLocaleString("vi-VN") : "---"}
            />
          </div>
        </Block>
      </div>
    </div>
  );
}
