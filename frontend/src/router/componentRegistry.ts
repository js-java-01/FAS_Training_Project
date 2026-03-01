import type { ComponentType } from "react";
import { UserManagement } from "@/pages/UserManagement";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import { RoleManagement } from "@/pages/RoleManagement.tsx";
import { StudentClassManagement } from "@/pages/training-classes/trainee/StudentClassManagement";
import { OwnClassPage } from "@/pages/training-classes/trainee/OwnClassPage";
import TrainingClassesManagement from "@/pages/training-classes/TrainingClassesManagement";
import TrainerClassesManagement from "@/pages/training-classes/trainer/TrainerClassesManagament";


export const componentRegistry: Record<string, ComponentType> = {
  "/dashboard": Dashboard,
  "/users": UserManagement,
  "/modules": ModulesManagement,
  "/moduleGroups": ModuleGroupsManagement,
  "/training-classes": TrainingClassesManagement,
  "/notFoundPage": NotFoundPage,
  "/roles": RoleManagement,
  "/classes": StudentClassManagement,
  "/my-classes": OwnClassPage,
  "/trainer-semesters": TrainerClassesManagement,

};
