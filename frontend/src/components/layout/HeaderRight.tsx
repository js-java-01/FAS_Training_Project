import { Badge } from "@/components/ui/badge.tsx";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
// import { useAuth } from "@/hooks/useAuth.ts";

export default function HeaderRight() {
  // const { user } = useAuth();
  const { role } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex items-center gap-3">
      {role && (
        <Badge variant="secondary" className="capitalize text-xs text-blue-500 bg-blue-100">
          {role.toLowerCase()}
        </Badge>
      )}
    </div>
  );
}
