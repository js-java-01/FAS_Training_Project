import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { RootState } from "./store/store";
import { useActiveModuleGroups } from "./hooks/useSidebarMenus";
import NotFoundPage from "./pages/NotFoundPage";
import { AuthProvider } from "./contexts/AuthContext";
import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { Login } from "./pages/auth/Login";
import { Unauthorized } from "./pages/Unauthorized";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFoundRedirect } from "./pages/handler/NotFoundRedirect";
import ProgrammingLanguageManagement from "./pages/ProgrammingLanguageManagement";
import ModulesManagement from "./pages/modules/module/ModulesManagement";
import { componentRegistry } from "./router/componentRegistry";
import { Toaster } from "sonner";
import { RoleSwitchProvider } from "./contexts/RoleSwitchContext";
import { AssessmentFormPage, TeacherAssessmentPage } from "./pages/teacher-assessment";
import { QuestionCategoryManagement } from "./pages/question-category";
import { CreateQuestionPage, EditQuestionPage, QuestionManagementPage } from "./pages/question";
import { Logout } from "./components/auth/Logout";
import AssessmentManagement from "./pages/AssessmentManagement";
import CourseManagement from "./pages/course/CourseManagement";
import CourseDetailPage from "./pages/course/CourseDetailPage";
import StudentCourseContent from "./pages/learning/StudentCourseContent";
import TrainingClassesManagement from "./pages/training-classes/TrainingClassesManagement";
import MfaSettings from "./pages/MfaSettings";
import { MfaGateProvider } from "./components/MfaGateProvider";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: moduleGroups = [] } = useActiveModuleGroups(isAuthenticated);
  return (
    <BrowserRouter>
      <Toaster
        duration={1500}
        position="top-right"
        richColors
        toastOptions={{
          className: "p-4",
        }}
      />
      <AuthProvider>
        <RoleSwitchProvider>
          <MfaGateProvider />
          <Routes>
            <Route path="/notFoundPage" element={<NotFoundPage isAuthenticated={isAuthenticated} />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {moduleGroups.flatMap((group) =>
              group.modules.map((m) => {
                if (!m.url) return null;
                const Component = componentRegistry[m.url];
                if (!Component || !m.url) return null;
                return (
                  <Route
                    key={m.id}
                    path={m.url}
                    element={
                      <ProtectedRoute requiredPermission={m.requiredPermission}>
                        <Component />
                      </ProtectedRoute>
                    }
                  />
                );
              })
            )}
            <Route path="*" element={<NotFoundRedirect />} />
            <Route
              path="/training-classes"
              element={
                <ProtectedRoute requiredPermission="CLASS_CREATE">
                  <TrainingClassesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment-type"
              element={
                <ProtectedRoute requiredPermission="ASSESSMENT_READ">
                  <AssessmentManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/programming-languages"
              element={
                <ProtectedRoute requiredPermission="PROGRAMMING_LANGUAGE_READ">
                  <ProgrammingLanguageManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute requiredPermission="COURSE_READ">
                  <CourseManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            {/* /my-courses redirects to /courses for backward compat */}
            <Route
              path="/my-courses"
              element={<Navigate to="/courses" replace />}
            />
            <Route
              path="/my-courses/:id"
              element={<Navigate to="/courses" replace />}
            />
            <Route
              path="/learn/:cohortId"
              element={
                <ProtectedRoute requiredPermission="ENROLL_COURSE">
                  <StudentCourseContent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher-assessment"
              element={
                <ProtectedRoute requiredPermission="ASSESSMENT_READ">
                  <TeacherAssessmentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher-assessment/create"
              element={
                <ProtectedRoute requiredPermission="ASSESSMENT_CREATE">
                  <AssessmentFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher-assessment/:id/edit"
              element={
                <ProtectedRoute requiredPermission="ASSESSMENT_UPDATE">
                  <AssessmentFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/question-categories"
              element={
                <ProtectedRoute requiredPermission="QUESTION_CATEGORY_READ">
                  <QuestionCategoryManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/programming-languages"
              element={
                <ProtectedRoute requiredPermission="PROGRAMMING_LANGUAGE_READ">
                  <ProgrammingLanguageManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path='questions'
              element={
                <ProtectedRoute requiredPermission="QUESTION_READ">
                  <QuestionManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path='questions/create'
              element={
                <ProtectedRoute requiredPermission="QUESTION_CREATE">
                  <CreateQuestionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path='questions/:id/edit'
              element={
                <ProtectedRoute requiredPermission="QUESTION_UPDATE">
                  <EditQuestionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mfa-setting"
              element={
                <ProtectedRoute>
                  <MfaSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </RoleSwitchProvider>
      </AuthProvider >
    </BrowserRouter >
  );
}

export default App;
