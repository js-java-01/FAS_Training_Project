import type { ComponentType } from "react";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import AssessmentManagement from "@/pages/AssessmentManagement";
import { LocationManagement } from "@/pages/LocationManagement";
import CourseManagement from "@/pages/course/CourseManagement";
import { TeacherAssessmentPage } from "@/pages/teacher-assessment";
import { QuestionCategoryManagement } from "@/pages/question-category";
import { QuestionManagementPage } from "@/pages/question";

// Auth components
import { OAuth2RedirectHandler } from "@/components/auth/OAuth2RedirectHandler";
import { Login } from "@/pages/auth/Login";
import { Logout } from "@/components/auth/Logout";
import { Unauthorized } from "@/pages/Unauthorized";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

// Parameterized route components
import CourseDetailPage from "@/pages/course/CourseDetailPage";
import StudentCourseContent from "@/pages/learning/StudentCourseContent";
import { AssessmentFormPage } from "@/pages/teacher-assessment";
import { CreateQuestionPage, EditQuestionPage } from "@/pages/question";
import UserManagement from "@/pages/user/management";
import { AttemptHistoryPage, QuizPage, ResultPage, SelectAssessmentPage } from "@/pages/assessment";
import { RoleManagementPage } from "@/pages/role";
import ProgrammingLanguageManagement from "@/pages/programming-language/ProgrammingLanguageManagement";

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
    { path: "/users", component: UserManagement, isModuleDriven: true },
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
