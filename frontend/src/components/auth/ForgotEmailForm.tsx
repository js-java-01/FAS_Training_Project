import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { ForgotPasswordEmailRequest } from '@/types/auth';

const emailSchema = z.object({
    email: z.string().email("Invalid email format"),
});

interface ForgotEmailFormProps {
    onSubmit: (data: ForgotPasswordEmailRequest) => void;
    loading: boolean;
}

export const ForgotEmailForm = ({ onSubmit, loading }: ForgotEmailFormProps) => {
    const form = useForm<ForgotPasswordEmailRequest>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem 0" }}
            >
                <h2 className="text-3xl font-semibold mb-1" style={{ color: "#1e293b" }}>
                    Forgot Password?
                </h2>
                <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                    Enter your email to receive a reset link
                </p>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem style={{ width: "85%" }}>
                            <FormControl>
                                <div className="auth-field-container" style={{ width: "100%" }}>
                                    <i className="fas fa-envelope" />
                                    <input {...field} type="email" placeholder="Email Address" />
                                    <span />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs pl-2" />
                        </FormItem>
                    )}
                />

                <button type="submit" className="auth-action-button" disabled={loading} style={{ marginTop: "10px" }}>
                    {loading ? <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> : "Send Link"}
                </button>
            </form>
        </Form>
    );
};