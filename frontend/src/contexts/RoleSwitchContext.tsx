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
  /** manually re-fetch the switchable roles list (e.g. after a role is toggled inactive) */
  refreshRoles: () => void;
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
    token,
  } = useSelector((state: RootState) => state.auth);

  const [availableRoles, setAvailableRoles] = useState<RoleSwitchRole[]>([]);
  const [activeRole, setActiveRole] = useState<RoleSwitchRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = () => {
    if (!isAuthenticated) {
      setAvailableRoles([]);
      setActiveRole(null);
      return;
    }
    // Reset stale role from previous user immediately
    setActiveRole(null);
    setIsLoading(true);
    authApi
      .getMyRoles()
      .then((roles) => {
        // Filter out inactive roles (server already does this, but guard client-side too)
        const activeRoles = roles.filter((r) => r.isActive !== false);

        // Determine the user's own role hierarchy level dynamically from API data
        const ownRole = activeRoles.find((r) => r.name === authRole);
        const primaryLevel = ownRole?.hierarchyLevel ?? 0;

        // Only show roles at the same level or below (higher number = lower privilege)
        // If hierarchyLevel is 0 (unset), skip filtering
        const filteredRoles =
          primaryLevel === 0
            ? activeRoles
            : activeRoles.filter(
                (r) =>
                  r.hierarchyLevel === 0 ||
                  (r.hierarchyLevel ?? 0) >= primaryLevel,
              );

        setAvailableRoles(filteredRoles);

        // Keep the active role if it's still in the list; otherwise fall back to own role
        setActiveRole((prev) => {
          if (prev) {
            const stillAvailable = filteredRoles.find(
              (r) => r.id === prev.id || r.name === prev.name,
            );
            if (stillAvailable) return stillAvailable;
          }
          return (
            filteredRoles.find((r) => r.name === authRole) ??
            filteredRoles[0] ??
            null
          );
        });
      })
      .catch(() => {
        const fallback: RoleSwitchRole = {
          id: "",
          name: authRole ?? "",
          permissions: authPermissions,
          isActive: true,
        };
        setAvailableRoles([fallback]);
        setActiveRole(fallback);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const canSwitch = availableRoles.length > 1;
  const activePermissions = activeRole?.permissions ?? authPermissions;
  console.log("Active role", activeRole);

  return (
    <RoleSwitchContext.Provider
      value={{
        availableRoles,
        activeRole,
        setActiveRole,
        canSwitch,
        isLoading,
        activePermissions,
        refreshRoles: fetchRoles,
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
