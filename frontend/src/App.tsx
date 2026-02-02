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
import { Logout } from "./pages/auth/Logout";
import { NotFoundRedirect } from "./pages/handler/NotFoundRedirect";

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
          <Route path="*" element={<NotFoundRedirect />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
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
