import { useEffect, useState } from "react";
import type { ComponentType, SVGProps, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Network,
  FileText,
  Layers,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Box,
} from "lucide-react";
import { moduleGroupApi, moduleApi } from "@/api/moduleApi";
import { iconMap } from "@/constants/iconMap";
import type { ModuleGroup, Module } from "@/types/module";

// --- Component DetailRow ---
const DetailRow = ({
  icon: Icon,
  label,
  value,
  isBadge = false,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value?: ReactNode;
  isBadge?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
      <Icon className="w-4 h-4 text-muted-foreground" /> {label}
    </label>
    <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground min-h-[42px] flex items-center">
      {isBadge ? (
        value ? (
          <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        )
      ) : (
        value || <span className="text-muted-foreground italic">No data</span>
      )}
    </div>
  </div>
);

interface ModuleGroupDetailDialogProps {
  open: boolean;
  onClose: () => void;
  group: ModuleGroup | null;
}

export const ModuleGroupDetailDialog = ({
  open,
  onClose,
  group,
}: ModuleGroupDetailDialogProps) => {
  const [viewingModules, setViewingModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);

  const [detailGroup, setDetailGroup] = useState<ModuleGroup | null>(group);

  // Sync props group to detailGroup
  useEffect(() => {
    setDetailGroup(group);
  }, [group]);

  useEffect(() => {
    if (open && group?.id) {
      let mounted = true;

      const fetchData = async () => {
        setLoadingModules(true);
        try {
          const id = group.id;
          const modulesPromise = moduleApi.getModulesByModuleGroup(id);
          const groupPromise = moduleGroupApi.getModuleGroupById(id);

          const [modules, groupRes] = await Promise.all([
            modulesPromise,
            groupPromise,
          ]);

          if (mounted) {
            setViewingModules(modules);
            // merge detailGroup data
            setDetailGroup((prev) => (prev ? { ...prev, ...groupRes } : groupRes));
          }
        } catch (error) {
          console.error("Failed to load details", error);
          if (mounted) setViewingModules([]);
        } finally {
          if (mounted) setLoadingModules(false);
        }
      };

      setIsModulesOpen(true);
      fetchData();

      return () => {
        mounted = false;
      };
    } else {
      setViewingModules([]);
      setIsModulesOpen(false);
    }
  }, [open, group?.id]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  if (!detailGroup) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/70">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Module Group Details
          </DialogTitle>
          <DialogDescription>
            Information about <strong>{detailGroup.name}</strong> and its modules.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Group Info Section */}
          <div className="space-y-5">
            <DetailRow
              icon={Network}
              label="Module Group Name"
              value={detailGroup.name}
            />
            <DetailRow
              icon={FileText}
              label="Description"
              value={detailGroup.description}
            />
            <div className="grid grid-cols-2 gap-5">
              <DetailRow
                icon={Layers}
                label="Display Order"
                value={detailGroup.totalModules}
              />
              <DetailRow
                icon={ToggleLeft}
                label="Status"
                value={detailGroup.isActive}
                isBadge
              />
            </div>
          </div>

          <div className="border-t border-border my-4" />

          {/* Modules Dropdown Section */}
          <div className="border rounded-lg overflow-hidden border-border">
            <button
              onClick={() => setIsModulesOpen(!isModulesOpen)}
              className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/70 transition-colors"
              type="button"
            >
              <div className="flex items-center gap-2 font-bold text-muted-foreground text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                Included Modules
                {!loadingModules && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {viewingModules.length}
                  </Badge>
                )}
              </div>
              {isModulesOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isModulesOpen && (
              <div className="bg-card animate-in slide-in-from-top-2 duration-200">
                {loadingModules ? (
                  <div className="p-4 flex justify-center text-muted-foreground text-sm items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading
                    modules...
                  </div>
                ) : viewingModules.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm italic">
                    No modules found in this group.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {viewingModules.map((mod: Module) => {
                      const ModuleIcon =
                        mod.icon && iconMap[mod.icon as keyof typeof iconMap]
                          ? iconMap[mod.icon as keyof typeof iconMap]
                          : Box;

                      return (
                        <li
                          key={mod.id}
                          className="p-3 pl-4 hover:bg-muted/70 transition flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-600">
                              <ModuleIcon className="w-4 h-4" />
                            </div>

                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                {mod.title}
                              </span>
                              {mod.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {mod.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              #{mod.displayOrder}
                            </span>
                            {mod.isActive !== undefined && (
                              <span
                                className={`w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm ${
                                  mod.isActive ? "bg-green-500" : "bg-red-400"
                                }`}
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/70">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};