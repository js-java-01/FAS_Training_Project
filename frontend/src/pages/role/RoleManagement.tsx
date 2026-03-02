import React from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import RoleTable from "./RoleTable";

export const RoleManagement: React.FC = () => {
  return (
    <MainLayout pathName={{ roles: "Role Management" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <RoleTable />
      </div>
    </MainLayout>
  );
};
