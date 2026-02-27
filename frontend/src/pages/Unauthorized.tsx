import { Link } from "react-router-dom";

export default function UnauthorizedPage({ isAuthenticated }: { isAuthenticated?: boolean }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <h1 className="text-7xl font-bold text-primary">403</h1>

            <p className="mt-4 text-xl font-semibold">
                Access Denied
            </p>

            <p className="mt-2 max-w-md text-muted-foreground">
                You do not have permission to access this page.
                If you believe this is a mistake, please contact your administrator.
            </p>

            <div className="mt-6 flex gap-3">
                {isAuthenticated ? (
                    <Link
                        to="/dashboard"
                        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        Go to Dashboard
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted"
                    >
                        Back to Login
                    </Link>
                )}
            </div>
        </div>
    );
}
