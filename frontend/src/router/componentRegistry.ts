import type { ComponentType } from "react";
import { UserManagement } from "@/pages/UserManagement";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import { RoleManagement } from "@/pages/role/RoleManagement";
import LocationsManagement from "@/pages/locations/LocationsManagement";
import ClassesComponent from "@/pages/classes/ClassesManagement";
import PermissionsManagement from "@/pages/permissions/PermissionsManagement";
import { TopicManagement } from "@/pages/topic/TopicManagement";
import SkillManagementPage from "@/pages/skill/SkillManagementPage";


export const componentRegistry: Record<string, ComponentType> = {
    "/dashboard": Dashboard,
    "/users": UserManagement,
    "/modules": ModulesManagement,
    "/moduleGroups": ModuleGroupsManagement,
    "/notFoundPage": NotFoundPage,
    "/roles": RoleManagement,
    "/classes": ClassesComponent,
    "/locations": LocationsManagement,
    "/permissions": PermissionsManagement,
    "/topics": TopicManagement,
    "/skills": SkillManagementPage,
};
