import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface AddTraineeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (email: string) => void;
    isLoading?: boolean;
}

export function AddTraineeModal({
    open,
    onOpenChange,
    onConfirm,
    isLoading
}: AddTraineeModalProps) {
    const [email, setEmail] = useState("");

    const handleConfirm = () => {
        if (email.trim()) {
            onConfirm(email);
            setEmail("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <DialogTitle>Add Trainee</DialogTitle>
                    </div>
                    <DialogDescription>
                        Please enter email
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-right">
                            Student's Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!email || isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? "Processing..." : "Add to Class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}