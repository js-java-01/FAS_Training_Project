import { ProTable } from "@/components/datatable/ProTable";
import { useProTable } from "@/hooks/useProTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Example 1: ZERO CONFIG - Simple Entity with Default Modal CRUD
 * 
 * Perfect for: Tags, Categories, Status, Priority, etc.
 * 
 * ✅ Uses internal modal system automatically
 * ✅ Default create button appears
 * ✅ Default view/edit/delete actions work out of the box
 * ✅ ZERO custom code needed
 */
export function TagsPageZeroConfig() {
    const table = useProTable({
        resource: "tags",
        schema: {
            title: "Tags",
            resource: "tags",
            idField: "id",
            fields: [
                {
                    name: "name",
                    label: "Name",
                    type: "string",
                    required: true,
                },
                {
                    name: "color",
                    label: "Color",
                    type: "string",
                },
                {
                    name: "description",
                    label: "Description",
                    type: "text",
                },
            ],
        },
    });

    // That's it! ProTable handles everything:
    // - Create button (opens modal)
    // - View action (opens detail modal)
    // - Edit action (opens form modal)
    // - Delete action (opens confirmation modal)
    return (
        <div className="h-full flex flex-col">
            <ProTable table={table} />
        </div>
    );
}

/**
 * Example 2: Custom Header Actions Only
 * 
 * Use when: You want a custom create button (e.g., navigate to a page)
 * 
 * ✅ Override create button
 * ✅ Keep default row actions (view/edit/delete modals)
 */
export function TagsPageCustomHeader() {
    const navigate = useNavigate();
    const table = useProTable({ resource: "tags" });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Custom create button - navigates to create page
                headerActions={
                    <Button onClick={() => navigate("/tags/create")}>
                        Create Tag
                    </Button>
                }
            // Row actions still use default modals (view/edit/delete)
            />
        </div>
    );
}

/**
 * Example 3: Override Single Action (Edit)
 * 
 * Use when: You want to customize ONE action but keep others default
 * 
 * ✅ Custom edit action (navigate to edit page)
 * ✅ Keep default view action (modal)
 * ✅ Keep default delete action (modal)
 */
export function TagsPageCustomEdit() {
    const navigate = useNavigate();
    const table = useProTable({ resource: "tags" });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Override only the edit action
                onEdit={(row) => navigate(`/tags/${row.id}/edit`)}
            // View and Delete still use default modals automatically!
            />
        </div>
    );
}

/**
 * Example 4: Override Multiple Actions
 * 
 * Use when: You need routing for some actions, modal for others
 * 
 * ✅ Custom create (navigate)
 * ✅ Custom edit (navigate)
 * ✅ Keep default view (modal)
 * ✅ Keep default delete (modal)
 */
export function TagsPageMixedActions() {
    const navigate = useNavigate();
    const table = useProTable({ resource: "tags" });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                headerActions={
                    <Button onClick={() => navigate("/tags/create")}>
                        Create
                    </Button>
                }
                onEdit={(row) => navigate(`/tags/${row.id}/edit`)}
            // View and Delete use default modals
            />
        </div>
    );
}

/**
 * Example 5: Display-Only Table (No Actions)
 * 
 * Use when: Read-only view, no CRUD needed
 */
export function ReadOnlyTable() {
    const table = useProTable({ resource: "logs" });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                hideActions={true}
                headerActions={<div className="text-lg font-semibold">System Logs</div>}
            />
        </div>
    );
}
