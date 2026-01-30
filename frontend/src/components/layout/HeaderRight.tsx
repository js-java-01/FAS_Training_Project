import { Badge } from "@/components/ui/badge.tsx";
import { useAuth } from "@/hooks/useAuth.ts";

export default function HeaderRight() {
    const { user } = useAuth();


    return (
        <div className="flex items-center gap-3">
            {user?.role && (
                <Badge variant="secondary" className="capitalize text-xs text-blue-500 bg-blue-100">
                    {user.role.toLowerCase()}
                </Badge>
            )}
        </div>
    );
}
