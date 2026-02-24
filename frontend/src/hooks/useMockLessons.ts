import { useMemo } from "react";
import type { Lesson } from "@/types/lesson";

/**
 * UI-only mock hook.
 *
 * Keep the return shape stable so you can later replace this with `useLessons()`
 * (API-backed) without changing form rendering logic.
 */
export function useMockLessons(): { lessons: Lesson[]; isLoading: boolean } {
  const lessons = useMemo<Lesson[]>(
    () => [
      { id: "11111111-1111-1111-1111-111111111111", title: "Lesson 1" },
      { id: "22222222-2222-2222-2222-222222222222", title: "Lesson 2" },
      { id: "33333333-3333-3333-3333-333333333333", title: "Lesson 3" },
    ],
    [],
  );

  return { lessons, isLoading: false };
}
