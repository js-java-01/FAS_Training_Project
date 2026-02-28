import AssessmentManagement from "@/pages/AssessmentManagement";
import { Dashboard } from "@/pages/Dashboard";
import { LocationManagement } from "@/pages/LocationManagement";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import { RoleManagement } from "@/pages/RoleManagement.tsx";
import ProgrammingLanguageManagement  from "@/pages/programming-language/ProgrammingLanguageManagement.tsx";
import AssessmentManagement from "@/pages/assessment-type/AssessmentManagement.tsx";
import { LocationManagement } from "@/pages/LocationManagement";
import CourseManagement from "@/pages/course/CourseManagement";
import { SelectAssessmentPage } from "@/pages/assessment";
import { TeacherAssessmentPage } from "@/pages/teacher-assessment";
import { QuestionCategoryManagement } from "@/pages/question-category";
import { TeacherAssessmentPage } from "@/pages/teacher-assessment";
import type { ComponentType } from "react";

// Auth components
import { Logout } from "@/components/auth/Logout";
import { OAuth2RedirectHandler } from "@/components/auth/OAuth2RedirectHandler";
import { Unauthorized } from "@/pages/Unauthorized";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import { Login } from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/RegisterPage";

// Parameterized route components
import CourseDetailPage from "@/pages/course/CourseDetailPage";
import { AttemptHistoryPage, QuizPage, ResultPage } from "@/pages/exam";
import StudentCourseContent from "@/pages/learning/StudentCourseContent";
import { QuizPage, ResultPage, AttemptHistoryPage } from "@/pages/assessment";
import { AssessmentFormPage } from "@/pages/teacher-assessment";
import { CreateQuestionPage, EditQuestionPage } from "@/pages/question";
import { AssessmentFormPage } from "@/pages/teacher-assessment";
import { UserManagementPage } from "@/pages/user";
import { RoleManagementPage } from "@/pages/role";

// ── Route Configuration Types ─────────────────────────────────────────────────
export interface RouteConfig {
    path: string;
    component: ComponentType<any>;
    requiredPermission?: string;
    isPublic?: boolean;
    isModuleDriven?: boolean;  // Route path/permissions come from backend Module table
}

export const routes: RouteConfig[] = [
    // Module-driven routes (rendered from Module table, but need component mapping)
    { path: "/dashboard", component: Dashboard, isModuleDriven: true },
    { path: "/users", component: UserManagementPage, isModuleDriven: true },
    { path: "/modules", component: ModulesManagement, isModuleDriven: true },
    { path: "/moduleGroups", component: ModuleGroupsManagement, isModuleDriven: true },
    { path: "/notFoundPage", component: NotFoundPage, isModuleDriven: true },
    { path: "/roles", component: RoleManagementPage, isModuleDriven: true },
    { path: "/locations", component: LocationManagement, isModuleDriven: true },
    { path: "/programming-languages", component: ProgrammingLanguageManagement, isModuleDriven: true },
    { path: "/assessment-type", component: AssessmentManagement, isModuleDriven: true },
    { path: "/courses", component: CourseManagement, isModuleDriven: true },
    { path: "/my-courses", component: CourseManagement, isModuleDriven: true },
    { path: "/assessments", component: SelectAssessmentPage, isModuleDriven: true },
    { path: "/teacher-assessment", component: TeacherAssessmentPage, isModuleDriven: true },
    { path: "/question-categories", component: QuestionCategoryManagement, isModuleDriven: true },
    { path: "/questions", component: QuestionManagementPage, isModuleDriven: true },
    
    // Public routes (frontend-controlled)
    { path: "/login", component: Login, isPublic: true },
    { path: "/logout", component: Logout, isPublic: true },
    { path: "/register", component: RegisterPage, isPublic: true },
    { path: "/forgot-password", component: ForgotPasswordPage, isPublic: true },
    { path: "/oauth2/redirect", component: OAuth2RedirectHandler, isPublic: true },
    { path: "/unauthorized", component: Unauthorized, isPublic: true },
    
    // Parameterized routes - public
    { path: "/courses/:id", component: CourseDetailPage, isPublic: true },
    { path: "/assessments/quiz/:submissionId", component: QuizPage, isPublic: true },
    { path: "/assessments/result/:submissionId", component: ResultPage, isPublic: true },
    { path: "/assessments/history/:assessmentId", component: AttemptHistoryPage, isPublic: true },
    
    // Parameterized routes - protected
    { path: "/learn/:cohortId", component: StudentCourseContent, requiredPermission: "ENROLL_COURSE" },
    { path: "/teacher-assessment/create", component: AssessmentFormPage, requiredPermission: "ASSESSMENT_CREATE" },
    { path: "/teacher-assessment/:id/edit", component: AssessmentFormPage, requiredPermission: "ASSESSMENT_UPDATE" },
    { path: "/questions/create", component: CreateQuestionPage, requiredPermission: "QUESTION_CREATE" },
    { path: "/questions/:id/edit", component: EditQuestionPage, requiredPermission: "QUESTION_UPDATE" },
];
