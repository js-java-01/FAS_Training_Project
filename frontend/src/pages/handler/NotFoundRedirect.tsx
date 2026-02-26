import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useActiveModuleGroups } from "@/hooks/useSidebarMenus";

export const NotFoundRedirect = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const { data: moduleGroups = [], isLoading } =
    useActiveModuleGroups(isAuthenticated);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allUrls = moduleGroups.flatMap((g) =>
    g.modules
      .map((m) => m.url)
      .filter((url): url is string => !!url)
  );

  const isValidRoute = allUrls.some(
    (url) =>
      location.pathname === url ||
      location.pathname.startsWith(url + "/")
  );

  if (!isValidRoute) {
    return <Navigate to="/notFoundPage" replace />;
  }

  return null;
};
