import { FiLayers } from "react-icons/fi";

export function CoursesTab() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center text-muted-foreground">
      <FiLayers size={32} className="mx-auto mb-2 opacity-30" />
      <p>Content for Courses is being updated by the content team.</p>
    </div>
  );
}
