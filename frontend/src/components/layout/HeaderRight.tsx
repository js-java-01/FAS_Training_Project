import { LogOutIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import {TooltipWrapper} from "@/components/TooltipWrapper.tsx";

export default function HeaderRight() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex items-center gap-3">
            {user?.role && (
                <Badge variant="secondary" className="capitalize text-xs text-blue-500 bg-blue-100">
                    {user.role.toLowerCase()}
                </Badge>
            )}

            <TooltipWrapper content={"Logout"}>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOutIcon className="size-4" />
                </Button>
            </TooltipWrapper>
        </div>
    );
}
