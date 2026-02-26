import { useQuery } from "@tanstack/react-query";
import { semesterApi } from "@/api/semesterApi";
import { trainingClassKeys } from "../../keys";
import type { Semester } from "@/types/trainingClass";

export const useGetAllSemesters = () => {
    return useQuery<Semester[]>({
        queryKey: trainingClassKeys.semesters(),
        queryFn: () => semesterApi.getAllSemesters(),
        staleTime: 10 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};
