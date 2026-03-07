import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { ClientDataTable } from "@/components/data_table/ClientDataTable";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import type { SkillGroupData } from "@/api/skillApi";
import { skillApi } from "@/api/skillApi";
import {
  useExportGroups,
  useImportGroups,
  useDownloadGroupTemplate,
} from "@/pages/skill/services/mutations";
import {
  useGetSkillGroups,
  useSkillInvalidate,
} from "@/pages/skill/services/queries";
import { getSkillGroupColumns } from "./column";
import { SkillGroupForm } from "./SkillGroupForm";

export default function SkillGroupTable() {
  const [openForm, setOpenForm] = useState(false);
  const [deleting, setDeleting] = useState<SkillGroupData | null>(null);

  const { data: groups = [], isLoading, isFetching } = useGetSkillGroups();
  const { invalidateGroups, invalidateAll } = useSkillInvalidate();

  /* ── handlers ─────────────────────────────────────────── */
  const handleSaved = async () => {
    await invalidateGroups();
    setOpenForm(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await skillApi.deleteGroup(deleting.id);
      toast.success("Skill group deleted");
      await invalidateAll(); // skills count changes too
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ?? "Cannot delete group with skills",
      );
    } finally {
      setDeleting(null);
    }
  };

  /* ── columns ───────────────────────────────────────────── */
  const columns = useMemo(
    () => getSkillGroupColumns({ onDelete: setDeleting }),
    [],
  );

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ClientDataTable<SkillGroupData, unknown>
        columns={columns as ColumnDef<SkillGroupData, unknown>[]}
        data={groups}
        isLoading={isLoading}
        isFetching={isFetching}
        isSearch
        searchValue={["name", "code"]}
        headerActions={
          <div className="flex gap-2">
            <EntityImportExportButton
              title="Skill Groups"
              useImportHook={useImportGroups}
              useExportHook={useExportGroups}
              useTemplateHook={useDownloadGroupTemplate}
              onImportSuccess={() => void invalidateGroups()}
            />
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => setOpenForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Group
            </Button>
          </div>
        }
      />

      <SkillGroupForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete Skill Group"
        description={`Are you sure you want to delete "${deleting?.name}"? The group must be empty.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
