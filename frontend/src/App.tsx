import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useActiveModuleGroups } from "./hooks/useSidebarMenus";
import type { RootState } from "./store/store";
import { AuthProvider } from "./contexts/AuthContext";
import NotFoundPage from "./pages/NotFoundPage";
import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { Login } from "./pages/auth/Login";
import { Logout } from "./pages/auth/Logout";
import { Unauthorized } from "./pages/Unauthorized";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFoundRedirect } from "./pages/handler/NotFoundRedirect";
import { componentRegistry } from "./router/componentRegistry";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { MfaPromptModal } from "./components/MfaPromptModal";
import mfaGate from "./api/mfaGate";
import axiosInstance from "./api/axiosInstance";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: moduleGroups = [] } = useActiveModuleGroups(isAuthenticated);
  const [showMfaModal, setShowMfaModal] = useState(false);

  useEffect(() => {
    const unsubscribe = mfaGate.subscribe(() => {
      console.log("MFA Gate triggered, has pending requests:", mfaGate.hasPendingRequests());
      if (mfaGate.hasPendingRequests()) {
        console.log("Opening MFA modal");
        setShowMfaModal(true);
      }
    });

    return unsubscribe;
  }, []);

  const handleMfaSuccess = () => {
    console.log("MFA verification successful, resolving all pending requests");
    mfaGate.resolveAll((config) => axiosInstance(config));
    setShowMfaModal(false);
  };

  const handleMfaCancel = () => {
    console.log("MFA cancelled by user, rejecting all pending requests");
    mfaGate.rejectAll(new Error("MFA cancelled by user"));
    setShowMfaModal(false);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" aria-label={undefined} />
        {showMfaModal && (
          <div style={{ position: "fixed", top: 10, right: 10, background: "yellow", padding: "10px", zIndex: 9999 }}>
            MFA Modal State: {showMfaModal ? "OPEN" : "CLOSED"}
          </div>
        )}
        <MfaPromptModal open={showMfaModal} onStepUpSuccess={handleMfaSuccess} onCancel={handleMfaCancel} />
        <Routes>
          <Route path="/notFoundPage" element={<NotFoundPage isAuthenticated={isAuthenticated} />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
