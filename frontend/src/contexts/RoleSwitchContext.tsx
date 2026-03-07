import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { authApi } from "@/api/authApi";
import { setLogin } from "@/store/slices/auth/authSlice";
import type { RoleSwitchRole } from "@/types/role";
import { toast } from "sonner";

interface RoleSwitchContextType {
  availableRoles: RoleSwitchRole[];
  activeRole: RoleSwitchRole | null;
  /** Switch to a different role — calls the backend, updates the JWT token and Redux state */
  setActiveRole: (role: RoleSwitchRole) => Promise<void>;
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
  const dispatch = useDispatch();

  const [availableRoles, setAvailableRoles] = useState<RoleSwitchRole[]>([]);
  const [activeRole, _setActiveRole] = useState<RoleSwitchRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Prevents the token-change useEffect from re-fetching roles during a role switch
  const isSwitchingRef = useRef(false);

  const fetchRoles = () => {
    // Reset state when not authenticated
    if (!isAuthenticated) {
      setAvailableRoles([]);
      _setActiveRole(null);
      return;
    }
    setIsLoading(true);
    authApi
      .getMyRoles()
      .then((roles) => {
        // Filter out inactive roles (server already does this, but guard client-side too)
        const activeRoles = roles.filter((r) => r.isActive !== false);

        // Determine the user's own role hierarchy level dynamically from API data
        const highestRole = activeRoles.reduce((prev, curr) => {
          if (!prev) return curr;
          if ((curr.hierarchyLevel ?? 0) < (prev.hierarchyLevel ?? 0)) {
            return curr; // level nhỏ hơn = quyền cao hơn
          }
          return prev;
        }, activeRoles[0]);

        const primaryLevel = highestRole?.hierarchyLevel ?? 0;

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
        _setActiveRole((prev) => {
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
        _setActiveRole(fallback);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isSwitchingRef.current) return; // skip re-fetch caused by role-switch token update
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const canSwitch = availableRoles.length > 1;
  const activePermissions = activeRole?.permissions ?? authPermissions;

  /** Calls POST /auth/switch-role, receives a new JWT, updates Redux + localStorage, then updates local state. */
  const handleSwitchRole = async (role: RoleSwitchRole): Promise<void> => {
    if (activeRole?.name === role.name) return;
    setIsLoading(true);
    isSwitchingRef.current = true;
    try {
      const response = await authApi.switchRole(role.name);
      // Persist the new token + role + permissions to Redux and localStorage
      dispatch(
        setLogin({
          token: response.token,
          type: response.type,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          permissions: Array.from(response.permissions ?? []),
        }),
      );
      // Update context's active role with the fresh permissions from the response
      const updated: RoleSwitchRole = {
        ...role,
        permissions: Array.from(response.permissions ?? []),
      };
      _setActiveRole(updated);
      // Update the permissions for this role in the available list, but keep all roles intact
      // (do NOT re-fetch — that would use the new token and lose higher-privilege roles)
      setAvailableRoles((prev) =>
        prev.map((r) =>
          r.id === role.id || r.name === role.name ? updated : r,
        ),
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to switch role";
      toast.error(String(msg));
    } finally {
      isSwitchingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <RoleSwitchContext.Provider
      value={{
        availableRoles,
        activeRole,
        setActiveRole: handleSwitchRole,
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