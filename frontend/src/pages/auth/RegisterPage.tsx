import { useState } from 'react';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest, VerifyRequest } from '@/types/auth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { VerifyForm } from '@/components/auth/OTPForm';


export default function RegisterPage() {
    const navigate = useNavigate();
    const [isVerifyStep, setIsVerifyStep] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tempEmail, setTempEmail] = useState("");

    const onRegister = async (data: RegisterRequest) => {
        setLoading(true);
        try {
            await authApi.register(data);
            setTempEmail(data.email);
            setIsVerifyStep(true);
            toast.success("Registration successful!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const onVerify = async (data: VerifyRequest) => {
        setLoading(true);
        try {
            const response = await authApi.verify({ ...data, email: tempEmail });
            if (response === false) throw new Error("Verification failed");
            toast.success("Email verified successfully!");
            navigate('/login');
        } catch (error) {
            toast.error("OTP is incorrect!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-main-wrapper register-active">
            {/* Animated circle */}
            <div className="auth-animated-circle" />

            {/* Content wrapper */}
            <div className="auth-content-wrapper">
                {/* Forms section */}
                <div className="auth-forms-section">
                    {/* Login form placeholder (hidden on register page) */}
                    <div className="auth-form-panel auth-login-panel" />

                    {/* Register / Verify form */}
                    <div className="auth-form-panel auth-register-panel" style={{ padding: "0 2rem", width: "100%" }}>
                        {!isVerifyStep ? (
                            <RegisterForm onSubmit={onRegister} loading={loading} />
                        ) : (
                            <VerifyForm
                                onSubmit={onVerify}
                                loading={loading}
                                email={tempEmail}
                                onBack={() => setIsVerifyStep(false)}
                            />
                        )}
                        <div className="text-center mb-4" style={{ fontSize: "13px", color: "#6b8585" }}>
                            Forgot Password?{" "}
                            <a href="/forgot-password" style={{ color: "#44a08d", textDecoration: "underline" }}>
                                Reset here
                            </a>
                        </div>
                    </div>
                </div>

                {/* Side panels */}
                <div className="auth-side-panels">
                    {/* Left panel (hidden on register page) */}
                    <div className="auth-info-panel auth-left-info">
                        <div className="auth-panel-content">
                            <h3>New Here?</h3>
                            <p>Sign up and discover a great amount of new opportunities!</p>
                            <button className="auth-transparent-btn" onClick={() => navigate("/register")}>
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Right panel (visible on register page) */}
                    <div className="auth-info-panel auth-right-info">
                        <div className="auth-panel-content">
                            <h3>One of us?</h3>
                            <p>If you already have an account, just sign in. We've missed you!</p>
                            <button className="auth-transparent-btn" onClick={() => navigate("/login")}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}