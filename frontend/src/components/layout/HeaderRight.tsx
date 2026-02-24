import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ChevronDown, ShieldCheck, GraduationCap } from "lucide-react";

export default function HeaderRight() {
  const { role } = useSelector((state: RootState) => state.auth);
  const { viewRole, setViewRole } = useRoleSwitch();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "ADMIN";
  const isViewingAsStudent = viewRole === "STUDENT";

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

  // Non-admin: just show plain badge
  if (!isAdmin) {
    return (
      <div className="flex items-center gap-3">
        <Badge
          variant="secondary"
          className="capitalize text-sm text-blue-500 bg-blue-100"
        >
          {role.toLowerCase()}
        </Badge>
      </div>
    );
  }

  // Admin: show role-switcher dropdown
  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            isViewingAsStudent
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          }`}
        >
          {isViewingAsStudent ? (
            <GraduationCap size={14} />
          ) : (
            <ShieldCheck size={14} />
          )}
          <span>{isViewingAsStudent ? "Student View" : "Admin View"}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={() => {
                setViewRole(null);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                !isViewingAsStudent
                  ? "text-blue-700 font-medium bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              <ShieldCheck size={15} />
              Admin View
              {!isViewingAsStudent && (
                <span className="ml-auto text-xs text-blue-500">●</span>
              )}
            </button>
            <button
              onClick={() => {
                setViewRole("STUDENT");
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                isViewingAsStudent
                  ? "text-green-700 font-medium bg-green-50"
                  : "text-gray-700"
              }`}
            >
              <GraduationCap size={15} />
              Student View
              {isViewingAsStudent && (
                <span className="ml-auto text-xs text-green-500">●</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
