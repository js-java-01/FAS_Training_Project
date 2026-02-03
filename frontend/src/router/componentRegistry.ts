import type { ComponentType } from "react";
import { UserManagement } from "@/pages/UserManagement";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import {RoleManagement} from "@/pages/RoleManagement.tsx";

export const componentRegistry: Record<string, ComponentType> = {
    "/dashboard": Dashboard,
    "/users": UserManagement,
    "/modules": ModulesManagement,
    "/moduleGroups": ModuleGroupsManagement,
    "/notFoundPage": NotFoundPage,
    "/roles": RoleManagement,
};
