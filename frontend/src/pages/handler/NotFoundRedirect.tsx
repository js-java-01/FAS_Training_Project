import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useActiveModuleGroups } from "@/hooks/useSidebarMenus";

export const NotFoundRedirect = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: moduleGroups = [], isPending } =
    useActiveModuleGroups(isAuthenticated);

  // Wait for module groups to load (covers both pending+idle and pending+fetching
  // in TanStack Query v5, where isLoading = isPending && isFetching which misses
  // the brief "enabled just switched to true" window before fetching starts)
  if (isAuthenticated && isPending) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allUrls = moduleGroups.flatMap((g) =>
    g.modules.map((m) => m.url).filter((url): url is string => !!url),
  );

  const isValidRoute = allUrls.some(
    (url) =>
      location.pathname === url || location.pathname.startsWith(url + "/"),
  );

  if (!isValidRoute) {
    return <Navigate to="/notFoundPage" replace />;
  }

  return null;
};
