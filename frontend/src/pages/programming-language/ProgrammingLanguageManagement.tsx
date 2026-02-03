import { MainLayout } from '@/components/layout/MainLayout';
import { ProgrammingLanguageTable } from '.';
import { Code2 } from 'lucide-react';
import MainHeader from '@/components/layout/MainHeader';

/**
 * Programming Language Management Page
 * 
 * Uses the same layout pattern as AssessmentManagement
 * with MainLayout wrapper and ProgrammingLanguageTable component.
 */
export const ProgrammingLanguageManagement: React.FC = () => {
    return (
        <MainLayout pathName={{ programmingLanguages: "Programming Languages" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
            <MainHeader title='Programming Language'/>               
                <ProgrammingLanguageTable />
            </div>
        </MainLayout>
    );
};

export default ProgrammingLanguageManagement;