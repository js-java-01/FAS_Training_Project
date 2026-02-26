import ToggleTheme from "@/components/ToggleTheme";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ChevronDown, Loader2 } from "lucide-react";
import type { RoleSwitchRole } from "@/types/role";

/** Map role name → Tailwind colour tokens */
function getRoleColor(name: string): {
  bg: string;
  text: string;
  border: string;
  hover: string;
  dot: string;
} {
  const upper = name.toUpperCase();
  if (upper === "ADMIN")
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:bg-blue-100",
      dot: "text-blue-500",
    };
  if (upper === "STUDENT")
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      hover: "hover:bg-green-100",
      dot: "text-green-500",
    };
  if (upper === "TEACHER" || upper === "TRAINER")
    return {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-100",
      dot: "text-purple-500",
    };
  if (upper === "MANAGER")
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:bg-orange-100",
      dot: "text-orange-500",
    };
  return {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    hover: "hover:bg-gray-100",
    dot: "text-gray-500",
  };
}

export default function HeaderRight() {
  const { role } = useSelector((state: RootState) => state.auth);
  const { availableRoles, activeRole, setActiveRole, canSwitch, isLoading } =
    useRoleSwitch();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!role) return null;

  const displayRole = activeRole?.name ?? role;
  const colors = getRoleColor(displayRole);

  // No switch available: plain badge
  if (!canSwitch) {
    return (
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        ) : (
          <Badge
            variant="secondary"
            className={`capitalize text-sm ${colors.text} ${colors.bg}`}
          >
            {displayRole.toLowerCase()}
          </Badge>
        )}
        <ToggleTheme />
      </div>
    );
  }

  // Switch available: dropdown
  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${colors.bg} ${colors.text} ${colors.border} ${colors.hover}`}
        >
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/60">
            {displayRole[0].toUpperCase()}
          </span>
          <span className="capitalize">{displayRole.toLowerCase()} View</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 min-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {availableRoles.map((r: RoleSwitchRole) => {
              const c = getRoleColor(r.name);
              const isActive =
                activeRole?.id === r.id || activeRole?.name === r.name;
              return (
                <button
                  key={r.id || r.name}
                  onClick={() => {
                    setActiveRole(r);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                    isActive
                      ? `${c.text} font-medium ${c.bg}`
                      : `text-gray-700 ${c.hover}`
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${c.bg} ${c.text} border ${c.border}`}
                  >
                    {r.name[0].toUpperCase()}
                  </span>
                  <span className="capitalize">{r.name.toLowerCase()}</span>
                  {isActive && (
                    <span className={`ml-auto text-xs ${c.dot}`}>●</span>
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
