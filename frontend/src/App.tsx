import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { RootState } from "./store/store";
import { useActiveModuleGroups } from "./hooks/useSidebarMenus";
import NotFoundPage from "./pages/NotFoundPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFoundRedirect } from "./pages/handler/NotFoundRedirect";
import { routes } from "./router/componentRegistry";
import { Toaster } from "sonner";
import { RoleSwitchProvider } from "./contexts/RoleSwitchContext";
import QuestionTagManagementPage from "./pages/question-tag/management";


function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: moduleGroups = [] } = useActiveModuleGroups(isAuthenticated);
  
  // Create component lookup map from module-driven routes
  const componentRegistry = Object.fromEntries(
    routes
      .filter(r => r.isModuleDriven)
      .map(r => [r.path, r.component])
  );
  
  // Get non-module routes (frontend-controlled)
  const staticRoutes = routes.filter(r => !r.isModuleDriven);
  
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
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Special routes */}
            <Route path="/notFoundPage" element={<NotFoundPage isAuthenticated={isAuthenticated} />} />
            <Route path="/question-tags" element={<QuestionTagManagementPage />} />
            
            {/* Dynamic routes from backend Module table */}
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

            {/* Static routes from componentRegistry */}
            {staticRoutes.map((route, index) => {
              const Component = route.component;
              
              if (route.isPublic) {
                return <Route key={index} path={route.path} element={<Component />} />;
              }
              
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <ProtectedRoute requiredPermission={route.requiredPermission}>
                      <Component />
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* Catch all */}
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </RoleSwitchProvider>
      </AuthProvider >
    </BrowserRouter >
  );
}

export default App;
