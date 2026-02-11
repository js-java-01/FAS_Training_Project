import { Link } from "react-router-dom";

export default function NotFoundPage({isAuthenticated}: {isAuthenticated?: boolean}) {

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <h1 className="text-7xl font-bold text-primary">404</h1>

            <p className="mt-4 text-xl font-semibold">
                Page Not Found
            </p>

            <p className="mt-2 max-w-md text-muted-foreground">
                Sorry, the page you are looking for does not exist or has been moved.
                Please check the URL or return to the dashboard.
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
