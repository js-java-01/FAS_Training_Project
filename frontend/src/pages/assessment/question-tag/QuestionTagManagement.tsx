import { MainLayout } from '@/components/layout/MainLayout';
import { QuestionTagTable } from './QuestionTagTable';

/**
 * Question Tag Management Page
 * 
 * Uses the same layout pattern as QuestionCategoryManagement
 * with MainLayout wrapper and QuestionTagTable component.
 */
export default function QuestionTagManagement() {
    return (
        <MainLayout pathName={{ "question-tags": "Question Tags" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <QuestionTagTable />
            </div>
        </MainLayout>
    );
}
