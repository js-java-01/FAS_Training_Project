import { useState } from 'react';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
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
            await authApi.verify({ ...data, email: tempEmail });
            toast.success("Email verified successfully!");
            navigate('/login');
        } catch (error) {
            toast.error("OTP is incorrect!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6">
            <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-[32px] border border-gray-100 transition-all">
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
                <div className='text-center mb-6'>
                    Forgot Password? <Link to="/forgot-password" className="text-blue-600 hover:underline">Reset here</Link>
                </div>
            </div>
        </div>
    );
}