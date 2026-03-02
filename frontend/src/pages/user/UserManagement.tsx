import React from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import UserTable from "./UserTable";

export const UserManagement: React.FC = () => {
  return (
    <MainLayout pathName={{ users: "User Management" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <UserTable />
      </div>
    </MainLayout>
  );
};
