import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Search, Award, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { skillApi, type SkillGroupData, type SkillData } from "@/api/skillApi";
import { MainLayout } from "@/components/layout/MainLayout";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import {
  useExportSkills,
  useImportSkills,
  useDownloadSkillTemplate,
} from "./services/mutations";

/* ══════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════ */
export default function SkillManagementPage() {
  const [groups, setGroups] = useState<SkillGroupData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SkillGroupData | null>(
    null,
  );
  const [keyword, setKeyword] = useState("");
  const [groupKeyword, setGroupKeyword] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  /* Modals */
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateSkill, setShowCreateSkill] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);

  /* ─── Fetch groups ─── */
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await skillApi.getGroups();
      setGroups(data);
    } catch {
      toast.error("Failed to load skill groups");
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  /* ─── Fetch skills ─── */
  const fetchSkills = useCallback(async () => {
    setLoadingSkills(true);
    try {
      const data = await skillApi.getSkills(
        selectedGroup?.id,
        keyword || undefined,
      );
      setSkills(data);
    } catch {
      toast.error("Failed to load skills");
    } finally {
      setLoadingSkills(false);
    }
  }, [selectedGroup, keyword]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  /* ─── Delete group ─── */
  const handleDeleteGroup = async (id: string) => {
    try {
      await skillApi.deleteGroup(id);
      toast.success("Skill group deleted");
      setDeletingGroupId(null);
      if (selectedGroup?.id === id) setSelectedGroup(null);
      fetchGroups();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ?? "Cannot delete group with skills",
      );
    }
  };

  /* ─── Delete skill ─── */
  const handleDeleteSkill = async (id: string) => {
    try {
      await skillApi.deleteSkill(id);
      toast.success("Skill deleted");
      setDeletingSkillId(null);
      fetchSkills();
      fetchGroups(); // refresh skillCount
    } catch {
      toast.error("Failed to delete skill");
    }
  };

  return (
    <MainLayout pathName={{ skills: "Skill Management" }}>
      <div className="space-y-6">
        {/* Page-level toolbar */}
        <div className="flex items-center justify-end">
          <EntityImportExportButton
            title="Skills & Groups"
            useImportHook={useImportSkills}
            useExportHook={useExportSkills}
            useTemplateHook={useDownloadSkillTemplate}
          />
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* ── LEFT: Skill Groups ── */}
          <div className="col-span-1 border rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/60">
              <h2 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-blue-500" />
                Skill Groups
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {groups.length}
                </span>
              </h2>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-7 text-xs"
                  onClick={() => setShowCreateGroup(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Group
                </Button>
              </div>
            </div>

            {/* Group search */}
            <div className="px-5 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups…"
                  value={groupKeyword}
                  onChange={(e) => setGroupKeyword(e.target.value)}
                  className="border rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>

            {loadingGroups ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Loading…
              </div>
            ) : groups.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No skill groups yet.
              </div>
            ) : (
              <ul className="divide-y">
                {groups
                  .filter(
                    (g) =>
                      groupKeyword.trim() === "" ||
                      g.name
                        .toLowerCase()
                        .includes(groupKeyword.toLowerCase()) ||
                      g.code.toLowerCase().includes(groupKeyword.toLowerCase()),
                  )
                  .map((g) => {
                    const isActive = selectedGroup?.id === g.id;
                    return (
                      <li
                        key={g.id}
                        onClick={() => setSelectedGroup(isActive ? null : g)}
                        className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors group ${
                          isActive
                            ? "bg-blue-50 border-l-2 border-blue-500"
                            : "hover:bg-gray-50 border-l-2 border-transparent"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm truncate">
                              {g.name}
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                              ({g.code})
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {g.skillCount} skill{g.skillCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingGroupId(g.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1 rounded transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight
                            className={`h-4 w-4 transition-colors ${isActive ? "text-blue-500" : "text-gray-300"}`}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* ── RIGHT: Skills ── */}
          <div className="col-span-2 border rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/60">
              <h2 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-blue-500" />
                Skills
                {selectedGroup && (
                  <span className="ml-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {selectedGroup.name}
                  </span>
                )}
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {skills.length}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search skills…"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  />
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-7 text-xs"
                  onClick={() => setShowCreateSkill(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Skill
                </Button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-10">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Skill Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Code
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Group
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingSkills ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
                        Loading skills…
                      </td>
                    </tr>
                  ) : skills.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
                        {selectedGroup
                          ? `No skills in "${selectedGroup.name}" yet.`
                          : "No skills found."}
                      </td>
                    </tr>
                  ) : (
                    skills.map((skill, idx) => (
                      <tr key={skill.id} className="hover:bg-gray-50/60 group">
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {skill.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {skill.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {skill.groupName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                          {skill.description || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeletingSkillId(skill.id)}
                            className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete skill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Modals ── */}
        <CreateGroupModal
          open={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onCreated={() => {
            fetchGroups();
            setShowCreateGroup(false);
          }}
        />

        <CreateSkillModal
          open={showCreateSkill}
          groups={groups}
          defaultGroupId={selectedGroup?.id}
          onClose={() => setShowCreateSkill(false)}
          onCreated={() => {
            fetchSkills();
            fetchGroups();
            setShowCreateSkill(false);
          }}
        />

        <ConfirmDeleteDialog
          open={!!deletingGroupId}
          title="Delete Skill Group"
          description="This group must be empty before deletion. This action cannot be undone."
          onCancel={() => setDeletingGroupId(null)}
          onConfirm={() =>
            deletingGroupId && handleDeleteGroup(deletingGroupId)
          }
        />

        <ConfirmDeleteDialog
          open={!!deletingSkillId}
          title="Delete Skill"
          description="This skill will be removed from all topics it is mapped to. Are you sure?"
          onCancel={() => setDeletingSkillId(null)}
          onConfirm={() =>
            deletingSkillId && handleDeleteSkill(deletingSkillId)
          }
        />
      </div>
    </MainLayout>
  );
}

/* ══════════════════════════════════════════════════════════════
   Create Group Modal
══════════════════════════════════════════════════════════════ */
function CreateGroupModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
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
      onCreated();
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
            <Users className="h-4 w-4 text-blue-500" />
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

/* ══════════════════════════════════════════════════════════════
   Create Skill Modal
══════════════════════════════════════════════════════════════ */
function CreateSkillModal({
  open,
  groups,
  defaultGroupId,
  onClose,
  onCreated,
}: {
  open: boolean;
  groups: SkillGroupData[];
  defaultGroupId?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
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
      onCreated();
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

/* ══════════════════════════════════════════════════════════════
   Confirm Delete Dialog
══════════════════════════════════════════════════════════════ */
function ConfirmDeleteDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-600">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
