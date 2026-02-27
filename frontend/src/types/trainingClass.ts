/* ========================
   Training Class Types
======================== */

export interface TrainingClass {
    id: string;
    className: string;
    description?: string;
    classCode: string;
    isActive: boolean;
    creatorName?: string;
    approverName?: string;
    semesterName?: string;
    trainerNames?: string[];
    startDate: string;
    endDate: string;
}

export interface CreateTrainingClassRequest {
    className: string;
    classCode: string;
    semesterId: string;
    startDate: string;
    endDate: string;
}

/* ========================
   Semester Types
======================== */

export interface Semester {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
}
