import { MainLayout } from "@/components/layout/MainLayout";
import LocationsTable from "@/pages/locations/table";
import MainHeader from "@/components/layout/MainHeader";

export default function LocationsManagement() {
    return (
        <MainLayout pathName={{ locations: "Locations Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <MainHeader 
                    title={"Locations Management"} 
                    description={"View and manage training locations in the system"}
                />
                <LocationsTable />
            </div>
        </MainLayout>
    );
}
