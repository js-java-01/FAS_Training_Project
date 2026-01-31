import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { RoleManagement } from './pages/RoleManagement';
import { Unauthorized } from './pages/Unauthorized';
import { UserManagement } from './pages/UserManagement';
import { Toaster } from 'sonner';
import ModuleGroupsManagement from "@/pages/modules/ModuleGroupsManagement.tsx";
import ModulesManagement from "@/pages/modules/ModulesManagement.tsx";
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster duration={1500} position="top-right" richColors toastOptions={
        {
          className: 'p-4'
        }
      } />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
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
          <Route path="/moduleGroups/:id" element={<ModulesManagement />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
