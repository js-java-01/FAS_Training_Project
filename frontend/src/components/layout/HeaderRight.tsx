import ToggleTheme from "@/components/ToggleTheme";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ChevronDown, Loader2 } from "lucide-react";
import type { RoleSwitchRole } from "@/types/role";

/** Map role name → UI config */
function getRoleMeta(name: string) {
  const upper = name.toUpperCase();

  const roleMap: Record<
    string,
    {
      title: string;
      bg: string;
      text: string;
      border: string;
      hover: string;
      dot: string;
    }
  > = {
    ADMIN: {
      title: "Admin",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:bg-blue-100",
      dot: "text-blue-500",
    },
    STUDENT: {
      title: "Student",
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      hover: "hover:bg-green-100",
      dot: "text-green-500",
    },
    TEACHER: {
      title: "Trainer",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-100",
      dot: "text-purple-500",
    },
    TRAINER: {
      title: "Trainer",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-100",
      dot: "text-purple-500",
    },
    MANAGER: {
      title: "Manager",
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:bg-orange-100",
      dot: "text-orange-500",
    },
    SUPER_ADMIN: {
      title: "Super Admin",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      hover: "hover:bg-red-100",
      dot: "text-red-500",
    },
  };

  return (
    roleMap[upper] ?? {
      title: "Guest",
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      hover: "hover:bg-gray-100",
      dot: "text-gray-500",
    }
  );
}

export default function HeaderRight() {
  const { role } = useSelector((state: RootState) => state.auth);

  const {
    availableRoles,
    activeRole,
    setActiveRole,
    canSwitch,
    isLoading,
  } = useRoleSwitch();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!role) return null;

  const currentRoleName = activeRole?.name ?? role ?? "GUEST";
  const currentMeta = getRoleMeta(currentRoleName);

  const isRoleActive = (r: RoleSwitchRole) => {
    if (!activeRole) return false;
    return activeRole.id
      ? activeRole.id === r.id
      : activeRole.name === r.name;
  };

  // No switch → show badge only
  if (!canSwitch) {
    return (
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        ) : (
          <Badge
            variant="secondary"
            className={`text-sm ${currentMeta.text} ${currentMeta.bg}`}
          >
            {currentMeta.title}
          </Badge>
        )}
        <ToggleTheme />
      </div>
    );
  }

  // Switch enabled → dropdown
  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <div className="relative">
        <button
          disabled={isLoading}
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            currentMeta.bg
          } ${currentMeta.text} ${currentMeta.border} ${
            currentMeta.hover
          } ${isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/60">
            {currentMeta.title[0]}
          </span>

          <span>{currentMeta.title}</span>

          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 min-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {availableRoles.map((r) => {
              const meta = getRoleMeta(r.name);
              const active = isRoleActive(r);

              return (
                <button
                  key={r.id ?? r.name}
                  onClick={() => {
                    setActiveRole(r);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? `${meta.text} font-medium ${meta.bg}`
                      : `text-gray-700 ${meta.hover}`
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${meta.bg} ${meta.text} border ${meta.border}`}
                  >
                    {meta.title[0]}
                  </span>

                  <span className="flex-1 text-left">
                     {meta.title}
                   </span>

                  {active && (
                    <span className={`ml-auto text-xs ${meta.dot}`}>
                      ●
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ToggleTheme />
    </div>
  );
}
