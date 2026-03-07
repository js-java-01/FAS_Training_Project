import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skillApi, type SkillGroupData } from "@/api/skillApi";

interface SkillGroupFormProps {
  open: boolean;
  mode?: "create" | "edit" | "view";
  initialData?: SkillGroupData;
  onClose: () => void;
  onSaved: () => void;
}

export function SkillGroupForm({
  open,
  mode = "create",
  initialData,
  onClose,
  onSaved,
}: SkillGroupFormProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData && (isEdit || isView)) {
        setName(initialData.name);
        setCode(initialData.code);
      } else {
        setName("");
        setCode("");
      }
    }
  }, [open, initialData, isEdit, isView]);

  const reset = () => {
    setName("");
    setCode("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit && initialData) {
        await skillApi.updateGroup(initialData.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
        });
        toast.success("Skill group updated");
      } else {
        await skillApi.createGroup({
          name: name.trim(),
          code: code.trim().toUpperCase(),
        });
        toast.success("Skill group created");
      }
      reset();
      onSaved();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          `Failed to ${isEdit ? "update" : "create"} group`,
      );
    } finally {
      setLoading(false);
    }
  };

  const titleLabel = isView
    ? "View Skill Group"
    : isEdit
      ? "Edit Skill Group"
      : "Create Skill Group";
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
              <Users className="h-4 w-4 text-blue-500" />
            )}
            {titleLabel}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {isView && initialData && (
            <div className="flex items-center gap-2 py-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {initialData.skillCount} skill
                {initialData.skillCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Group Name {!isView && <span className="text-red-500">*</span>}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Technical Group"
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
              placeholder="e.g. TECH"
              maxLength={10}
              readOnly={isView}
              className={`${fieldCls} font-mono`}
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
                    : "Create Group"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
