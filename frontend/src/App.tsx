import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { RootState } from "./store/store";
import { AuthProvider } from "./contexts/AuthContext";
import { useActiveModuleGroups } from "./hooks/useSidebarMenus";
import NotFoundPage from "./pages/NotFoundPage";

import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { Login } from "./pages/auth/Login";
import { Logout } from "./pages/auth/Logout";
import { Unauthorized } from "./pages/Unauthorized";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFoundRedirect } from "./pages/handler/NotFoundRedirect";
import { Dashboard } from "./pages/Dashboard";
import { UserManagement } from "./pages/UserManagement";
import { AssessmentManagement } from "./pages/AssessmentManagement";
import { RoleManagement } from "./pages/RoleManagement";
// import { LocationManagement } from "./pages/LocationManagement";
import ProgrammingLanguageManagement from "./pages/ProgrammingLanguageManagement";
import CourseManagement from "./pages/course/CourseManagement";
import CourseDetailPage from "./pages/course/CourseDetailPage";
import StudentCourseContent from "./pages/learning/StudentCourseContent";
import ModuleGroupsManagement from "./pages/modules/module_groups/ModuleGroupsManagement";
import ModulesManagement from "./pages/modules/module/ModulesManagement";
import { componentRegistry } from "./router/componentRegistry";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { MfaPromptModal } from "./components/MfaPromptModal";
import mfaGate from "./api/mfaGate";
import axiosInstance from "./api/axiosInstance";
import MfaSettings from "./pages/MfaSettings";
import { Toaster } from "sonner";
import { RoleSwitchProvider } from "./contexts/RoleSwitchContext";


function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: moduleGroups = [] } = useActiveModuleGroups(isAuthenticated);
  const [showMfaModal, setShowMfaModal] = useState(false);

  useEffect(() => {
    const unsubscribe = mfaGate.subscribe(() => {
      if (mfaGate.hasPendingRequests()) {
        setShowMfaModal(true);
      }
    });

    return unsubscribe;
  }, []);

  const handleMfaSuccess = () => {
    mfaGate.resolveAll((config) => axiosInstance(config));
    setShowMfaModal(false);
  };

  const handleMfaCancel = () => {
    mfaGate.rejectAll(new Error("MFA cancelled by user"));
    setShowMfaModal(false);
  };

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
          <Routes>
            <Route path="/notFoundPage" element={<NotFoundPage isAuthenticated={isAuthenticated} />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/mfa-settings" element={<ProtectedRoute><MfaSettings /></ProtectedRoute>} />
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
          </Routes>


          <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="colored"
            aria-label={undefined}
          />


          <Routes>
            <Route path="*" element={<NotFoundRedirect />} />
            <Route
              path="/oauth2/redirect"
              element={<OAuth2RedirectHandler />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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

            {/* <Route
              path="/locations"
              element={
                <ProtectedRoute requiredPermission="LOCATION_READ">
                  <LocationManagement />
                </ProtectedRoute>
              }
            /> */}
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



            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </RoleSwitchProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
