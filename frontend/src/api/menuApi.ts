import axiosInstance from './axiosInstance';
import { Menu, MenuItem, CreateMenuRequest, CreateMenuItemRequest } from '../types/menu';

export const menuApi = {
  getAllMenus: async (page = 0, size = 20, sort = 'displayOrder,asc') => {
    const response = await axiosInstance.get<{content: Menu[], totalElements: number, totalPages: number}>(
      `/menus?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data;
  },

  getAllMenusList: async (): Promise<Menu[]> => {
    const response = await axiosInstance.get<Menu[]>('/menus/list');
    return response.data;
  },

  getActiveMenus: async (): Promise<Menu[]> => {
    const response = await axiosInstance.get<Menu[]>('/menus/active');
    return response.data;
  },

  getMenuById: async (id: string): Promise<Menu> => {
    const response = await axiosInstance.get<Menu>(`/menus/${id}`);
    return response.data;
  },

  createMenu: async (menu: CreateMenuRequest): Promise<Menu> => {
    const response = await axiosInstance.post<Menu>('/menus', menu);
    return response.data;
  },

  updateMenu: async (id: string, menu: Partial<Menu>): Promise<Menu> => {
    const response = await axiosInstance.put<Menu>(`/menus/${id}`, menu);
    return response.data;
  },

  deleteMenu: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/menus/${id}`);
  },

  toggleMenuStatus: async (id: string): Promise<Menu> => {
    const response = await axiosInstance.post<Menu>(`/menus/${id}/toggle-status`);
    return response.data;
  },
};

export const menuItemApi = {
  getAllMenuItems: async (page = 0, size = 100, sort = 'displayOrder,asc') => {
    const response = await axiosInstance.get<{content: MenuItem[], totalElements: number, totalPages: number}>(
      `/menu-items?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data;
  },

  getMenuItemsByMenu: async (menuId: string): Promise<MenuItem[]> => {
    const response = await axiosInstance.get<MenuItem[]>(`/menu-items/menu/${menuId}`);
    return response.data;
  },

  getRootMenuItems: async (menuId: string): Promise<MenuItem[]> => {
    const response = await axiosInstance.get<MenuItem[]>(`/menu-items/menu/${menuId}/root`);
    return response.data;
  },

  getChildMenuItems: async (parentId: string): Promise<MenuItem[]> => {
    const response = await axiosInstance.get<MenuItem[]>(`/menu-items/parent/${parentId}`);
    return response.data;
  },

  getMenuItemById: async (id: string): Promise<MenuItem> => {
    const response = await axiosInstance.get<MenuItem>(`/menu-items/${id}`);
    return response.data;
  },

  createMenuItem: async (menuItem: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await axiosInstance.post<MenuItem>('/menu-items', menuItem);
    return response.data;
  },

  updateMenuItem: async (id: string, menuItem: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await axiosInstance.put<MenuItem>(`/menu-items/${id}`, menuItem);
    return response.data;
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/menu-items/${id}`);
  },

  toggleMenuItemStatus: async (id: string): Promise<MenuItem> => {
    const response = await axiosInstance.post<MenuItem>(`/menu-items/${id}/toggle-status`);
    return response.data;
  },
};
