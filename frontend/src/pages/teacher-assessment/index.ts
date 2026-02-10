/**
 * Teacher Assessment Components
 * 
 * Reusable components for CRUD operations on assessments.
 * Supports both card and table views.
 */

// Main page
export { default as TeacherAssessmentPage } from './TeacherAssessmentPage';
export { default as EditAssessmentPage } from './EditAssessmentPage';

// View components
export { AssessmentCard } from './AssessmentCard';
export { AssessmentGrid } from './AssessmentGrid';
export { getColumns } from './columns';

// Form components
export { AssessmentFormFields } from './AssessmentFormFields';

// Modal components
export { CreateAssessmentModal } from './CreateAssessmentModal';
export { UpdateAssessmentModal } from './UpdateAssessmentModal';
export { ViewAssessmentModal } from './ViewAssessmentModal';
export { DeleteAssessmentDialog } from './DeleteAssessmentDialog';
