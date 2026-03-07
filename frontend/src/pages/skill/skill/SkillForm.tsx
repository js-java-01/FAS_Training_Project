import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skillApi, type SkillGroupData } from "@/api/skillApi";

interface SkillFormProps {
  open: boolean;
  groups: SkillGroupData[];
  defaultGroupId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function SkillForm({
  open,
  groups,
  defaultGroupId,
  onClose,
  onSaved,
}: SkillFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState(defaultGroupId ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setGroupId(defaultGroupId ?? "");
  }, [open, defaultGroupId]);

  const reset = () => {
    setName("");
    setCode("");
    setDescription("");
    setGroupId(defaultGroupId ?? "");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim() || !groupId) {
      toast.error("Name, code, and group are required");
      return;
    }
    setLoading(true);
    try {
      await skillApi.createSkill({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        groupId,
      });
      toast.success("Skill created");
      reset();
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to create skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-500" />
            Create Skill
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Skill Group <span className="text-red-500">*</span>
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select a group —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. REACT"
                maxLength={20}
                className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the skill…"
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Creating…" : "Create Skill"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
