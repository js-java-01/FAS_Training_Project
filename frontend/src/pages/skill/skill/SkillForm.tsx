import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Award, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skillApi, type SkillGroupData, type SkillData } from "@/api/skillApi";

interface SkillFormProps {
  open: boolean;
  mode?: "create" | "edit" | "view";
  groups: SkillGroupData[];
  defaultGroupId?: string;
  initialData?: SkillData;
  onClose: () => void;
  onSaved: () => void;
}

export function SkillForm({
  open,
  mode = "create",
  groups,
  defaultGroupId,
  initialData,
  onClose,
  onSaved,
}: SkillFormProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState(defaultGroupId ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData && (isEdit || isView)) {
        setName(initialData.name);
        setCode(initialData.code);
        setDescription(initialData.description ?? "");
        // resolve groupId from groupName
        const matchedGroup = groups.find(
          (g) => g.name === initialData.groupName,
        );
        setGroupId(matchedGroup?.id ?? "");
      } else {
        setName("");
        setCode("");
        setDescription("");
        setGroupId(defaultGroupId ?? "");
      }
    }
  }, [open, initialData, isEdit, isView, defaultGroupId, groups]);

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
      if (isEdit && initialData) {
        await skillApi.updateSkill(initialData.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          groupId,
        });
        toast.success("Skill updated");
      } else {
        await skillApi.createSkill({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          groupId,
        });
        toast.success("Skill created");
      }
      reset();
      onSaved();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          `Failed to ${isEdit ? "update" : "create"} skill`,
      );
    } finally {
      setLoading(false);
    }
  };

  const titleLabel = isView
    ? "View Skill"
    : isEdit
      ? "Edit Skill"
      : "Create Skill";

  const fieldCls = `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isView ? "bg-gray-50 text-gray-700 cursor-default" : ""}`;

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
            {isView ? (
              <Eye className="h-4 w-4 text-blue-500" />
            ) : (
              <Award className="h-4 w-4 text-blue-500" />
            )}
            {titleLabel}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Skill Group {!isView && <span className="text-red-500">*</span>}
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={isView}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isView ? "bg-gray-50 text-gray-700 cursor-default" : ""}`}
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
                Skill Name {!isView && <span className="text-red-500">*</span>}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React"
                readOnly={isView}
                className={fieldCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Code {!isView && <span className="text-red-500">*</span>}
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. REACT"
                maxLength={20}
                readOnly={isView}
                className={`${fieldCls} font-mono`}
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
              readOnly={isView}
              className={fieldCls}
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
              {isView ? "Close" : "Cancel"}
            </Button>
            {!isView && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                    ? "Save Changes"
                    : "Create Skill"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
