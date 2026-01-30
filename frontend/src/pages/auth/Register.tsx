import { authApi } from '@/api/authApi';
import React, { useState } from 'react';
import { Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest, VerifyRequest } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from "react-hook-form";

export default function Register() {
    const navigate = useNavigate();
    const [isVerifyStep, setIsVerifyStep] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tempEmail, setTempEmail] = useState("");

    const {
        register: regFields,
        handleSubmit: handleRegSubmit,
        formState: { errors: regErrors }
    } = useForm<RegisterRequest>({ mode: "onChange" });

    const {
        register: verifyFields,
        handleSubmit: handleVerifySubmit,
        watch: watchVerify,
        formState: { errors: verifyErrors }
    } = useForm<VerifyRequest>({ mode: "onChange" });

    const otpValue = watchVerify("code");

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
                    <form onSubmit={handleRegSubmit(onRegister)} className="p-10 space-y-7">
                        <div className="text-center space-y-3">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Account</h1>
                            <p className="text-lg text-gray-500">Join our RBAC system today</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Input {...regFields("firstName", { required: "Required" })} placeholder="First Name" className="h-14 text-lg rounded-2xl" />
                                {regErrors.firstName && <span className="text-sm text-red-500 ml-2">{regErrors.firstName.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Input {...regFields("lastName", { required: "Required" })} placeholder="Last Name" className="h-14 text-lg rounded-2xl" />
                                {regErrors.lastName && <span className="text-sm text-red-500 ml-2">{regErrors.lastName.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                                <Input
                                    {...regFields("email", {
                                        required: "Email is required",
                                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                    })}
                                    type="email"
                                    placeholder="Email Address"
                                    className="pl-12 h-14 text-lg rounded-2xl"
                                />
                            </div>
                            {regErrors.email && <p className="text-sm text-red-500 ml-2">{regErrors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Input
                                {...regFields("password", { required: "Min 6 characters", minLength: 6 })}
                                type="password"
                                placeholder="Password"
                                className="h-14 text-lg rounded-2xl"
                            />
                            {regErrors.password && <p className="text-sm text-red-500 ml-2">{regErrors.password.message}</p>}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-13 text-xl font-bold rounded-2xl shadow-lg shadow-black/5 hover:shadow-black/10 transition-all">
                            {loading ? <Loader2 className="animate-spin" /> : <>Get Started <ArrowRight className="ml-2" size={22} /></>}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifySubmit(onVerify)} className="p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-green-100 p-5 rounded-full text-green-600">
                                <ShieldCheck size={56} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                            <p className="text-lg text-gray-500">
                                We sent a code to <br />
                                <span className="text-black font-semibold underline decoration-green-500 underline-offset-4">{tempEmail}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                {...verifyFields("code", { required: "Code is required", minLength: 6 })}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full text-center text-2xl font-mono tracking-[12px] h-15 border-2 border-gray-200 rounded-[12px] focus:border-black transition-all bg-gray-50"
                            />
                            {verifyErrors.code && <p className="text-center text-sm text-red-500 font-medium">Please enter the 6-digit code</p>}
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                disabled={loading || otpValue?.length < 6}
                                className="w-full h-10 text-lg font-bold rounded-xl bg-black hover:bg-gray-800"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Confirm & Verify"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setIsVerifyStep(false)}
                                className="w-full text-base text-gray-400 hover:text-black font-medium transition-colors"
                            >
                                ← Back to Registration
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}