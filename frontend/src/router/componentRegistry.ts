import type { ComponentType } from "react";
import { UserManagement } from "@/pages/UserManagement";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import TrainingClassesManagement from "@/pages/training-classes/TrainingClassesManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import { RoleManagement } from "@/pages/role/RoleManagement";
import { StudentClassManagement } from "@/pages/classes/StudentClassManagement";
import LocationsManagement from "@/pages/locations/LocationsManagement";


export const componentRegistry: Record<string, ComponentType> = {
    "/dashboard": Dashboard,
    "/users": UserManagement,
    "/modules": ModulesManagement,
    "/moduleGroups": ModuleGroupsManagement,
    "/training-classes": TrainingClassesManagement,
    "/notFoundPage": NotFoundPage,
    "/roles": RoleManagement,
    "/classes": StudentClassManagement,
    "/locations": LocationsManagement
};
