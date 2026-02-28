import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  topicApi,
  type TopicSkillResponse,
  type SkillResponse,
  type SkillGroup,
} from "@/api/topicApi";

/* ─── Types ─── */
interface EditableSkill extends TopicSkillResponse {
  _isNew?: boolean;
}

/* ─── Main component ───────────────────────────────────────── */
export function TopicSkillsTab({
  topicId,
  isEditMode,
}: {
  topicId: string;
  isEditMode: boolean;
}) {
  const [skills, setSkills] = useState<TopicSkillResponse[]>([]);
  const [editSkills, setEditSkills] = useState<EditableSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);

  /* ─── Fetch ─── */
  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await topicApi.getTopicSkills(topicId);
      setSkills(data);
    } catch {
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  /* sync edit state when entering edit mode */
  useEffect(() => {
    if (isEditMode) setEditSkills([...skills]);
  }, [isEditMode, skills]);

  /* ─── Edit handlers ─── */
  const toggleRequired = (skillId: string) => {
    setEditSkills((prev) =>
      prev.map((s) =>
        s.skillId === skillId ? { ...s, required: !s.required } : s,
      ),
    );
  };

  const removeSkill = (skillId: string) => {
    setEditSkills((prev) => prev.filter((s) => s.skillId !== skillId));
  };

  const handleAddSkills = (selected: SkillResponse[]) => {
    const existing = new Set(editSkills.map((s) => s.skillId));
    const toAdd: EditableSkill[] = selected
      .filter((s) => !existing.has(s.id))
      .map((s) => ({
        topicSkillId: "",
        skillId: s.id,
        skillName: s.name,
        code: s.code,
        groupName: s.groupName,
        description: s.description,
        required: false,
        _isNew: true,
      }));
    setEditSkills((prev) => [...prev, ...toAdd]);
    setShowAddPanel(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await topicApi.updateTopicSkills(topicId, {
        skills: editSkills.map((s) => ({
          skillId: s.skillId,
          required: s.required,
        })),
      });
      toast.success("Skills saved successfully");
      await fetchSkills();
    } catch {
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditSkills([...skills]);
  };

  /* ─── Derived display list ─── */
  const displaySkills = isEditMode ? editSkills : skills;

  /* ─── Loading / empty states ─── */
  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        Loading skills…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          Topic Skills
        </h2>
        {isEditMode && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddPanel(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Skills
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
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
                Required
              </th>
              {isEditMode && (
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displaySkills.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditMode ? 7 : 6}
                  className="py-12 text-center text-gray-400"
                >
                  No skills mapped to this topic yet.
                  {isEditMode && (
                    <span className="block mt-1 text-xs">
                      Click "+ Add Skills" to get started.
                    </span>
                  )}
                </td>
              </tr>
            ) : (
              displaySkills.map((skill, idx) => (
                <tr key={skill.skillId} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {skill.skillName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {skill.code}
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
                    {isEditMode ? (
                      <input
                        type="checkbox"
                        checked={skill.required}
                        onChange={() => toggleRequired(skill.skillId)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          skill.required
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 border"
                        }`}
                      >
                        {skill.required ? "Required" : "Optional"}
                      </span>
                    )}
                  </td>
                  {isEditMode && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeSkill(skill.skillId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                        title="Remove skill"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Skills Panel */}
      <AddSkillsDialog
        open={showAddPanel}
        topicId={topicId}
        alreadyMapped={editSkills.map((s) => s.skillId)}
        onAdd={handleAddSkills}
        onCancel={() => setShowAddPanel(false)}
      />
    </div>
  );
}

/* ─── Add Skills Sidebar ────────────────────────────────────── */
function AddSkillsDialog({
  open,
  topicId,
  alreadyMapped,
  onAdd,
  onCancel,
}: {
  open: boolean;
  topicId: string;
  alreadyMapped: string[];
  onAdd: (skills: SkillResponse[]) => void;
  onCancel: () => void;
}) {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  const [available, setAvailable] = useState<SkillResponse[]>([]);
  const [selected, setSelected] = useState<Map<string, SkillResponse>>(
    new Map(),
  );
  const [groupId, setGroupId] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  /* fetch groups once */
  useEffect(() => {
    if (!open) return;
    topicApi
      .getSkillGroups()
      .then(setGroups)
      .catch(() => {});
    setSelected(new Map());
    setGroupId("");
    setKeyword("");
  }, [open]);

  /* fetch available skills */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    topicApi
      .getAvailableSkills(topicId, groupId || undefined, keyword || undefined)
      .then((data) => {
        setAvailable(data.filter((s) => !alreadyMapped.includes(s.id)));
      })
      .catch(() => toast.error("Failed to load available skills"))
      .finally(() => setLoading(false));
  }, [open, topicId, groupId, keyword]);

  const toggleSelect = (skill: SkillResponse) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(skill.id)) next.delete(skill.id);
      else next.set(skill.id, skill);
      return next;
    });
  };

  const handleAdd = () => onAdd(Array.from(selected.values()));

  const selectedList = Array.from(selected.values());

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onCancel()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-200 sm:max-w-200 flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-4 border-b shrink-0 space-y-0">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4 text-blue-500" />
            Add Skills to Topic
          </SheetTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={selectedList.length === 0}
              onClick={handleAdd}
            >
              Add ({selectedList.length})
            </Button>
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="px-6 py-4 border-b shrink-0 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
              <Users className="h-3 w-3" />
              Skill Group
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
              <Search className="h-3 w-3" />
              Search Skills
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Selection summary */}
        {selectedList.length > 0 && (
          <div className="px-6 py-3 border-b bg-gray-50 shrink-0">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Selected: {selectedList.length} skill(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedList.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 text-xs font-medium shadow-sm"
                >
                  {s.name}
                  <button
                    onClick={() => toggleSelect(s)}
                    className="text-gray-400 hover:text-gray-700 ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills list */}
        <div className="overflow-auto flex-1 px-6 py-2">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              Loading skills…
            </div>
          ) : available.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No skills available to add.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b">
                <tr>
                  <th className="w-10 py-2.5" />
                  <th className="text-left py-2.5 pr-4 font-medium text-gray-600">
                    Skill Name
                  </th>
                  <th className="text-left py-2.5 pr-4 font-medium text-gray-600">
                    Code
                  </th>
                  <th className="text-left py-2.5 pr-4 font-medium text-gray-600">
                    Group
                  </th>
                  <th className="text-left py-2.5 font-medium text-gray-600">
                    Required
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {available.map((skill) => {
                  const isChecked = selected.has(skill.id);
                  return (
                    <tr
                      key={skill.id}
                      className={`cursor-pointer hover:bg-gray-50 ${isChecked ? "bg-blue-50/40" : ""}`}
                      onClick={() => toggleSelect(skill)}
                    >
                      <td className="py-3 pl-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(skill)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-800">
                        {skill.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 font-mono text-xs">
                        {skill.code}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                          {skill.groupName}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">—</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
