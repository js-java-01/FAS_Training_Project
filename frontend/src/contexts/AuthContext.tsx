import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { type LoginRequest, type LoginResponse, type AuthContextType } from "../types/auth";
import { authApi } from "../api/authApi";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const exe = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser) as LoginResponse);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          await authApi.logout();
        }
      }
      setIsLoading(false);
    };

    exe();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response);
    } catch (err) {
      await authApi.logout();
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("An unknown error occurred");
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) {
      console.log(`hasPermission(${permission}): user or permissions missing`, {
        user: !!user,
        hasPerms: !!user?.permissions,
      });
      return false;
    }
    const result = user.permissions.includes(permission);
    if (!result) {
      console.log(`hasPermission(${permission}): NOT FOUND in`, user.permissions);
    }
    return result;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some((permission) => user.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every((permission) => user.permissions.includes(permission));
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
