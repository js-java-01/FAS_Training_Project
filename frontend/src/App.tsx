import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/auth/Login";
import { RoleManagement } from "./pages/RoleManagement";
import { Unauthorized } from "./pages/Unauthorized";
import { UserManagement } from "./pages/UserManagement";
import Register from "./pages/auth/Register";
import { Toaster } from "sonner";
import ModuleGroupsManagement from "@/pages/modules/ModuleGroupsManagement.tsx";
import ModulesManagement from "@/pages/modules/ModulesManagement.tsx";
import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { RoleManagement } from "./pages/RoleManagement";
import { Unauthorized } from "./pages/Unauthorized";
import { UserManagement } from "./pages/UserManagement";
import ModuleGroupsManagement from "@/pages/modules/module_groups/ModuleGroupsManagement.tsx";
import ModuleGroupDetail from "@/pages/modules/module_groups/ModuleGroupDetail.tsx";
import ModulesManagement from "@/pages/modules/module/ModulesManagement.tsx";
import ModuleDetail from "@/pages/modules/module/ModuleDetail.tsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/register" element={<Register />} />
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

        <Route path="/moduleGroups" element={<ModuleGroupsManagement />} />
        <Route path="/moduleGroups/:id" element={<ModuleGroupDetail />} />
        <Route path="/modules" element={<ModulesManagement />} />
        <Route path="/modules/:id" element={<ModuleDetail />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
