import React from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { ProgrammingLanguageTable } from './ProgrammingLanguageTable';

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
                <ProgrammingLanguageTable />
            </div>
        </MainLayout>
    );
};

export default ProgrammingLanguageManagement;