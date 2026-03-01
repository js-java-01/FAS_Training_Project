import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FormState = {
  name: string;
  version: string;
  description: string;
};

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

  const validate = () => {
    const nextErrors: Partial<FormState> = {};

    if (!form.name.trim()) nextErrors.name = "Program name is required";
    if (!form.version.trim()) nextErrors.version = "Version is required";

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

  return (
    <MainLayout pathName={{ programs: "Programs", new: "New" }}>
      <div className="mx-auto w-full max-w-4xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Training Program</h1>
          <p className="text-muted-foreground">
            Create program with basic information first. Program courses will be configured later.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Program Information</CardTitle>
              <CardDescription>
                These fields map directly to backend create API.
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
                  rows={8}
                  maxLength={500}
                />
              </div>
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
