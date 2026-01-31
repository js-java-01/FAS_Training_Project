import { authApi } from '@/api/authApi';
import { ForgotEmailForm } from '@/components/auth/ForgotEmailForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import type { ForgotPasswordEmailRequest } from '@/types/auth';
import { useState } from 'react';

import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';


export default function ForgotPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    console.log("Token:", token);
    console.log("Email:", email);
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


    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6">
            <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-[32px] border border-gray-100">
                {!token ? (
                    <ForgotEmailForm onSubmit={onForgotPasswordSubmit} loading={loading} />
                ) : (
                    <ResetPasswordForm onSubmit={() => console.log("submit")} loading={false} />
                )}
            </div>
        </div>
    );
}