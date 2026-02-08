import { MainLayout } from '@/components/layout/MainLayout';
import { AssessmentTable } from '../components/assessment/AssessmentTable';
import { ClipboardCheck } from 'lucide-react';

export default function AssessmentManagement() {
    return (
        <MainLayout pathName={{ assessments: "Assessment Types" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <div className={"flex flex-col"}>
                    <div className={"flex gap-2"}>
                        <ClipboardCheck className={"inline-block text-gray-600"} />
                        <h1 className={"text-xl font-bold"}>Assessment Types</h1>
                    </div>
                    <p className={"text-gray-500 text-sm"}>Manage assessment type definitions</p>
                </div>
                <AssessmentTable />
            </div>
        </MainLayout>
    );
}
