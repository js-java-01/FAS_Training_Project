import { authApi } from '@/api/authApi';
import { ForgotEmailForm } from '@/components/auth/ForgotEmailForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import type { ForgotPasswordEmailRequest, ResetPasswordData } from '@/types/auth';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const navigator = useNavigate();
    const [loading, setLoading] = useState(false);

    const onForgotPasswordSubmit = async (data: ForgotPasswordEmailRequest) => {
        setLoading(true);
        try {
            const response = await authApi.forgotPassword(data);
            if (response) {
                toast.success("Reset link sent to your email!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Send email failed");
        } finally {
            setLoading(false);
        }
    };

    const onResetPasswordSubmit = async (data: ResetPasswordData) => {
        if (!email || !token) {
            toast.error("Invalid password reset link.");
            return;
        }
        setLoading(true);
        try {
            const response = await authApi.resetPassword({
                email,
                token,
                newPassword: data.password
            });
            if (response) {
                toast.success("Password reset successful!");
                navigator('/login');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-main-wrapper">
            {/* Animated circle */}
            <div className="auth-animated-circle" />

            {/* Content wrapper */}
            <div className="auth-content-wrapper">
                {/* Forms section */}
                <div className="auth-forms-section">
                    <div className="auth-form-panel auth-login-panel" style={{ padding: "0 2rem", width: "100%" }}>
                        {!token ? (
                            <ForgotEmailForm onSubmit={onForgotPasswordSubmit} loading={loading} />
                        ) : (
                            <ResetPasswordForm onSubmit={onResetPasswordSubmit} loading={loading} />
                        )}
                        <div className="text-center mb-4" style={{ fontSize: "13px", color: "#6b8585" }}>
                            <a href="/login" style={{ color: "#44a08d", textDecoration: "underline" }}>
                                ← Back to Login
                            </a>
                        </div>
                    </div>
                    <div className="auth-form-panel auth-register-panel" />
                </div>

                {/* Side panels */}
                <div className="auth-side-panels">
                    <div className="auth-info-panel auth-left-info">
                        <div className="auth-panel-content">
                            <h3>Remember it?</h3>
                            <p>Go back and sign in to your account.</p>
                            <button className="auth-transparent-btn" onClick={() => navigator("/login")}>
                                Sign In
                            </button>
                        </div>
                    </div>
                    <div className="auth-info-panel auth-right-info">
                        <div className="auth-panel-content">
                            <h3>New Here?</h3>
                            <p>Sign up and discover a great amount of new opportunities!</p>
                            <button className="auth-transparent-btn" onClick={() => navigator("/register")}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}