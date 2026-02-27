import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { authApi } from "@/api/authApi";
import type { RoleSwitchRole } from "@/types/role";

interface RoleSwitchContextType {
  availableRoles: RoleSwitchRole[];
  activeRole: RoleSwitchRole | null;
  setActiveRole: (role: RoleSwitchRole) => void;
  /** true when more than one role is available */
  canSwitch: boolean;
  isLoading: boolean;
  /** permissions of the currently active role (fall back to Redux permissions) */
  activePermissions: string[];
}

const RoleSwitchContext = createContext<RoleSwitchContextType | undefined>(
  undefined,
);

export const RoleSwitchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    isAuthenticated,
    role: authRole,
    permissions: authPermissions,
  } = useSelector((state: RootState) => state.auth);

  const [availableRoles, setAvailableRoles] = useState<RoleSwitchRole[]>([]);
  const [activeRole, setActiveRole] = useState<RoleSwitchRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setAvailableRoles([]);
      setActiveRole(null);
      return;
    }

    setIsLoading(true);
    authApi
      .getMyRoles()
      .then((roles) => {
        setAvailableRoles(roles);
        // Default to the role matching the user's own role, or the first available
        const own = roles.find((r) => r.name === authRole) ?? roles[0] ?? null;
        setActiveRole(own);
      })
      .catch(() => {
        // Graceful degradation: build a synthetic role from Redux state
        const fallback: RoleSwitchRole = {
          id: "",
          name: authRole ?? "",
          permissions: authPermissions,
        };
        setAvailableRoles([fallback]);
        setActiveRole(fallback);
      })
      .finally(() => setIsLoading(false));
    // Only re-fetch when authentication status changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const canSwitch = availableRoles.length > 1;
  const activePermissions = activeRole?.permissions ?? authPermissions;
  console.log("Active role", activeRole)

  return (
    <RoleSwitchContext.Provider
      value={{
        availableRoles,
        activeRole,
        setActiveRole,
        canSwitch,
        isLoading,
        activePermissions,
      }}
    >
      {children}
    </RoleSwitchContext.Provider>
  );
};

export const useRoleSwitch = () => {
  const ctx = useContext(RoleSwitchContext);
  if (!ctx)
    throw new Error("useRoleSwitch must be used inside RoleSwitchProvider");
  return ctx;
};
