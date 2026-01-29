export interface Menu {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  menuItems: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  menuId: string;
  parentId?: string;
  title: string;
  url?: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  requiredPermission?: string;
  children: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuRequest {
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateMenuItemRequest {
  menuId: string;
  parentId?: string;
  title: string;
  url?: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
  requiredPermission?: string;
}
