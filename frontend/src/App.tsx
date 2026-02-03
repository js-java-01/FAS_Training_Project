// @ts-ignore
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Dashboard } from "./pages/Dashboard";
import { UserManagement } from "./pages/UserManagement";
import { RoleManagement } from "./pages/RoleManagement/RoleManagement";
import { LocationManagement } from "./pages/LocationManagement";
import { Unauthorized } from "./pages/Unauthorized";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModulesManagement from "./pages/modules/module/ModulesManagement";
import ModuleGroupsManagement from "./pages/modules/module_groups/ModuleGroupsManagement";
import ProgrammingLanguageManagement from "./pages/ProgrammingLanguageManagement";
import { AssessmentManagement } from "./pages/AssessmentManagement";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { Logout } from "./pages/auth/Logout";
import { NotFoundRedirect } from "./pages/handler/NotFoundRedirect";
import DepartmentManagement from "@/pages/DepartmentManagement.tsx";





function App() {
  return (
    <BrowserRouter>
      {/* <Toaster
        duration={1500}
        position="top-right"
        richColors
        toastOptions={{
          className: "p-4",
        }}
      /> */}
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" aria-label={undefined} />
        {/* <SidebarProvider>
         
        </SidebarProvider> */}

        <Routes>
          <Route path="*" element={<NotFoundRedirect />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
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
            path="/users"
            element={
              <ProtectedRoute requiredPermission="USER_READ">
                <UserManagement />
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
            path="/roles"
            element={
              <ProtectedRoute requiredPermission="ROLE_READ">
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute requiredPermission="LOCATION_READ">
                <LocationManagement />
              </ProtectedRoute>
            }
          />

            <Route
                path="/departments"
                element={
                    <ProtectedRoute requiredPermission="DEPARTMENT_READ">
                        <DepartmentManagement/>
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
            path="/moduleGroups"
            element={
              <ProtectedRoute requiredPermission="ROLE_READ">
                <ModuleGroupsManagement />
              </ProtectedRoute>
            }
          />
            <Route
                path="/modules"
                element={
                    <ProtectedRoute requiredPermission="ROLE_READ">
                        <ModulesManagement />
                    </ProtectedRoute>
                }
            />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
