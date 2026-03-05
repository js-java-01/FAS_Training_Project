import { MainLayout } from "@/components/layout/MainLayout";
import SkillTable from "./skill/SkillTable";

export default function SkillManagementPage() {
  return (
    <MainLayout pathName={{ skills: "Skill Management" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <SkillTable />
      </div>
    </MainLayout>
  );
}
