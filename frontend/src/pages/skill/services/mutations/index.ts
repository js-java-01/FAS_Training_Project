import { useMutation } from "@tanstack/react-query";
import { skillApi } from "@/api/skillApi";

/* ─── Skills ──────────────────────────────────────────────── */
export const useExportSkills = () =>
  useMutation({ mutationFn: () => skillApi.exportSkills() });

export const useImportSkills = () =>
  useMutation({ mutationFn: (file: File) => skillApi.importSkills(file) });

export const useDownloadSkillTemplate = () =>
  useMutation({ mutationFn: () => skillApi.downloadSkillTemplate() });

/* ─── Skill Groups ────────────────────────────────────────── */
export const useExportGroups = () =>
  useMutation({ mutationFn: () => skillApi.exportGroups() });

export const useImportGroups = () =>
  useMutation({ mutationFn: (file: File) => skillApi.importGroups(file) });

export const useDownloadGroupTemplate = () =>
  useMutation({ mutationFn: () => skillApi.downloadGroupTemplate() });
