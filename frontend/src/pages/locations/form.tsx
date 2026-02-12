import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location, CreateLocationRequest, UpdateLocationRequest } from "@/types/location";
import { LocationStatus } from "@/types/location";
import { locationDataApi, type Province, type Commune } from "@/api/locationDataApi";

interface LocationFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLocationRequest | UpdateLocationRequest) => void;
    initialData?: Location | null;
}

const defaultFormData: Partial<CreateLocationRequest> = {
    name: "",
    address: "",
    communeId: "",
    status: LocationStatus.ACTIVE,
};

export function LocationForm({ open, onClose, onSubmit, initialData }: LocationFormProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState("");

    const [formData, setFormData] = useState<Partial<CreateLocationRequest>>(() => {
        if (initialData) {
            return {
                name: initialData.name,
                address: initialData.address,
                communeId: initialData.communeId,
                status: initialData.status,
            };
        }
        return defaultFormData;
    });

    // Load provinces when modal opens
    useEffect(() => {
        const fetchProvinces = async () => {
            if (open) {
                try {
                    const data = await locationDataApi.getAllProvinces();
                    setProvinces(data);
                } catch (error) {
                    console.error("Failed to fetch provinces", error);
                }
            }
        };
        fetchProvinces();
    }, [open]);

    // Load communes when province changes
    useEffect(() => {
        const fetchCommunes = async () => {
            if (selectedProvinceId) {
                try {
                    const data = await locationDataApi.getCommunesByProvinceId(selectedProvinceId);
                    setCommunes(data);
                } catch (error) {
                    console.error("Failed to fetch communes", error);
                }
            } else {
                setCommunes([]);
            }
        };
        fetchCommunes();
    }, [selectedProvinceId]);

    // Initialize form when modal opens or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    address: initialData.address,
                    communeId: initialData.communeId,
                    status: initialData.status,
                });
                // Find province for the commune
                const findProvince = async () => {
                    try {
                        const allProvinces = await locationDataApi.getAllProvinces();
                        for (const province of allProvinces) {
                            const provincesCommunes = await locationDataApi.getCommunesByProvinceId(province.id);
                            if (provincesCommunes.some(c => c.id === initialData.communeId)) {
                                setSelectedProvinceId(province.id);
                                break;
                            }
                        }
                    } catch (error) {
                        console.error("Failed to find province", error);
                    }
                };
                findProvince();
            } else {
                setFormData(defaultFormData);
                setSelectedProvinceId("");
                setCommunes([]);
            }
        }
    }, [initialData, open]);

    const handleProvinceChange = (provinceId: string) => {
        setSelectedProvinceId(provinceId);
        setFormData({ ...formData, communeId: "" }); // Reset commune when province changes
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData) {
            // Update mode
            const payload: UpdateLocationRequest = {
                name: formData.name,
                address: formData.address,
                communeId: formData.communeId,
                status: formData.status,
            };
            onSubmit(payload);
        } else {
            // Create mode
            const payload: CreateLocationRequest = {
                name: formData.name || "",
                address: formData.address || "",
                communeId: formData.communeId || "",
                status: formData.status || LocationStatus.ACTIVE,
            };
            onSubmit(payload);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Location" : "Add New Location"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address <span className="text-red-500">*</span></Label>
                        <Input
                            id="address"
                            value={formData.address || ""}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>

                    {/* Province */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="province" className="text-right">Province <span className="text-red-500">*</span></Label>
                        <select
                            id="province"
                            value={selectedProvinceId}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            required
                        >
                            <option value="" disabled>Select Province</option>
                            {provinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Commune */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="commune" className="text-right">Commune <span className="text-red-500">*</span></Label>
                        <select
                            id="commune"
                            value={formData.communeId || ""}
                            onChange={(e) => setFormData({ ...formData, communeId: e.target.value })}
                            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            required
                            disabled={!selectedProvinceId}
                        >
                            <option value="" disabled>
                                {selectedProvinceId ? "Select Commune" : "Select Province first"}
                            </option>
                            {communes.map((commune) => (
                                <option key={commune.id} value={commune.id}>
                                    {commune.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status <span className="text-red-500">*</span></Label>
                        <select
                            id="status"
                            value={formData.status || LocationStatus.ACTIVE}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as LocationStatus })}
                            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            required
                        >
                            <option value={LocationStatus.ACTIVE}>Active</option>
                            <option value={LocationStatus.INACTIVE}>Inactive</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
