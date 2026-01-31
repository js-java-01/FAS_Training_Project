import { authApi } from '@/api/authApi';
import { ForgotEmailForm } from '@/components/auth/ForgotEmailForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import type { ForgotPasswordEmailRequest, ResetPasswordData } from '@/types/auth';
import { useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';


export default function ForgotPassword() {
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
        }
        finally {
            setLoading(false);
        }
    }

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
        }
        finally {
            setLoading(false);
        }

    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6">
            <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-[32px] border border-gray-100">
                {!token ? (
                    <ForgotEmailForm onSubmit={onForgotPasswordSubmit} loading={loading} />
                ) : (
                    <ResetPasswordForm onSubmit={onResetPasswordSubmit} loading={loading} />
                )}
            </div>
        </div>
    );
}