import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { ClientDataTable } from "@/components/data_table/ClientDataTable";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import { FacetedFilter } from "@/components/FacedFilter";
import type { SkillData } from "@/api/skillApi";
import { skillApi } from "@/api/skillApi";
import {
  useExportSkills,
  useImportSkills,
  useDownloadSkillTemplate,
} from "@/pages/skill/services/mutations";
import {
  useGetSkills,
  useGetSkillGroups,
  useSkillInvalidate,
} from "@/pages/skill/services/queries";
import { getSkillColumns } from "./column";
import { SkillForm } from "./SkillForm";

export default function SkillTable() {
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [deleting, setDeleting] = useState<SkillData | null>(null);
  const [groupFilter, setGroupFilter] = useState<string[]>([]);

  const { data: skills = [], isLoading, isFetching } = useGetSkills();
  const { data: groups = [] } = useGetSkillGroups();
  const { invalidateSkills, invalidateAll } = useSkillInvalidate();

  /* ── pre-filter by group ────────────────────────────────── */
  const filteredSkills = useMemo(() => {
    if (groupFilter.length === 0) return skills;
    return skills.filter((s) => groupFilter.includes(s.groupName));
  }, [skills, groupFilter]);

  /* ── handlers ──────────────────────────────────────────── */
  const handleSaved = async () => {
    await invalidateSkills();
    setOpenForm(false);
    setSelectedSkill(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await skillApi.deleteSkill(deleting.id);
      toast.success("Skill deleted");
      await invalidateAll();
    } catch {
      toast.error("Failed to delete skill");
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => {
    setSelectedSkill(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const openEdit = (skill: SkillData) => {
    setSelectedSkill(skill);
    setFormMode("edit");
    setOpenForm(true);
  };

  const openView = (skill: SkillData) => {
    setSelectedSkill(skill);
    setFormMode("view");
    setOpenForm(true);
  };

  /* ── columns ────────────────────────────────────────────── */
  const columns = useMemo(
    () =>
      getSkillColumns({
        onView: openView,
        onEdit: openEdit,
        onDelete: setDeleting,
      }),
    [],
  );

  /* ── group options for FacetedFilter ───────────────────── */
  const groupOptions = useMemo(
    () => groups.map((g) => ({ value: g.name, label: g.name })),
    [groups],
  );

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ClientDataTable<SkillData, unknown>
        columns={columns as ColumnDef<SkillData, unknown>[]}
        data={filteredSkills}
        isLoading={isLoading}
        isFetching={isFetching}
        isSearch
        searchValue={["name", "code", "groupName"]}
        headerActions={
          <div className="flex gap-2">
            <EntityImportExportButton
              title="Skills"
              useImportHook={useImportSkills}
              useExportHook={useExportSkills}
              useTemplateHook={useDownloadSkillTemplate}
              onImportSuccess={() => void invalidateAll()}
            />
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              Add New Skill
            </Button>
          </div>
        }
        facetedFilters={
          <FacetedFilter
            title="Group"
            options={groupOptions}
            value={groupFilter}
            setValue={setGroupFilter}
            multiple={false}
          />
        }
      />

      <SkillForm
        open={openForm}
        mode={formMode}
        groups={groups}
        initialData={selectedSkill ?? undefined}
        onClose={() => {
          setOpenForm(false);
          setSelectedSkill(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete Skill"
        description={`Are you sure you want to delete "${deleting?.name}"? This will remove it from all linked topics.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
