import React from "react";
import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DataItem {
  icon: LucideIcon;
  label?: string;
  value: React.ReactNode;
  className?: string;
}

export interface StatusConfig {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export interface ActionConfig {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface GenericDataCardProps {
  tag?: string;
  title: string;
  status?: StatusConfig;
  items: DataItem[];
  action?: ActionConfig;
  className?: string;
}

export const GenericDataCard = ({ tag, title, status, items, action, className }: GenericDataCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          {tag && (
            <Badge variant="secondary" className="font-mono">
              {tag}
            </Badge>
          )}

          {status && (
            <Badge variant={status.variant || "outline"} className={cn(status.className)}>
              {status.label}
            </Badge>
          )}
        </div>

        <CardTitle className="text-xl line-clamp-1" title={title}>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 text-sm text-muted-foreground flex-1">
        {items.map((item, index) => (
          <div key={index} className={cn("flex items-center gap-2", item.className)}>
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {item.label && <span className="mr-1 font-medium">{item.label}</span>}
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>

      {action && (
        <CardFooter className="bg-slate-50/50 border-t p-4 mt-auto">
          <Button
            className={cn("w-full", action.className)}
            disabled={action.disabled}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick?.();
            }}
          >
            {action.label}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
