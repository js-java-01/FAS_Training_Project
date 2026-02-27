import axiosInstance from "./axiosInstance";
import type { Semester } from "@/types/trainingClass";

export const semesterApi = {
    getAllSemesters: async (): Promise<Semester[]> => {
        const res = await axiosInstance.get<Semester[]>("/v1/semesters");
        return res.data;
    },
};
