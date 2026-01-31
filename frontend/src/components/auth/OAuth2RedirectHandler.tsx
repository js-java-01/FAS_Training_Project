import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setLogin } from "@/store/slices/auth/authSlice";
import type { LoginResponse } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

export const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setGoogleUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      const decoded: LoginResponse = jwtDecode(token);
      decoded.token = token;
      dispatch(setLogin(decoded));
      setGoogleUser(decoded);
      navigate("/dashboard");
    } else {
      navigate("/login?error=true");
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Processing...</p>
    </div>
  );
};
