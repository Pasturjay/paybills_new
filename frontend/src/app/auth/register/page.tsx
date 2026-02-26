"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError("");

        try {
            // 1. Google OAuth (same flow handles both sign-up and sign-in)
            const result = await signInWithPopup(auth, googleProvider);

            // 2. Get the Firebase ID Token
            const idToken = await result.user.getIdToken();

            // 3. Backend will auto-create the user in Prisma if they don't exist
            const res = await fetch('/api/auth/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create account');
            }

            // 4. Store the token and redirect to dashboard
            localStorage.setItem('firebaseToken', idToken);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Google Sign-Up Error:", err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-up was cancelled. Please try again.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Or{" "}
                        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        By creating an account, you agree to our{" "}
                        <Link href="/legal/terms" className="underline">Terms of Service</Link>
                        {" "}and{" "}
                        <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
