import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const NotFoundRedirect = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};
