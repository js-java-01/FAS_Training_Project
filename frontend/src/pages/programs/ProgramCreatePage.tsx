import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const TOPIC_OPTIONS = [
  "[CONTENT-CREATOR] - Content Creation for Digital Platforms - version: v1.0",
  "[UX-RESEARCH] - User Experience Research - version: v1.0",
  "[PRODUCT-MGMT] - Product Management for Tech Products - version: v1.0",
  "[DATA-GOVERN] - Data Governance & Compliance - version: v1.0",
  "[CLOUD-SEC] - Cloud Security Best Practices - version: v1.0",
  "[NETWORK-BASICS] - Computer Network - version: v1.0",
  "[SHELL-SCRIPT] - Shell Scripting for Automation - version: v1.0",
  "[LINUX-INTRO] - Linux Command Line - version: v1.0",
];

export default function ProgramCreatePage() {
  const navigate = useNavigate();
  const [topicKeyword, setTopicKeyword] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const filteredTopics = useMemo(
    () =>
      TOPIC_OPTIONS.filter((topic) =>
        topic.toLowerCase().includes(topicKeyword.toLowerCase()),
      ),
    [topicKeyword],
  );

  const filteredSelectedTopics = useMemo(
    () =>
      selectedTopics.filter((topic) =>
        topic.toLowerCase().includes(selectedKeyword.toLowerCase()),
      ),
    [selectedTopics, selectedKeyword],
  );

  const addTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) return;
    setSelectedTopics((prev) => [...prev, topic]);
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics((prev) => prev.filter((item) => item !== topic));
  };

  return (
    <MainLayout pathName={{ programs: "Programs", new: "New" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Create New Training Program</h1>
          <p className="text-muted-foreground">Fill in the details to create a new training program</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="xl:col-span-1 border rounded-lg p-4 space-y-3 overflow-y-auto">
            <FormField label="Code" required maxText="0/50" placeholder="Enter code" />
            <FormField label="Version" required maxText="5/10" defaultValue="1.0.0" />
            <SelectField label="Location" required value="Select location" />
            <FormField label="Name" required maxText="0/50" placeholder="Enter name" />
            <SelectField label="Technical Group" required value="Common" />
            <FormField label="Content Link" maxText="0/300" placeholder="https://..." />
            <FormField label="Logo" maxText="0/300" placeholder="Logo URL" />
            <TextAreaField label="Description" maxText="0/300" placeholder="Enter description" />
          </div>

          <div className="xl:col-span-1 border rounded-lg p-4 flex flex-col min-h-0">
            <label className="text-sm font-semibold mb-2">Topic *</label>
            <input
              value={topicKeyword}
              onChange={(e) => setTopicKeyword(e.target.value)}
              placeholder="Choose or Search a Topic"
              className="h-10 px-3 border rounded-md text-sm mb-2"
            />
            <div className="border rounded-md overflow-y-auto flex-1">
              {filteredTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => addTopic(topic)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent border-b last:border-b-0"
                  type="button"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-1 border rounded-lg p-4 flex flex-col min-h-0">
            <label className="text-sm font-semibold mb-2">Selected Topic *</label>
            <input
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              placeholder="Search selected topics"
              className="h-10 px-3 border rounded-md text-sm mb-2"
            />

            <div className="border rounded-md overflow-y-auto flex-1 p-2 space-y-2">
              {filteredSelectedTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center pt-4">No topics selected</p>
              ) : (
                filteredSelectedTopics.map((topic) => (
                  <div key={topic} className="flex items-center justify-between gap-2 border rounded px-2 py-1.5">
                    <p className="text-sm line-clamp-2">{topic}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTopic(topic)}>
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/programs")}>Cancel</Button>
          <Button
            onClick={() => navigate("/programs")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

function FormField({
  label,
  required,
  maxText,
  defaultValue,
  placeholder,
}: {
  label: string;
  required?: boolean;
  maxText?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {maxText && <span className="text-xs text-muted-foreground">{maxText}</span>}
      </div>
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full px-3 border rounded-md text-sm"
      />
    </div>
  );
}

function TextAreaField({
  label,
  maxText,
  placeholder,
}: {
  label: string;
  maxText?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">{label}</label>
        {maxText && <span className="text-xs text-muted-foreground">{maxText}</span>}
      </div>
      <textarea
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-md text-sm resize-none"
        rows={4}
      />
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
}: {
  label: string;
  required?: boolean;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="h-10 w-full px-3 border rounded-md text-sm bg-background">
        <option>{value}</option>
      </select>
    </div>
  );
}
