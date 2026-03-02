import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { setLogin } from "@/store/slices/auth/authSlice";
import { authApi } from "@/api/authApi";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const URL_LOGIN_WITH_GOOGLE =
  import.meta.env.VITE_API_URL_FOR_GOOGLE || "http://localhost:8080/oauth2/authorization/google";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberedMe, setIsRememberedMe] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    try {
      const res = await authApi.login({ email: cleanEmail, password: cleanPassword, isRememberedMe });
      dispatch(setLogin(res));
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendMsg = err.response?.data?.message;
        setError(backendMsg || "Invalid email or password");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    window.location.href = URL_LOGIN_WITH_GOOGLE;
  };

  return (
    <div className="auth-main-wrapper">
      {/* Animated circle */}
      <div className="auth-animated-circle" />

      {/* Content wrapper */}
      <div className="auth-content-wrapper">
        {/* Forms section */}
        <div className="auth-forms-section">
          {/* Login form */}
          <div className="auth-form-panel auth-login-panel">
            <h2 className="text-3xl font-semibold mb-2" style={{ color: "#2c5f5d" }}>
              Welcome Back!
            </h2>
            <p className="text-sm mb-4" style={{ color: "#6b8585" }}>
              Sign in to your account
            </p>

            {error && (
              <div className="mb-4 px-4 py-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg w-[85%]">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="auth-field-container">
                <i className="fas fa-envelope" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <span />
              </div>

              <div className="auth-field-container">
                <i className="fas fa-lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#5fb3a9",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <div
                style={{
                  width: "85%",
                  display: "flex",
                  alignItems: "center",
                  margin: "8px 0",
                }}
              >
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={isRememberedMe}
                  onChange={(e) => setIsRememberedMe(e.target.checked)}
                  style={{ marginRight: "8px", cursor: "pointer" }}
                />
                <label
                  htmlFor="rememberMe"
                  style={{
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#2d4a4a",
                  }}
                >
                  Remember me
                </label>
              </div>

              <a
                href="/forgot-password"
                className="text-link"
                style={{
                  fontSize: "14px",
                  color: "#44a08d",
                  textDecoration: "none",
                  marginBottom: "8px",
                }}
              >
                Forgot Password?
              </a>

              <button
                type="submit"
                className="auth-action-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <svg
                      className="animate-spin"
                      style={{ width: 16, height: 16 }}
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p
              style={{
                fontSize: "13px",
                color: "#6b8585",
                margin: "8px 0 4px",
              }}
            >
              or sign in with
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="auth-social-link"
                type="button"
                title="Continue with Google"
              >
                <FcGoogle size={22} />
              </button>
            </div>

            {/* Test credentials */}
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "rgba(78,205,196,0.08)",
                borderRadius: "10px",
                border: "1px solid rgba(78,205,196,0.2)",
                width: "85%",
                fontSize: "11px",
              }}
            >
              <p
                style={{
                  color: "#6b8585",
                  fontWeight: 700,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Test Only:
              </p>
              <p style={{ color: "#2d4a4a" }}>
                <b>ADMIN:</b> admin@example.com / password123
              </p>
              <p style={{ color: "#2d4a4a" }}>
                <b>STUDENT:</b> student@example.com / password123
              </p>
            </div>
          </div>

          {/* Register form placeholder (hidden on login page) */}
          <div className="auth-form-panel auth-register-panel" />
        </div>

        {/* Side panels */}
        <div className="auth-side-panels">
          {/* Left panel (visible on login page) */}
          <div className="auth-info-panel auth-left-info">
            <div className="auth-panel-content">
              <h3>New Here?</h3>
              <p>Sign up and discover a great amount of new opportunities!</p>
              <button
                className="auth-transparent-btn"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Right panel (hidden on login page) */}
          <div className="auth-info-panel auth-right-info">
            <div className="auth-panel-content">
              <h3>One of us?</h3>
              <p>If you already have an account, just sign in. We've missed you!</p>
              <button
                className="auth-transparent-btn"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
