import { MainLayout } from "@/components/layout/MainLayout";
import SkillGroupTable from "./skill_groups/SkillGroupTable";

export default function SkillGroupManagementPage() {
  return (
    <MainLayout pathName={{ skillGroups: "Skill Group Management" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <SkillGroupTable />
      </div>
    </MainLayout>
  );
}
