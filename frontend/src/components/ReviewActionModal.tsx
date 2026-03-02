import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface ReviewActionModalProps {
    open: boolean;
    title: string;
    description: string;
    label: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "approve"; // 'approve' adds green styling
    loading?: boolean;
    requireReason?: boolean;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

export function ReviewActionModal({
    open,
    title,
    description,
    label,
    placeholder = "Enter text...",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    loading = false,
    requireReason = false,
    onConfirm,
    onCancel,
}: ReviewActionModalProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    // Reset when modal opens
    useEffect(() => {
        if (open) {
            setReason("");
            setError("");
        }
    }, [open]);

    const handleConfirm = () => {
        if (requireReason && !reason.trim()) {
            setError("This field is required.");
            return;
        }
        onConfirm(reason);
    };

    const getButtonClass = () => {
        if (variant === "destructive") return "bg-red-600 hover:bg-red-700 text-white";
        if (variant === "approve") return "bg-green-600 hover:bg-green-700 text-white";
        return "bg-blue-600 hover:bg-blue-700 text-white";
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium">
                            {label} {requireReason && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder={placeholder}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                            rows={4}
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onCancel} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={getButtonClass()}
                    >
                        {loading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

