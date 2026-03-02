import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ShieldCheck } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { VerifyRequest } from '@/types/auth';

const verifySchema = z.object({
    code: z.string().length(6, "Please enter the 6-digit code"),
    email: z.string().email(),
});

interface VerifyFormProps {
    onSubmit: (data: VerifyRequest) => void;
    loading: boolean;
    email: string;
    onBack: () => void;
}

export function VerifyForm({ onSubmit, loading, email, onBack }: VerifyFormProps) {
    const form = useForm<VerifyRequest>({
        resolver: zodResolver(verifySchema),
        defaultValues: { code: "", email: email },
    });

    const otpValue = form.watch("code");

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
                <div
                    style={{
                        background: "rgba(78,205,196,0.12)",
                        padding: "16px",
                        borderRadius: "50%",
                        marginBottom: "12px",
                        color: "#4ecdc4",
                    }}
                >
                    <ShieldCheck size={48} />
                </div>

                <h2 className="text-2xl font-semibold mb-1" style={{ color: "#2c5f5d" }}>
                    Verify OTP
                </h2>
                <p className="text-sm mb-4 text-center" style={{ color: "#6b8585" }}>
                    We sent a code to{" "}
                    <span style={{ color: "#2c5f5d", fontWeight: 600 }}>{email}</span>
                </p>

                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem style={{ width: "85%" }}>
                            <FormControl>
                                <div className="auth-field-container" style={{ width: "100%" }}>
                                    <i className="fas fa-key" />
                                    <input
                                        {...field}
                                        placeholder="000000"
                                        maxLength={6}
                                        style={{ textAlign: "center", letterSpacing: "8px", fontSize: "1.3rem" }}
                                    />
                                    <span />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs text-center" />
                        </FormItem>
                    )}
                />

                <button
                    type="submit"
                    className="auth-action-button"
                    disabled={loading || otpValue?.length < 6}
                    style={{ width: "85%", marginTop: "8px" }}
                >
                    {loading ? <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> : "Verify"}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    style={{ marginTop: "8px", fontSize: "13px", color: "#6b8585", background: "none", border: "none", cursor: "pointer" }}
                >
                    ← Back to Registration
                </button>
            </form>
        </Form>
    );
}