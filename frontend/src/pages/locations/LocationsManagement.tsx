import { MainLayout } from "@/components/layout/MainLayout";
import LocationsTable from "@/pages/locations/table";

export default function LocationsManagement() {
    return (
        <MainLayout pathName={{ locations: "Locations Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <LocationsTable />
            </div>
        </MainLayout>
    );
}
