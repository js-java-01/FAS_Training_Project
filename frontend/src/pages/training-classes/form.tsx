import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trainingClassApi } from "@/api/trainingClassApi";
import { useGetAllSemesters } from "./services/queries/useSemesters";
import type { TrainingClass } from "@/types/trainingClass";

type FormValues = {
    className: string;
    classCode: string;
    semesterId: string;
    startDate: string;
    endDate: string;
};

const formSchema = z
    .object({
        className: z
            .string()
            .min(2, { message: "Class name must be at least 2 characters" })
            .regex(/^[^0-9]+$/, { message: "Class name must not contain numbers" }),
        classCode: z
            .string()
            .min(1, { message: "Class code is required" }),
        semesterId: z
            .string()
            .min(1, { message: "Please select a semester" }),
        startDate: z
            .string()
            .min(1, { message: "Start date is required" }),
        endDate: z
            .string()
            .min(1, { message: "End date is required" }),
    })
    .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
        message: "Start date must be before end date",
        path: ["endDate"],
    });

export const TrainingClassForm: React.FC<{
    open: boolean;
    onClose: () => void;
    onSaved?: (saved: TrainingClass) => void;
}> = ({ open, onClose, onSaved }) => {
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { data: semesters = [], isLoading: loadingSemesters } = useGetAllSemesters();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            className: "",
            classCode: "",
            semesterId: "",
            startDate: "",
            endDate: "",
        },
    });

    useEffect(() => {
        if (open) {
            setServerError(null);
            reset({
                className: "",
                classCode: "",
                semesterId: "",
                startDate: "",
                endDate: "",
            });
        }
    }, [open, reset]);

    const onSubmit = async (data: FormValues) => {
        setSaving(true);
        setServerError(null);

        try {
            const saved = await trainingClassApi.createTrainingClass({
                className: data.className,
                classCode: data.classCode,
                semesterId: data.semesterId,
                startDate: data.startDate,
                endDate: data.endDate,
            });

            onSaved?.(saved);
            onClose();
        } catch (err: unknown) {
            console.error("Save error", err);
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ||
                (err as { message?: string })?.message ||
                "Error saving data";
            setServerError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Open Class Request</DialogTitle>
                        <DialogDescription>
                            Fill in the details to request opening a new training class.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {serverError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                                {serverError}
                            </div>
                        )}

                        {/* Class Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Class Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("className")}
                                className={`w-full px-3 py-2 border rounded-md outline-none transition
                                    ${errors.className
                                        ? "border-red-500 focus:ring-red-200"
                                        : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                                placeholder="Enter class name"
                            />
                            {errors.className && (
                                <p className="text-xs text-red-600">{errors.className.message}</p>
                            )}
                        </div>

                        {/* Class Code */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Class Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("classCode")}
                                className={`w-full px-3 py-2 border rounded-md outline-none transition
                                    ${errors.classCode
                                        ? "border-red-500 focus:ring-red-200"
                                        : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                                placeholder="Enter class code"
                            />
                            {errors.classCode && (
                                <p className="text-xs text-red-600">{errors.classCode.message}</p>
                            )}
                        </div>

                        {/* Semester */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Semester <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("semesterId")}
                                className={`w-full px-3 py-2 border rounded-md outline-none transition
                                    ${errors.semesterId
                                        ? "border-red-500 focus:ring-red-200"
                                        : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                                disabled={loadingSemesters}
                            >
                                <option value="">
                                    {loadingSemesters ? "Loading semesters..." : "Select a semester"}
                                </option>
                                {semesters.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {errors.semesterId && (
                                <p className="text-xs text-red-600">{errors.semesterId.message}</p>
                            )}
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    className={`w-full px-3 py-2 border rounded-md outline-none transition
                                        ${errors.startDate
                                            ? "border-red-500 focus:ring-red-200"
                                            : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                                />
                                {errors.startDate && (
                                    <p className="text-xs text-red-600">{errors.startDate.message}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    className={`w-full px-3 py-2 border rounded-md outline-none transition
                                        ${errors.endDate
                                            ? "border-red-500 focus:ring-red-200"
                                            : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}`}
                                />
                                {errors.endDate && (
                                    <p className="text-xs text-red-600">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {saving ? "Saving..." : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
