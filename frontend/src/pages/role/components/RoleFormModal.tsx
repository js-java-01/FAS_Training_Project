import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CreateRoleRequest } from "@/types/features/auth/role";
import type { PermissionDTO } from "@/types/features/auth/permission";

interface RoleFormModalProps {
  open: boolean;
  isEditMode: boolean;
  roleForm: CreateRoleRequest;
  permissions: PermissionDTO[];
  onChange: (form: CreateRoleRequest) => void;
  onTogglePermission: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function RoleFormModal({
  open,
  isEditMode,
  roleForm,
  permissions,
  onChange,
  onTogglePermission,
  onSubmit,
  onClose,
}: RoleFormModalProps) {
  const [searchPerm, setSearchPerm] = useState("");

  /** Group permissions by resource */
  const grouped = useMemo(() => {
    const filtered = searchPerm.trim()
      ? permissions.filter(
          (p) =>
            p.name?.toLowerCase().includes(searchPerm.toLowerCase()) ||
            p.resource?.toLowerCase().includes(searchPerm.toLowerCase()) ||
            p.action?.toLowerCase().includes(searchPerm.toLowerCase()),
        )
      : permissions;

    return filtered.reduce<Record<string, PermissionDTO[]>>((acc, perm) => {
      const key = perm.resource ?? "OTHER";
      if (!acc[key]) acc[key] = [];
      acc[key].push(perm);
      return acc;
    }, {});
  }, [permissions, searchPerm]);

  const sortedResources = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const selectedCount = roleForm.permissionIds.length;

  const handleSelectAll = (resource: string) => {
    const ids = grouped[resource].map((p) => p.id!).filter(Boolean);
    const allSelected = ids.every((id) => roleForm.permissionIds.includes(id));
    if (allSelected) {
      onChange({
        ...roleForm,
        permissionIds: roleForm.permissionIds.filter((id) => !ids.includes(id)),
      });
    } else {
      const merged = Array.from(new Set([...roleForm.permissionIds, ...ids]));
      onChange({ ...roleForm, permissionIds: merged });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Role" : "Add New Role"}</DialogTitle>
        </DialogHeader>

        <form
          id="role-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-4 overflow-hidden flex-1"
        >
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="roleName"
              className="text-right text-muted-foreground"
            >
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roleName"
              value={roleForm.name}
              onChange={(e) => onChange({ ...roleForm, name: e.target.value })}
              placeholder="e.g. TRAINER"
              className="col-span-3 font-mono uppercase"
              required
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              htmlFor="roleDesc"
              className="text-right text-muted-foreground pt-2"
            >
              Description
            </Label>
            <Textarea
              id="roleDesc"
              value={roleForm.description}
              onChange={(e) =>
                onChange({ ...roleForm, description: e.target.value })
              }
              placeholder="Describe this role…"
              className="col-span-3 resize-none"
              rows={2}
            />
          </div>

          {/* Active */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Active</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Switch
                checked={roleForm.isActive}
                onCheckedChange={(checked) =>
                  onChange({ ...roleForm, isActive: checked })
                }
              />
              <span className="text-sm text-muted-foreground">
                {roleForm.isActive ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Permissions */}
          <div className="flex flex-col gap-2 flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">
                Permissions{" "}
                <Badge variant="secondary" className="ml-1 font-mono">
                  {selectedCount} selected
                </Badge>
              </Label>
              <Input
                placeholder="Search permissions…"
                value={searchPerm}
                onChange={(e) => setSearchPerm(e.target.value)}
                className="w-48 h-7 text-xs"
              />
            </div>

            <ScrollArea className="flex-1 border rounded-md p-3 h-64">
              {sortedResources.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  No permissions available
                </p>
              )}
              <div className="space-y-4">
                {sortedResources.map((resource) => {
                  const perms = grouped[resource];
                  const allSelected = perms.every(
                    (p) => p.id && roleForm.permissionIds.includes(p.id),
                  );
                  return (
                    <div key={resource}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => handleSelectAll(resource)}
                          id={`group-${resource}`}
                        />
                        <label
                          htmlFor={`group-${resource}`}
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none"
                        >
                          {resource}
                        </label>
                      </div>
                      <div className="ml-6 flex flex-wrap gap-2">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-1.5 cursor-pointer select-none"
                          >
                            <Checkbox
                              checked={
                                !!perm.id &&
                                roleForm.permissionIds.includes(perm.id)
                              }
                              onCheckedChange={() =>
                                perm.id && onTogglePermission(perm.id)
                              }
                            />
                            <Badge
                              variant="outline"
                              className="font-mono text-xs cursor-pointer"
                              title={perm.description ?? ""}
                            >
                              {perm.action}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="role-form">
            {isEditMode ? "Save Changes" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
