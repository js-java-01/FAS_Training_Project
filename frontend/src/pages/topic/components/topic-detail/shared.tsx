import type { ReactNode } from "react";

export const tabs = ["Overview", "Courses", "Assessment Scheme"] as const;
export type TopicDetailTab = (typeof tabs)[number];

export const inputCls = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export type SchemeItem = {
  localId: string;
  assessmentTypeId: string;
  assessmentTypeName: string;
  assessmentTypeDescription: string;
  weight: number;
};

export function Block({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border border-border rounded-lg p-4 shadow-sm bg-card text-card-foreground ${className}`}>
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full"></div>
        {title}
      </h2>
      {children}
    </div>
  );
}

export function Info({ icon, label, value }: { icon: ReactNode; label: string; value?: string | number | null }) {
  return (
    <div className="flex gap-3 p-2.5 hover:bg-accent rounded-md transition-colors border border-transparent hover:border-border">
      <div className="text-primary mt-0.5 shrink-0 bg-primary/10 p-1.5 rounded-md">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
        <p className="font-medium leading-tight wrap-break-word">{value || "---"}</p>
      </div>
    </div>
  );
}

export function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ml-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
