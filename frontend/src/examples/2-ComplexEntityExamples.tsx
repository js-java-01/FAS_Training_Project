import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProTable } from "@/components/datatable/ProTable";
import { useProTable } from "@/hooks/useProTable";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * Example 6: Complex Entity - Individual Action Overrides (RECOMMENDED)
 * 
 * Use when:
 * - Multi-step forms need dedicated pages
 * - Complex validation/rich text editors
 * - Want routing for create/edit but keep delete modal
 * 
 * NEW APPROACH: Override individual actions
 * ✅ Cleaner code - no manual button reconstruction
 * ✅ Automatic consistency - default buttons always match
 * ✅ Easy to maintain
 */
export function QuestionsPageCleanApproach() {
    const navigate = useNavigate();

    const table = useProTable({
        resource: "questions",
        schema: {
            title: "Questions",
            resource: "questions",
            idField: "id",
            fields: [
                { name: "content", label: "Content", type: "text" },
                { name: "category", label: "Category", type: "relation" },
                { name: "difficulty", label: "Difficulty", type: "select" },
            ],
        },
    });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Custom create - navigate to page
                headerActions={
                    <Button onClick={() => navigate("/questions/create")}>
                        <Plus size={16} />
                        Create Question
                    </Button>
                }
                // Custom view - navigate to detail page
                onView={(row) => navigate(`/questions/${row.id}`)}
                // Custom edit - navigate to edit page
                onEdit={(row) => navigate(`/questions/${row.id}/edit`)}
            // Delete uses default modal automatically!
            />
            {/* No need for external modals - ProTable handles delete modal internally */}
        </div>
    );
}

/**
 * Example 7: Partial Override - Only Edit Action
 * 
 * Use when: Only edit needs a dedicated page, everything else is simple
 */
export function QuestionsPagePartialOverride() {
    const navigate = useNavigate();
    const table = useProTable({ resource: "questions" });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Override only edit action
                onEdit={(row) => navigate(`/questions/${row.id}/edit`)}
            // Create, View, Delete all use default modals
            />
        </div>
    );
}

/**
 * Example 8: Complete Override with Custom Actions
 * 
 * Use when: You need completely custom action buttons (e.g., Clone, Approve, etc.)
 * 
 * OLD APPROACH: Use renderRowActions for full control
 */
export function FullyCustomTable() {
    const navigate = useNavigate();
    const table = useProTable({ resource: "courses" });
    const [customLoading, setCustomLoading] = useState(false);

    const handleCloneCourse = async (course: any) => {
        setCustomLoading(true);
        // Custom business logic
        console.log("Cloning course:", course.id);
        // await api.cloneCourse(course.id);
        setCustomLoading(false);
    };

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Custom header with multiple actions
                headerActions={
                    <div className="flex gap-2">
                        <Button onClick={() => navigate("/courses/import")}>
                            Import
                        </Button>
                        <Button onClick={() => navigate("/courses/create")}>
                            Create
                        </Button>
                    </div>
                }
                // Complete custom row actions (not using standard view/edit/delete)
                renderRowActions={(row) => (
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/courses/${row.id}`)}
                        >
                            View
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/courses/${row.id}/edit`)}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCloneCourse(row)}
                            disabled={customLoading}
                        >
                            Clone
                        </Button>
                    </div>
                )}
            />
        </div>
    );
}
