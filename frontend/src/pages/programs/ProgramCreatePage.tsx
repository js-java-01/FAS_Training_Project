import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { topicApi, type Topic } from "@/api/topicApi";

type FormState = {
  name: string;
  version: string;
  description: string;
};

type SelectableTopic = {
  id: string;
  code: string;
  name: string;
  level?: string;
};

const MOCK_TOPICS: SelectableTopic[] = [
  { id: "mock-1", code: "JAVA-CORE", name: "Java Core", level: "INTERMEDIATE" },
  { id: "mock-2", code: "SPRING-BOOT", name: "Spring Boot Web Development", level: "INTERMEDIATE" },
  { id: "mock-3", code: "DB-SQL", name: "SQL for Backend", level: "BEGINNER" },
  { id: "mock-4", code: "DSA", name: "Data Structures & Algorithms", level: "ADVANCED" },
];

export default function ProgramCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [form, setForm] = useState<FormState>({
    name: "",
    version: "1.0.0",
    description: "",
  });
  const [topicKeyword, setTopicKeyword] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<SelectableTopic[]>([]);

  const { data: topicData, isLoading: isTopicLoading } = useQuery({
    queryKey: ["program-create-topics"],
    queryFn: () => topicApi.getTopics({ page: 0, size: 100, sort: "topicName,asc" }),
  });

  const topicPool = useMemo<SelectableTopic[]>(() => {
    const fromApi = (topicData?.items || []).map((topic: Topic) => ({
      id: topic.id,
      code: topic.topicCode,
      name: topic.topicName,
      level: topic.level,
    }));
    return fromApi.length > 0 ? fromApi : MOCK_TOPICS;
  }, [topicData]);

  const availableTopics = useMemo(() => {
    const selectedIds = new Set(selectedTopics.map((topic) => topic.id));
    return topicPool.filter(
      (topic) =>
        !selectedIds.has(topic.id) &&
        (`${topic.code} ${topic.name}`).toLowerCase().includes(topicKeyword.toLowerCase()),
    );
  }, [topicPool, selectedTopics, topicKeyword]);

  const filteredSelectedTopics = useMemo(
    () =>
      selectedTopics.filter((topic) =>
        `${topic.code} ${topic.name}`.toLowerCase().includes(selectedKeyword.toLowerCase()),
      ),
    [selectedTopics, selectedKeyword],
  );

  const validate = () => {
    const nextErrors: Partial<FormState> = {};

    if (!form.name.trim()) nextErrors.name = "Program name is required";
    if (!form.version.trim()) {
      nextErrors.version = "Version is required";
    } else if (!/^\d+(\.\d+)*$/.test(form.version.trim())) {
      nextErrors.version = "Version must contain only numbers and dots (e.g. 1.0, 2.0)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await trainingProgramApi.createTrainingProgram({
        name: form.name.trim(),
        version: form.version.trim(),
        description: form.description.trim() || undefined,
        topicIds: selectedTopics.map((topic) => topic.id),
      });

      await queryClient.invalidateQueries({ queryKey: ["training-programs"] });
      toast.success("Training program created successfully");
      navigate("/programs");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create training program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTopic = (topic: SelectableTopic) => {
    if (selectedTopics.some((item) => item.id === topic.id)) return;
    setSelectedTopics((prev) => [...prev, topic]);
  };

  const removeTopic = (topicId: string) => {
    setSelectedTopics((prev) => prev.filter((topic) => topic.id !== topicId));
  };

  return (
    <MainLayout pathName={{ programs: "Training Programs", new: "Create New" }}>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Training Program</h1>
          <p className="text-muted-foreground">
            Fill in details to create a new training program.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Program Information</CardTitle>
              <CardDescription>
                Core fields for training program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{form.name.length}/100</span>
                </div>
                <Input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Enter training program name"
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{form.version.length}/20</span>
                </div>
                <Input
                  value={form.version}
                  onChange={(event) => handleChange("version", event.target.value)}
                  placeholder="e.g. 1.0.0"
                  maxLength={20}
                />
                {errors.version && <p className="text-sm text-red-500">{errors.version}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Description</label>
                  <span className="text-xs text-muted-foreground">{form.description.length}/500</span>
                </div>
                <Textarea
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  placeholder="Enter training program description"
                  rows={7}
                  maxLength={300}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Topics</CardTitle>
              <CardDescription>Choose or search a topic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={topicKeyword}
                  onChange={(event) => setTopicKeyword(event.target.value)}
                  placeholder="Choose or Search a Topic"
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md h-96 overflow-y-auto">
                {isTopicLoading ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">
                    Loading topics...
                  </div>
                ) : availableTopics.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">
                    No topics available
                  </div>
                ) : (
                  availableTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => addTopic(topic)}
                      className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-accent transition"
                    >
                      <p className="text-sm font-medium">[{topic.code}] - {topic.name}</p>
                      <p className="text-xs text-muted-foreground">Level: {topic.level || "-"}</p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Selected Topics</CardTitle>
              <CardDescription>{selectedTopics.length} topic(s) selected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={selectedKeyword}
                  onChange={(event) => setSelectedKeyword(event.target.value)}
                  placeholder="Search selected topics"
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md h-96 overflow-y-auto p-2 space-y-2">
                {filteredSelectedTopics.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">
                    No topics selected
                  </div>
                ) : (
                  filteredSelectedTopics.map((topic) => (
                    <div key={topic.id} className="border rounded-md p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">[{topic.code}]</p>
                          <p className="text-sm">{topic.name}</p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {topic.level || "-"}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTopic(topic.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Selected topics will be submitted as topicIds when creating the program.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/programs")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
