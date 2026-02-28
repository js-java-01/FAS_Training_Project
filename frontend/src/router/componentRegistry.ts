import type { ComponentType } from "react";
import { UserManagement } from "@/pages/UserManagement";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import { RoleManagement } from "@/pages/RoleManagement.tsx";
import { StudentClassManagement } from "@/pages/classes/StudentClassManagement";
import TrainerClassesManagement from "@/pages/training-classes/trainer/TrainerClassesManagament";

export const componentRegistry: Record<string, ComponentType> = {
  "/dashboard": Dashboard,
  "/users": UserManagement,
  "/modules": ModulesManagement,
  "/moduleGroups": ModuleGroupsManagement,
  "/trainer-semesters": TrainerClassesManagement,
  "/notFoundPage": NotFoundPage,
  "/roles": RoleManagement,
  "/classes": StudentClassManagement,
};
