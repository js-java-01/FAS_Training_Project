import { useState } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skillApi } from "@/api/skillApi";

interface SkillGroupFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SkillGroupForm({
  open,
  onClose,
  onSaved,
}: SkillGroupFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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
      await skillApi.createGroup({
        name: name.trim(),
        code: code.trim().toUpperCase(),
      });
      toast.success("Skill group created");
      reset();
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to create group");
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
            <Layers className="h-4 w-4 text-blue-500" />
            Create Skill Group
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Technical Group"
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
              placeholder="e.g. TECH"
              maxLength={10}
              className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {loading ? "Creating…" : "Create Group"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
