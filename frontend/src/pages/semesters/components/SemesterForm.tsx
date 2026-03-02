import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SemesterResponse } from "./SemesterCard";

interface SemesterFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SemesterResponse>) => void;
  initialData?: SemesterResponse | null;
}

const defaultFormData: Partial<SemesterResponse> = {
  name: "",
  startDate: "",
  endDate: "",
};

export function SemesterForm({ open, onClose, onSubmit, initialData }: SemesterFormProps) {
  const [formData, setFormData] = useState<Partial<SemesterResponse>>(() => {
    if (initialData) return initialData;
    return defaultFormData;
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDateObj = new Date(formData.startDate);
      startDateObj.setHours(0, 0, 0, 0);

      if (startDateObj < today) {
        toast.error("Ngày bắt đầu phải từ ngày hôm nay trở đi!");
        return;
      }

      if (formData.endDate) {
        const endDateObj = new Date(formData.endDate);
        endDateObj.setHours(0, 0, 0, 0);

        if (endDateObj <= startDateObj) {
          toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu!");
          return;
        }
      }
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Semester" : "Add New Semester"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-muted-foreground">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
              placeholder="e.g. Spring 2026"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right text-muted-foreground">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ""}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="col-span-3"
              required
            />
          </div>

          {/* End Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right text-muted-foreground">
              End Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || ""}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="col-span-3"
              required
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
