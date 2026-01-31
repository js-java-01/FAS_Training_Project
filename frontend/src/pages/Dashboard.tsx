import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PermissionGate } from "../components/PermissionGate";
import { MainLayout } from "../components/MainLayout";
import { dashboardApi, type DashboardStats } from "../api/dashboardApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { permissions } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : stats?.totalUsers || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{stats?.activeUsers || 0} active</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : stats?.totalRoles || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{stats?.activeRoles || 0} active</p>
            </div>
            <div className="text-4xl">🔐</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Menus</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : stats?.totalMenus || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{stats?.activeMenus || 0} active</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menu Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "..." : stats?.totalMenuItems || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Navigation items</p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PermissionGate permission="USER_READ">
          <Link to="/users" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </Link>
        </PermissionGate>

        <PermissionGate permission="ROLE_READ">
          <Link to="/roles" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Role Management</h3>
            <p className="text-gray-600">Create and manage roles</p>
          </Link>
        </PermissionGate>

        <PermissionGate permission="ROLE_READ">
          <Link to="/permissions" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Permission Management</h3>
            <p className="text-gray-600">View and manage permissions</p>
          </Link>
        </PermissionGate>

        <PermissionGate permission="MENU_READ">
          <Link to="/menus" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Management</h3>
            <p className="text-gray-600">Configure application menus</p>
          </Link>
        </PermissionGate>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Permissions</h3>
        <div className="flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <span key={permission} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {permission}
            </span>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
