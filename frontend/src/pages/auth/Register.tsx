import { authApi } from '@/api/authApi';
import React, { useState } from 'react';
import { Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
    const navigate = useNavigate();
    const [isVerifyStep, setIsVerifyStep] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData) as unknown as RegisterRequest;

        try {
            await authApi.register(data);
            setEmail(data.email);
            setIsVerifyStep(true);
            toast.success("Registration successful! Please verify your email.");
        } catch (error: any) {
            const message = error.response?.data?.message || "Registration failed";
            toast.error("Registration failed! " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.verify({ email, code: otp });
            toast.success("Email verified successfully! You can now log in.");
            navigate('/login');
        } catch (error) {
            toast.error("OTP is incorrect!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-4">
            <div className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-3xl border border-gray-100 transition-all">

                {!isVerifyStep ? (

                    <form onSubmit={handleRegister} className="p-8 space-y-5">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">RBAC System Registration</h1>
                            <p className="text-sm text-gray-500">Create an account to learn now.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="firstName" placeholder="First Name" required className="h-11 rounded-xl" />
                            <Input name="lastName" placeholder="Last Name" required className="h-11 rounded-xl" />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                            <Input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="pl-10 h-11 rounded-xl "
                            />
                        </div>

                        <Input name="password" type="password" placeholder="Password" required className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" />

                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl">
                            {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                        </Button>
                    </form>
                ) : (<div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-bold">Verify OTP</h2>
                        <p className="text-sm text-gray-500">Verification code has been sent to <br /> <span className="text-black font-medium">{email}</span></p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6 digits"
                            maxLength={6}
                            className="w-full text-center text-xl font-mono tracking-[8px] h-12 border-2 border-gray-200 rounded-2xl focus:border-black outline-none transition-all"
                        />

                        <Button onClick={handleVerify} disabled={loading || otp.length < 6} className="w-full h-12 rounded-xl">
                            {loading ? <Loader2 className="animate-spin" /> : "Verify Code"}
                        </Button>


                    </div>
                </div>
                )}
            </div>
        </div>
    );
}