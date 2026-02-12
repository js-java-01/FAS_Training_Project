import { MainLayout } from '../../components/layout/MainLayout';
import DepartmentsTable from './table';
import MainHeader from '../../components/layout/MainHeader';

const DepartmentManagement = () => {
    return (
        <MainLayout>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader
                    title="Department Management"
                    description="View and manage departments in the system."
                />
                <DepartmentsTable />
            </div>
        </MainLayout>
    );
};

export default DepartmentManagement;
