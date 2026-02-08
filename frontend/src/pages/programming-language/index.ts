/**
 * Programming Language Components
 * 
 * Reusable modal and dialog components for CRUD operations
 * on programming languages.
 */

// Main table component (following Assessment pattern)
export { ProgrammingLanguageTable } from './ProgrammingLanguageTable';
export { ProgrammingLanguageFormFields } from './ProgrammingLanguageFormFields';
export { getColumns } from './columns';

// Modal components
export { CreateLanguageModal } from './CreateLanguageModal';
export { UpdateLanguageModal } from './UpdateLanguageModal';
export { ViewLanguageModal } from './ViewLanguageModal';
export { DeleteLanguageDialog } from './DeleteLanguageDialog';
export { ImportLanguageDialog } from './ImportLanguageDialog';
export { ExportModal } from './ExportModal';

// Legacy form fields (kept for backward compatibility)
export { LanguageFormFields } from './LanguageFormFields';
export * from './utils';
