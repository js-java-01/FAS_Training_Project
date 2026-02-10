import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import NotFoundPage from "./pages/NotFoundPage";
import { OAuth2RedirectHandler } from "./components/auth/OAuth2RedirectHandler";
import { Toaster } from "sonner";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: moduleGroups = [] } = useActiveModuleGroups(isAuthenticated);
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
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
