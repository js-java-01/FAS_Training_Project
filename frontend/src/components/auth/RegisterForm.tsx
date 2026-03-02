import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { RegisterRequest } from '@/types/auth';
import { useState } from "react";

const registerSchema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(6, "Min 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

interface RegisterFormProps {
    onSubmit: (data: RegisterRequest) => void;
    loading: boolean;
}

export function RegisterForm({ onSubmit, loading }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const form = useForm<RegisterRequest>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
        defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
                <h2 className="text-3xl font-semibold mb-1" style={{ color: "#2c5f5d" }}>
                    Create Account
                </h2>
                <p className="text-sm mb-3" style={{ color: "#6b8585" }}>
                    Join our system today
                </p>

                {/* First Name + Last Name row */}
                <div style={{ width: "85%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "2px" }}>
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="auth-field-container" style={{ width: "100%", margin: 0 }}>
                                        <i className="fas fa-user" />
                                        <input {...field} placeholder="First Name" />
                                        <span />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs pl-2" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="auth-field-container" style={{ width: "100%", margin: 0 }}>
                                        <i className="fas fa-user" />
                                        <input {...field} placeholder="Last Name" />
                                        <span />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs pl-2" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem style={{ width: "85%" }}>
                            <FormControl>
                                <div className="auth-field-container" style={{ width: "100%" }}>
                                    <i className="fas fa-envelope" />
                                    <input {...field} type="email" placeholder="Email" />
                                    <span />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs pl-2" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem style={{ width: "85%" }}>
                            <FormControl>
                                <div className="auth-field-container" style={{ width: "100%" }}>
                                    <i className="fas fa-lock" />
                                    <input {...field} type={showPassword ? "text" : "password"} placeholder="Password" />
                                    <span
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5fb3a9" }}
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
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5fb3a9" }}
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

                <button type="submit" className="auth-action-button" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> : "Sign Up"}
                </button>
            </form>
        </Form>
    );
}