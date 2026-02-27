import { useQuery } from "@tanstack/react-query";
import { semesterApi } from "@/api/semesterApi";
import { trainingClassKeys } from "../../keys";
import type { GetSemestersParams } from "../../dto/GetSemesterParams";

export const useGetAllSemesters = (params: GetSemestersParams, role: string) => {
  return useQuery({
    queryKey: [...trainingClassKeys.semesters(params), role],
    queryFn: async () => {
      if (role === "ADMIN") {
        const res = await semesterApi.getAllSemesters(params);
        return res.data;
      } else {
        const res = await semesterApi.getSemesters(params);
        return res.data;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
