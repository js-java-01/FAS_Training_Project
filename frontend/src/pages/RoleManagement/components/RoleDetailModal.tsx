import { Role } from "../../../types/role";
import {
  FiShield,
  FiChevronDown,
  FiFileText,
  FiLayers,
  FiClock,
} from "react-icons/fi";
import { useState } from "react";

export const RoleDetailModal = ({
  open,
  role,
  onClose,
}: {
  open: boolean;
  role: Role | null;
  onClose: () => void;
}) => {
  const [expand, setExpand] = useState(false);
  if (!open || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-xl p-6 w-full max-w-2xl">
        {/* TITLE */}
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <FiShield /> Role details
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Overview and update history for this role
        </p>

        {/* CARD */}
        <div className="bg-white border rounded-xl divide-y">
          {/* HEADER */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{role.name}</h3>
            <p className="text-xs text-gray-500">ID: #{role.id}</p>
          </div>

          {/* DESCRIPTION */}
          <Row
            icon={<FiFileText size={14} />}
            label="Description"
            value={role.description || "No description provided"}
          />

          {/* TOTAL MODULES */}
          <div className="p-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-500">
                <FiLayers size={14} /> Total Modules
              </span>
              <button
                onClick={() => setExpand(!expand)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
              >
                {role.permissionNames.length}
                <FiChevronDown
                  className={`transition ${expand ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {expand && (
              <div className="mt-3 flex flex-wrap gap-2">
                {role.permissionNames.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ROLE CREATED */}
          <Row
            icon={<FiClock size={14} />}
            label="Role Created"
            value={formatDate(role.createdAt)}
          />

          {/* LAST UPDATED */}
          <Row
            icon={<FiClock size={14} />}
            label="Last Updated"
            value={formatDate(role.updatedAt)}
          />
        </div>

        {/* FOOTER */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- HELPERS ---------- */

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) => (
  <div className="p-4 flex justify-between text-sm">
    <span className="flex items-center gap-2 text-gray-500">
      {icon} {label}
    </span>
    <span className="text-gray-900">{value}</span>
  </div>
);

const formatDate = (date?: string) => {
  if (!date) return "Unknown";
  return new Date(date).toLocaleString();
};
