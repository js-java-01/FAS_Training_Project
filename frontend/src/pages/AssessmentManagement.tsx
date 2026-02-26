
import { MainLayout } from '@/components/layout/MainLayout';
import { AssessmentTable } from './assessment-type';
import MainHeader from '@/components/layout/MainHeader';

/**
 * Assessment Management Page
 * 
 * Uses the same layout pattern as ProgrammingLanguageManagement
 * with MainLayout wrapper and AssessmentTable component.
 */
export default function AssessmentManagement() {
  return (
    <MainLayout pathName={{ assessments: "Assessment Types" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <MainHeader title="Assessment Types" />
        <AssessmentTable />
      </div>
    </MainLayout>
  );
}
