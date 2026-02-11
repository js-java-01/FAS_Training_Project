import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { Login } from "./pages/auth/Login";
import { Unauthorized } from "./pages/Unauthorized";
import RegisterPage from "./pages/auth/RegisterPage";
import ModulesManagement from "./pages/modules/module/ModulesManagement";
import ModuleGroupsManagement from "./pages/modules/module_groups/ModuleGroupsManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleManagement } from "./pages/RoleManagement";
import { UserManagement } from "./pages/UserManagement";
import { Dashboard } from "./pages/Dashboard";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import AssessmentManagement from "./pages/assessment-type/AssessmentManagement";
import TeacherAssessmentPage from "./pages/teacher-assessment/TeacherAssessmentPage";
import AssessmentFormPage from "./pages/teacher-assessment/AssessmentFormPage";
import { QuestionCategoryManagement } from "./pages/question-category";
import { CreateQuestionPage, EditQuestionPage } from "./pages/question";
import QuestionManagementPage from "./pages/question/QuestionManagementPage";
import ProgrammingLanguageManagement from "./pages/ProgrammingLanguageManagement";

// import { SidebarProvider } from "./components/ui/sidebar";

function App() {
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
        {/* <SidebarProvider>
         
        </SidebarProvider> */}
        <Routes>
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission="USER_READ">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermission="ROLE_READ">
                <RoleManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/moduleGroups"
            element={
              <ProtectedRoute requiredPermission="ROLE_READ">
                <ModuleGroupsManagement />
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

          <Route path="/modules" element={<ModulesManagement />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
