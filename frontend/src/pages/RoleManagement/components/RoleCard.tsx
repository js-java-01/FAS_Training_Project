import { Role } from "../../../types/role";
import { PermissionGate } from "../../../components/PermissionGate";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

interface Props {
  roles: Role[];
  onView: (r: Role) => void;
  onEdit: (r: Role) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (role: Role) => void;
}

export const RoleCard = ({
  roles,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) => {
  return (
    <div className="space-y-4">
      {roles.map((r) => (
        <div
          key={r.id}
          className="bg-white border rounded-lg p-5 flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{r.name}</h3>
            <p className="text-sm text-gray-500">{r.description}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(r)}
              className="p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100"
            >
              <FiEye />
            </button>

            <PermissionGate permission="ROLE_UPDATE">
              <button
                onClick={() => onEdit(r)}
                className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <FiEdit2 />
              </button>
            </PermissionGate>

            <button
              onClick={() => onToggleStatus(r.id)}
              className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
            >
              {r.isActive ? <FiToggleRight /> : <FiToggleLeft />}
            </button>

            <PermissionGate permission="ROLE_DELETE">
              <button
                onClick={() => onDelete(r)}
                className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
              >
                <FiTrash2 />
              </button>
            </PermissionGate>
          </div>
        </div>
      ))}
    </div>
  );
};
