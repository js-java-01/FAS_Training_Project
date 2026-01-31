import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import type { Menu } from "@/types/menu";
import { encodeBase64 } from "@/utils/base64.utils.ts";
import { mockModuleGroups } from "../../../mocks/moduleGroups.mock.ts";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";

export default function ModuleGroupsTable() {
    const navigate = useNavigate();

    // ===== state cho modal =====
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Menu | null>(null);

    // form state đơn giản để thử UI
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [order, setOrder] = useState(1);
    const [status, setStatus] = useState(true);

    const openAdd = () => {
        setEditing(null);
        setName("");
        setDescription("");
        setOrder(1);
        setStatus(true);
        setOpen(true);
    };

    const openEdit = (menu: Menu) => {
        setEditing(menu);
        setName(menu.name);
        setDescription(menu.description ?? "");
        setOrder(menu.displayOrder ?? 0);
        setStatus(menu.isActive ?? true);
        setOpen(true);
    };

    const handleSave = () => {
        if (editing) {
            console.log("UPDATE (mock)", {
                id: editing.id,
                name,
                description,
                order,
                status,
            });
        } else {
            console.log("CREATE (mock)", {
                name,
                description,
                order,
                status,
            });
        }
        setOpen(false);
    };

    const columns = useMemo(
        () =>
            getColumns({
                onView: (menu) => {
                    navigate(`/moduleGroups/${encodeBase64(menu.id)}`);
                },
                onEdit: (menu) => openEdit(menu),
                onDelete: (menu) => console.log("Delete", menu.id),
            }),
        [navigate]
    );

    return (
        <>
            <DataTable<Menu, unknown>
                columns={columns as ColumnDef<Menu, unknown>[]}
                data={mockModuleGroups}
                isSearch={true}
                searchPlaceholder={"module group name or description"}
                headerActions={
                    <Button
                        onClick={openAdd}
                        className="justify-self-end w-full lg:w-32 bg-blue-600 text-white hover:bg-blue-700"
                        autoFocus={false}
                    >
                        Add New
                        <Plus className="h-4 w-4 ml-1" />
                    </Button>
                }
            />

            {/* ===== Modal thử nghiệm ===== */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* modal */}
                    <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-6 animate-[fadeIn_.2s_ease-out]">
                        <h2 className="text-xl font-semibold mb-4">
                            {editing ? "Edit Module Group" : "Add New Module Group"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Order</label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full border rounded px-3 py-2"
                                        value={order}
                                        onChange={(e) => setOrder(Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        className="mt-1 w-full border rounded px-3 py-2"
                                        value={status ? "active" : "inactive"}
                                        onChange={(e) => setStatus(e.target.value === "active")}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
