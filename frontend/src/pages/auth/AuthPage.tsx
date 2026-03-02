import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { setLogin } from "@/store/slices/auth/authSlice";
import { authApi } from "@/api/authApi";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { VerifyForm } from "@/components/auth/OTPForm";
import { ForgotEmailForm } from "@/components/auth/ForgotEmailForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import type { RegisterRequest, VerifyRequest, ForgotPasswordEmailRequest, ResetPasswordData } from "@/types/auth";

const URL_LOGIN_WITH_GOOGLE =
  import.meta.env.VITE_API_URL_FOR_GOOGLE || "http://localhost:8080/oauth2/authorization/google";

type AuthMode = "login" | "register" | "forgot";

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Determine initial mode from URL
  const getInitialMode = (): AuthMode => {
    if (location.pathname === "/register") return "register";
    if (location.pathname === "/forgot-password") return "forgot";
    return "login";
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode);

  // Sync URL when navigating via browser back/forward
  useEffect(() => {
    setMode(getInitialMode());
  }, [location.pathname]);

  // === Login state ===
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberedMe, setIsRememberedMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // === Register state ===
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // === Forgot password state ===
  const [forgotLoading, setForgotLoading] = useState(false);
  const resetToken = searchParams.get("token");
  const resetEmail = searchParams.get("email");

  // ==================== HANDLERS ====================

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await authApi.login({
        email: email.trim(),
        password: password.trim(),
        isRememberedMe,
      });
      dispatch(setLogin(res));
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setLoginError(err.response?.data?.message || "Invalid email or password");
      } else if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError("An unexpected error occurred!");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoginLoading(true);
    setLoginError("");
    window.location.href = URL_LOGIN_WITH_GOOGLE;
  };

  const onRegister = async (data: RegisterRequest) => {
    setRegisterLoading(true);
    try {
      await authApi.register(data);
      setTempEmail(data.email);
      setIsVerifyStep(true);
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  const onVerify = async (data: VerifyRequest) => {
    setRegisterLoading(true);
    try {
      const response = await authApi.verify({ ...data, email: tempEmail });
      if (!response) throw new Error("Verification failed");
      toast.success("Email verified successfully!");
      switchTo("login");
    } catch {
      toast.error("OTP is incorrect!");
    } finally {
      setRegisterLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordEmailRequest) => {
    setForgotLoading(true);
    try {
      const response = await authApi.forgotPassword(data);
      if (response) toast.success("Reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Send email failed");
    } finally {
      setForgotLoading(false);
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordData) => {
    if (!resetEmail || !resetToken) {
      toast.error("Invalid password reset link.");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await authApi.resetPassword({
        email: resetEmail,
        token: resetToken,
        newPassword: data.password,
      });
      if (response) {
        toast.success("Password reset successful!");
        switchTo("login");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setForgotLoading(false);
    }
  };

  // Switch mode and update URL
  const switchTo = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode === "login") navigate("/login", { replace: true });
    else if (newMode === "register") navigate("/register", { replace: true });
    else if (newMode === "forgot") navigate("/forgot-password", { replace: true });
  };

  // ==================== WRAPPER CLASS ====================
  const wrapperClass = [
    "auth-main-wrapper",
    mode === "register" ? "register-active" : "",
    mode === "forgot" ? "forgot-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      {/* Animated circle */}
      <div className="auth-animated-circle" />

      {/* Content wrapper */}
      <div className="auth-content-wrapper">
        {/* ==================== FORMS SECTION ==================== */}
        <div className="auth-forms-section">
          {/* ===== LOGIN FORM ===== */}
          <div className="auth-form-panel auth-login-panel">
            {mode === "forgot" ? (
              /* Forgot password / Reset password form (reuses login panel position) */
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {!resetToken ? (
                  <ForgotEmailForm onSubmit={onForgotPasswordSubmit} loading={forgotLoading} />
                ) : (
                  <ResetPasswordForm onSubmit={onResetPasswordSubmit} loading={forgotLoading} />
                )}
                <button
                  type="button"
                  onClick={() => switchTo("login")}
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#44a08d",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              /* Normal login form */
              <>
                <h2 className="text-3xl font-semibold mb-2" style={{ color: "#2c5f5d" }}>
                  Welcome Back!
                </h2>
                <p className="text-sm mb-4" style={{ color: "#6b8585" }}>
                  Sign in to your account
                </p>

                {loginError && (
                  <div className="mb-4 px-4 py-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg w-[85%]">
                    {loginError}
                  </div>
                )}

                <form
                  onSubmit={handleLoginSubmit}
                  style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
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

                  <div style={{ width: "85%", display: "flex", alignItems: "center", margin: "8px 0" }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={isRememberedMe}
                      onChange={(e) => setIsRememberedMe(e.target.checked)}
                      style={{ marginRight: "8px", cursor: "pointer" }}
                    />
                    <label htmlFor="rememberMe" style={{ fontSize: "14px", cursor: "pointer", color: "#2d4a4a" }}>
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => switchTo("forgot")}
                    style={{
                      fontSize: "14px",
                      color: "#44a08d",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginBottom: "8px",
                    }}
                  >
                    Forgot Password?
                  </button>

                  <button type="submit" className="auth-action-button" disabled={loginLoading}>
                    {loginLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <svg className="animate-spin" style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </span>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>

                <p style={{ fontSize: "13px", color: "#6b8585", margin: "8px 0 4px" }}>or sign in with</p>
                <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loginLoading}
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
                  <p style={{ color: "#6b8585", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase" }}>
                    Test Only:
                  </p>
                  <p style={{ color: "#2d4a4a" }}>
                    <b>ADMIN:</b> admin@example.com / password123
                  </p>
                  <p style={{ color: "#2d4a4a" }}>
                    <b>STUDENT:</b> student@example.com / password123
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ===== REGISTER FORM ===== */}
          <div className="auth-form-panel auth-register-panel" style={{ padding: "0 2rem", width: "100%" }}>
            {!isVerifyStep ? (
              <RegisterForm onSubmit={onRegister} loading={registerLoading} />
            ) : (
              <VerifyForm
                onSubmit={onVerify}
                loading={registerLoading}
                email={tempEmail}
                onBack={() => setIsVerifyStep(false)}
              />
            )}
            <div className="text-center mb-4" style={{ fontSize: "13px", color: "#6b8585" }}>
              Forgot Password?{" "}
              <button
                type="button"
                onClick={() => switchTo("forgot")}
                style={{ color: "#44a08d", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}
              >
                Reset here
              </button>
            </div>
          </div>
        </div>

        {/* ==================== SIDE PANELS ==================== */}
        <div className="auth-side-panels">
          {/* Left panel */}
          <div className="auth-info-panel auth-left-info">
            <div className="auth-panel-content">
              <h3>New Here?</h3>
              <p>Sign up and discover a great amount of new opportunities!</p>
              <button className="auth-transparent-btn" onClick={() => switchTo("register")}>
                Sign Up
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="auth-info-panel auth-right-info">
            <div className="auth-panel-content">
              <h3>One of us?</h3>
              <p>If you already have an account, just sign in. We've missed you!</p>
              <button className="auth-transparent-btn" onClick={() => switchTo("login")}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

