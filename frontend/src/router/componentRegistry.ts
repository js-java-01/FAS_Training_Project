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
import LocationsManagement from "@/pages/locations/LocationsManagement";
import PermissionsManagement from "@/pages/permissions/PermissionsManagement";
import TopicManagement from "@/pages/topic/TopicManagement";
import ProgramManagement from "@/pages/programs/ProgramManagement";
import ClassesComponent from "@/pages/classes/ClassesManagement";


export const componentRegistry: Record<string, ComponentType> = {
  "/dashboard": Dashboard,
  "/users": UserManagement,
  "/modules": ModulesManagement,
  "/moduleGroups": ModuleGroupsManagement,
  "/notFoundPage": NotFoundPage,
  "/roles": RoleManagement,
  "/classes": ClassesComponent,
  "/my-classes": OwnClassPage,
  "/trainer-semesters": TrainerClassesManagement,
  "/locations": LocationsManagement,
  "/permissions": PermissionsManagement,
  "/topics": TopicManagement,
  "/programs": ProgramManagement,

};
