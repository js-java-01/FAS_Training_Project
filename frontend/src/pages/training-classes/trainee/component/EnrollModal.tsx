import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { enrollmentApi } from "@/api/enrollmentApi"
import { useQueryClient } from "@tanstack/react-query"

interface EnrollModalProps {
    classId: string;
    className: string;
    isOpen: boolean;
    onClose: () => void;

}

export const EnrollModal = ({ classId, className, isOpen, onClose }: EnrollModalProps) => {
    const [enrollKey, setEnrollKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const handleEnroll = async () => {
        if (!enrollKey) return;

        setIsSubmitting(true);
        try {
            await enrollmentApi.enroll(enrollKey, classId);
            toast.success("Đăng ký thành công! Chuyển đến trang lớp học của bạn...");
            queryClient.invalidateQueries({ queryKey: ["my-classes"] });
            navigate('/my-classes');
            setEnrollKey("");
            onClose();
        } catch (error) {
            toast.error("Đăng ký thất bại. Vui lòng kiểm tra mã ghi danh và thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Đăng ký lớp học</DialogTitle>
                    <DialogDescription className="text-center">
                        Vui lòng nhập mã ghi danh (Enroll Key) để tham gia lớp <br />
                        <span className="font-bold text-slate-900">{className}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="enrollKey">Mã ghi danh</Label>
                        <Input
                            id="enrollKey"
                            placeholder="Nhập mã tại đây..."
                            value={enrollKey}
                            onChange={(e) => setEnrollKey(e.target.value)}
                            className="focus-visible:ring-blue-600"
                            type="password"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleEnroll}
                        disabled={!enrollKey || isSubmitting}
                        className="bg-blue-800 hover:bg-blue-900 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận ghi danh"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}