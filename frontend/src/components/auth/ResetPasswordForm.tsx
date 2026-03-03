import { Loader2, Eye, EyeOff } from 'lucide-react';
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { ResetPasswordData } from '@/types/auth';
import { useState } from 'react';

const resetSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

interface ResetPasswordFormProps {
    onSubmit: (data: ResetPasswordData) => void;
    loading: boolean;
}

export const ResetPasswordForm = ({ onSubmit, loading }: ResetPasswordFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem 0" }}
            >
                <h2 className="text-3xl font-semibold mb-1" style={{ color: "#1e293b" }}>
                    New Password
                </h2>
                <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                    Please enter your new secure password
                </p>

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem style={{ width: "85%" }}>
                            <FormControl>
                                <div className="auth-field-container" style={{ width: "100%" }}>
                                    <i className="fas fa-lock" />
                                    <input {...field} type={showPassword ? "text" : "password"} placeholder="New Password" />
                                    <span
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs pl-2" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem style={{ width: "85%" }}>
                            <FormControl>
                                <div className="auth-field-container" style={{ width: "100%" }}>
                                    <i className="fas fa-lock" />
                                    <input {...field} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" />
                                    <span
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs pl-2" />
                        </FormItem>
                    )}
                />

                <button type="submit" className="auth-action-button" disabled={loading} style={{ marginTop: "10px" }}>
                    {loading ? <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> : "Update Password"}
                </button>
            </form>
        </Form>
    );
};