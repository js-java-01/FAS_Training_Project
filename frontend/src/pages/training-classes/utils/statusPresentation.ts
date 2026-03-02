import type { TrainingClass } from "@/types/trainingClass";

export type TrainingClassStatusPresentation = {
    value: string;
    label: string;
    badgeClassName: string;
};

export function getTrainingClassStatusPresentation(trainingClass: TrainingClass): TrainingClassStatusPresentation {
    const rawStatus = String(trainingClass.status ?? "").toUpperCase();

    if (rawStatus === "PENDING_APPROVAL") {
        return {
            value: "PENDING_APPROVAL",
            label: "Pending",
            badgeClassName: "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-none",
        };
    }

    if (rawStatus === "REJECTED") {
        return {
            value: "REJECTED",
            label: "Rejected",
            badgeClassName: "bg-red-100 text-red-700 border-red-200 shadow-none",
        };
    }

    if (rawStatus === "APPROVED") {
        if (trainingClass.isActive) {
            return {
                value: "APPROVED_ACTIVE",
                label: "Active",
                badgeClassName: "bg-green-100 text-green-700 border-green-200 shadow-none",
            };
        }

        return {
            value: "APPROVED",
            label: "Inactive",
            badgeClassName: "bg-blue-100 text-blue-700 border-blue-200 shadow-none",
        };
    }

    if (rawStatus === "ACTIVE" || rawStatus === "APPROVED_ACTIVE") {
        return {
            value: "APPROVED_ACTIVE",
            label: "Active",
            badgeClassName: "bg-green-100 text-green-700 border-green-200 shadow-none",
        };
    }

    if (rawStatus === "INACTIVE" || rawStatus === "APPROVED_INACTIVE") {
        return {
            value: "APPROVED",
            label: "Inactive",
            badgeClassName: "bg-blue-100 text-blue-700 border-blue-200 shadow-none",
        };
    }

    if (!rawStatus) {
        return trainingClass.isActive
            ? {
                  value: "APPROVED_ACTIVE",
                  label: "Active",
                  badgeClassName: "bg-green-100 text-green-700 border-green-200 shadow-none",
              }
            : {
                  value: "APPROVED",
                  label: "Inactive",
                  badgeClassName: "bg-blue-100 text-blue-700 border-blue-200 shadow-none",
              };
    }

    return {
        value: rawStatus,
        label: rawStatus,
        badgeClassName: "bg-gray-100 text-gray-700 border-gray-200 shadow-none",
    };
}