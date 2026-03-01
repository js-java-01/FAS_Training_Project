export type IconKey =
  | "dashboard"
  | "layout-dashboard"
  | "home"
  | "menu"

  // Users
  | "users"
  | "users-round"
  | "person"
  | "people"
  | "user-check"
  | "user-plus"
  | "user-minus"
  | "user-cog"
  | "id-card"

  // Academic
  | "graduation-cap"
  | "school"
  | "university"
  | "book"
  | "books"
  | "book-open"
  | "library"
  | "notebook"
  | "notebook-pen"
  | "file-text"
  | "presentation"
  | "certificate"
  | "award"
  | "medal"

  // Class / Training
  | "calendar"
  | "clock"
  | "timer"
  | "clipboard"
  | "clipboard-check"
  | "clipboard-list"

  // Reports / Score
  | "bar-chart"
  | "line-chart"
  | "pie-chart"
  | "percent"
  | "trending-up"
  | "trending-down"

  // System
  | "settings"
  | "settings-2"
  | "security"
  | "shield"
  | "shield-check"
  | "key"
  | "lock"
  | "database"
  | "server"
  | "layers"
  | "folder"
  | "workflow"
  | "map-pin"

  // Code
  | "code"
  | "code-xml"
  | "code-2"
  | "braces"
  | "terminal"
  | "square-code"
  | "file-code"
  | "bug"
  | "git-branch"
  | "git-commit"
  | "git-pull-request"
  | "github"
  | "cpu"
  | "binary"
  | "command"
  | "wrench"
  | "hammer"
  | "settings-2"

  // Actions
  | "search"
  | "filter"
  | "download"
  | "upload"
  | "edit"
  | "check"
  | "x-circle"
  | "bell"
  | "star"
  | "target"
  | "rocket";

export interface ModuleGroup {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    modules: Module[];
    createdAt: string;
    updatedAt: string;
}


export interface Module {
    id: string;
    moduleGroupId: string;
    moduleGroupName: string;
    parentId?: string;

    title: string;
    name?: string; // Backend might return name instead of title
    url?: string;
    icon?: IconKey;
    description?: string;

    displayOrder: number;
    isActive: boolean;
    requiredPermission?: string;

    children: Module[];

    createdAt: string;
    updatedAt: string;
}


export interface CreateModuleGroupRequest {
    name: string;
    description?: string;
    displayOrder?: number;
}


export interface CreateModuleRequest {
    moduleGroupId: string;
    parentId?: string;

    title: string;
    url?: string;
    icon?: IconKey;
    description?: string;

    displayOrder?: number;
    requiredPermission?: string;
}
