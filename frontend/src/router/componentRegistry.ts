import type { ComponentType } from "react";
import { UserManagement } from "@/pages/user/UserManagement";
import { Dashboard } from "@/pages/Dashboard";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import LocationsManagement from "@/pages/locations/LocationsManagement";
import PermissionsManagement from "@/pages/permissions/PermissionsManagement";
import TopicManagement from "@/pages/topic/TopicManagement";
import ProgramManagement from "@/pages/programs/ProgramManagement";
import ClassesComponent from "@/pages/classes/ClassesManagement";
import { RoleManagementPage } from "@/pages/role";
import SemesterManagement from "@/pages/semesters/SemsterManagement";
import SkillManagementPage from "@/pages/skill/SkillManagementPage";
import SkillGroupManagementPage from "@/pages/skill/SkillGroupManagementPage";
import AssessmentTypeManagementPage from "@/pages/assessment-type/management";
import ProgrammingLanguageManagement from "@/pages/programming-language";
import { AttemptHistoryPage, QuizPage, ResultPage, SelectAssessmentPage } from "@/pages/assessment";
import { AssessmentFormPage, TeacherAssessmentPage } from "@/pages/teacher-assessment";
import CourseDetailPage from "@/pages/course/CourseDetailPage";
import { CreateQuestionPage, EditQuestionPage } from "@/pages/assessment/question";
import StudentCourseContent from "@/pages/learning/StudentCourseContent";

export const componentRegistry: Record<string, ComponentType> = {
  "/dashboard": Dashboard,
  "/users": UserManagement,
  "/modules": ModulesManagement,
  "/moduleGroups": ModuleGroupsManagement,
  "/notFoundPage": NotFoundPage,
  "/roles": RoleManagementPage,
  "/classes": ClassesComponent,
  "/locations": LocationsManagement,
  "/permissions": PermissionsManagement,
  "/topics": TopicManagement,
  "/skills": SkillManagementPage,
  "/skillGroups": SkillGroupManagementPage,
  "/programs": ProgramManagement,
  "/semesters": SemesterManagement,
  "/assessment-type": AssessmentTypeManagementPage,
  "/programming-languages": ProgrammingLanguageManagement,
  "/assessments": SelectAssessmentPage,    "/teacher-assessment": TeacherAssessmentPage,
    
  // Parameterized routes - public
  "/courses/:id": CourseDetailPage,
  "/assessments/quiz/:submissionId": QuizPage,
  "/assessments/result/:submissionId": ResultPage,
  "/assessments/history/:assessmentId": AttemptHistoryPage,
    
  // Parameterized routes - protected
  "/learn/:cohortId": StudentCourseContent,
  "/teacher-assessment/create": AssessmentFormPage,
  "/teacher-assessment/:id/edit": AssessmentFormPage,
  "/questions/create": CreateQuestionPage,
  "/questions/:id/edit": EditQuestionPage,
};



