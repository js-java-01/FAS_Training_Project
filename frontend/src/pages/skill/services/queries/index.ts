import { useQuery, useQueryClient } from "@tanstack/react-query";
import { skillApi } from "@/api/skillApi";

export const skillKeys = {
  groups: () => ["skill-groups"] as const,
  skills: (groupId?: string) => ["skills", groupId ?? "all"] as const,
};

export const useGetSkillGroups = () =>
  useQuery({
    queryKey: skillKeys.groups(),
    queryFn: () => skillApi.getGroups(),
    staleTime: 5 * 60 * 1000,
  });

export const useGetSkills = (groupId?: string) =>
  useQuery({
    queryKey: skillKeys.skills(groupId),
    queryFn: () => skillApi.getSkills(groupId),
    staleTime: 5 * 60 * 1000,
  });

export const useSkillInvalidate = () => {
  const qc = useQueryClient();
  return {
    invalidateSkills: () =>
      qc.invalidateQueries({ queryKey: ["skills"] }),
    invalidateGroups: () =>
      qc.invalidateQueries({ queryKey: skillKeys.groups() }),
    invalidateAll: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["skills"] }),
        qc.invalidateQueries({ queryKey: skillKeys.groups() }),
      ]),
  };
};
