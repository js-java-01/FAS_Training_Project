import { MainLayout } from '@/components/layout/MainLayout';
import { QuestionCategoryTable } from './QuestionCategoryTable';
import MainHeader from '@/components/layout/MainHeader';

/**
 * Question Category Management Page
 * 
 * Uses the same layout pattern as AssessmentManagement
 * with MainLayout wrapper and QuestionCategoryTable component.
 */
export default function QuestionCategoryManagement() {
    return (
        <MainLayout pathName={{ "question-categories": "Question Categories" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader title="Question Categories" />
                <QuestionCategoryTable />
            </div>
        </MainLayout>
    );
}
