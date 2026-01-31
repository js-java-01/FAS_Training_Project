import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { setLogin } from "@/store/slices/auth/authSlice";

const URL_LOGIN_WITH_GOOGLE =
  import.meta.env.VITE_API_URL_FOR_GOOGLE || "http://localhost:8080/oauth2/authorization/google";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberedMe, setIsRememberedMe] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    try {
      const res = await login({ email: cleanEmail, password: cleanPassword, isRememberedMe });
      dispatch(setLogin(res));
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went  wrong !");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIsRememberMe = (checked: boolean) => {
    setIsRememberedMe(checked);
  };

  const handleGoogleLogin = () => {
    window.location.href = URL_LOGIN_WITH_GOOGLE;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="max-w-md w-full border rounded-xl shadow-lg p-8 bg-card text-card-foreground"
      >
        <div className="space-y-2 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
            </div>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-background"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" onCheckedChange={(checked: boolean) => handleIsRememberMe(checked)} />
            <label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer">
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                Processing...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <Button onClick={handleGoogleLogin} variant="outline" className="w-full mt-3">
          <FcGoogle className="mr-2 h-4 w-4" /> Continue with Google
        </Button>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account yet?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary"
              onClick={() => navigate("/register")}
            >
              Register now
            </Button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-dashed">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">(Test Only):</p>
          <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg border">
            <p className="flex justify-between">
              <span className="text-muted-foreground font-mono text-[11px]">ADMIN:</span>
              <span className="font-medium">admin@example.com / password123</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground font-mono text-[11px]">STUDENT:</span>
              <span className="font-medium">student@example.com / password123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
