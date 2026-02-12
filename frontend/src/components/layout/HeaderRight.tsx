import ToggleTheme from "@/components/ToggleTheme";
import { Badge } from "@/components/ui/badge.tsx";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export default function HeaderRight() {
  const { role } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex items-center gap-3">
      <ToggleTheme />
      {role && (
        <Badge variant="secondary" className="capitalize text-sm text-blue-500 bg-blue-100">
          {role.toLowerCase()}
        </Badge>
      )}
        <ToggleTheme />
    </div>
  );
}
