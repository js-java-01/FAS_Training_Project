import * as React from "react";
import type { ReactNode } from "react";
import {TooltipWrapper} from "@/components/TooltipWrapper.tsx";

interface ActionBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    disabled?: boolean;
    tooltipText: string;
}

const ActionBtn = React.forwardRef<HTMLButtonElement, ActionBtnProps>(
    ({ icon, className, disabled, tooltipText, ...props }, ref) => {
        return (
           <TooltipWrapper content={tooltipText}>
               <button
                   disabled={disabled}
                   ref={ref}
                   className={`p-2 rounded hover:bg-accent bg-transparent dark:border-gray-500 transition border border-[#CED4DA] !outline-none ${className ?? ""}`}
                   {...props}
               >
                   {icon}
               </button>
           </TooltipWrapper>
        );
    },
);

ActionBtn.displayName = "ActionBtn";

export default ActionBtn;