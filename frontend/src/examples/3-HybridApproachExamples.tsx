import { Download, Send, Eye, Pen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProTable } from "@/components/datatable/ProTable";
import { useProTable } from "@/hooks/useProTable";
import ActionButton from "@/components/datatable/common/ActionButton";
import { useState } from "react";

/**
 * Example 9: Hybrid Approach - Custom Business Actions with Default CRUD
 * 
 * Use when:
 * - Need standard CRUD (view/edit/delete) + special business actions
 * - Want to add extra buttons (send, download, approve, etc.)
 * 
 * Strategy:
 * - Keep default create/view/edit/delete
 * - Use renderRowActions to add custom business buttons alongside defaults
 */
export function InvoicesPageHybrid() {
    const table = useProTable({
        resource: "invoices",
        schema: {
            title: "Invoices",
            resource: "invoices",
            idField: "id",
            fields: [
                { name: "invoiceNumber", label: "Invoice #", type: "string" },
                { name: "customer", label: "Customer", type: "relation" },
                { name: "amount", label: "Amount", type: "number" },
                { name: "status", label: "Status", type: "select" },
            ],
        },
    });

    const handleSendInvoice = async (invoice: any) => {
        console.log("Sending invoice:", invoice);
        // Custom business logic
        // await api.sendInvoice(invoice.id);
    };

    const handleDownloadPDF = async (invoice: any) => {
        console.log("Downloading PDF:", invoice);
        // Custom business logic
        // await api.downloadInvoicePDF(invoice.id);
    };

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Default create button shows automatically

                // Add custom actions alongside default view/edit/delete
                renderRowActions={(row) => (
                    <>
                        {/* Standard actions - use internal handlers */}
                        <ActionButton
                            onClick={() => table.openEdit(row)}
                            tooltip="View Details"
                            icon={<Eye size={10} className="text-gray-500" />}
                        />
                        <ActionButton
                            onClick={() => table.openEdit(row)}
                            tooltip="Edit"
                            icon={<Pen size={10} className="text-gray-500" />}
                        />

                        {/* Custom business actions */}
                        <ActionButton
                            onClick={() => handleSendInvoice(row)}
                            tooltip="Send Invoice"
                            icon={<Send size={10} className="text-blue-500" />}
                        />
                        <ActionButton
                            onClick={() => handleDownloadPDF(row)}
                            tooltip="Download PDF"
                            icon={<Download size={10} className="text-green-500" />}
                        />

                        {/* Standard delete action */}
                        <ActionButton
                            onClick={() => {
                                if (confirm(`Delete invoice ${row.invoiceNumber}?`)) {
                                    table.remove(row.id);
                                }
                            }}
                            tooltip="Delete"
                            icon={<Trash2 size={10} className="text-red-500" />}
                        />
                    </>
                )}
            />
        </div>
    );
}

/**
 * Example 10: Custom Form Modal + Default Actions
 * 
 * Use when:
 * - Need special form UI (e.g., wizard, custom validation)
 * - Want to keep standard row actions
 */
export function CustomFormModalExample() {
    const table = useProTable({ resource: "products" });

    return (
        <div className="h-full flex flex-col">
            <ProTable
                table={table}
                // Override only the form modal
                renderFormModal={({ open, onClose, initial, onSubmit }) => (
                    <div className={open ? "modal-open" : "modal-closed"}>
                        <h2>{initial ? "Edit Product" : "Create Product"}</h2>
                        {/* Custom form UI here */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Custom form handling
                            onSubmit({ name: "test" });
                        }}>
                            <input placeholder="Product name" />
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => onClose(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                )}
            // Row actions use default view/edit/delete
            />
        </div>
    );
}

/**
 * Example 11: Conditional Overrides
 * 
 * Use when: Different behaviors based on app state or user permissions
 */
export function ConditionalOverrides() {
    const table = useProTable({ resource: "items" });
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [hasDeletePermission, setHasDeletePermission] = useState(true);

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4 flex gap-2">
                <Button onClick={() => setIsAdvancedMode(!isAdvancedMode)}>
                    {isAdvancedMode ? "Simple Mode" : "Advanced Mode"}
                </Button>
                <Button onClick={() => setHasDeletePermission(!hasDeletePermission)}>
                    {hasDeletePermission ? "Revoke Delete" : "Grant Delete"}
                </Button>
            </div>

            <ProTable
                table={table}
                // Conditionally override based on mode
                onEdit={isAdvancedMode
                    ? (row) => {
                        console.log("Advanced edit for:", row);
                        // Custom advanced editing logic
                    }
                    : undefined // Uses default modal when undefined
                }
                // Conditionally hide delete action
                onDelete={hasDeletePermission
                    ? undefined // Uses default modal
                    : () => alert("You don't have permission to delete") // Custom handler
                }
            />
        </div>
    );
}
