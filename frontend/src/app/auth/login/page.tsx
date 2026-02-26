"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    signInWithPopup,
    OAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AuthMode = "signin" | "signup";
type InputMode = "social" | "email" | "phone";

export default function LoginPage() {
    const router = useRouter();

    const [authMode, setAuthMode] = useState<AuthMode>("signin");
    const [inputMode, setInputMode] = useState<InputMode>("social");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const recaptchaContainerRef = useRef<HTMLDivElement>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    // Setup reCAPTCHA verifier for phone sign-in
    useEffect(() => {
        if (inputMode === "phone" && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                size: "invisible",
            });
        }
    }, [inputMode]);

    const syncWithBackend = async (idToken: string) => {
        const res = await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
            const e = await res.json();
            throw new Error(e.error || "Server sync failed");
        }
        localStorage.setItem("firebaseToken", idToken);
        router.push("/dashboard");
    };

    const handleGoogle = async () => {
        setLoading(true); setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await syncWithBackend(await result.user.getIdToken());
        } catch (err: any) {
            if (err.code === "auth/popup-closed-by-user") setError("Sign-in was cancelled.");
            else setError(err.message || "Google sign-in failed.");
        } finally { setLoading(false); }
    };

    const handleApple = async () => {
        setLoading(true); setError("");
        try {
            const provider = new OAuthProvider("apple.com");
            provider.addScope("email");
            provider.addScope("name");
            const result = await signInWithPopup(auth, provider);
            await syncWithBackend(await result.user.getIdToken());
        } catch (err: any) {
            if (err.code === "auth/popup-closed-by-user") setError("Sign-in was cancelled.");
            else setError(err.message || "Apple sign-in failed.");
        } finally { setLoading(false); }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(""); setInfo("");
        try {
            let result;
            if (authMode === "signin") {
                result = await signInWithEmailAndPassword(auth, email, password);
            } else {
                result = await createUserWithEmailAndPassword(auth, email, password);
            }
            await syncWithBackend(await result.user.getIdToken());
        } catch (err: any) {
            const msg: Record<string, string> = {
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password.",
                "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
                "auth/weak-password": "Password must be at least 6 characters.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/invalid-credential": "Incorrect email or password.",
            };
            setError(msg[err.code] || err.message || "Authentication failed.");
        } finally { setLoading(false); }
    };

    const handleSendOtp = async () => {
        if (!phone) { setError("Please enter a phone number."); return; }
        setLoading(true); setError(""); setInfo("");
        try {
            if (!recaptchaVerifierRef.current) throw new Error("reCAPTCHA not ready. Please try again.");
            const confirm = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
            setConfirmResult(confirm);
            setOtpSent(true);
            setInfo(`Verification code sent to ${phone}`);
        } catch (err: any) {
            const msg: Record<string, string> = {
                "auth/invalid-phone-number": "Please enter a valid phone number with country code (e.g. +2348012345678).",
                "auth/too-many-requests": "Too many attempts. Please try again later.",
            };
            setError(msg[err.code] || err.message || "Failed to send OTP.");
            // Reset reCAPTCHA after failure
            recaptchaVerifierRef.current = null;
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmResult || !otp) { setError("Enter the code you received."); return; }
        setLoading(true); setError("");
        try {
            const result = await confirmResult.confirm(otp);
            await syncWithBackend(await result.user.getIdToken());
        } catch (err: any) {
            const msg: Record<string, string> = {
                "auth/invalid-verification-code": "Incorrect code. Please check and try again.",
                "auth/code-expired": "The code has expired. Please request a new one.",
            };
            setError(msg[err.code] || err.message || "Verification failed.");
        } finally { setLoading(false); }
    };

    const tabClass = (active: boolean) =>
        `flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${active ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
        }`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-indigo-950 px-4 py-12">
            {/* Invisible reCAPTCHA container */}
            <div ref={recaptchaContainerRef} id="recaptcha-container" />

            <div className="w-full max-w-md">
                {/* Card */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100 dark:border-gray-800">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Paybills</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {authMode === "signin" ? "Sign in to continue to your account" : "Create your free account today"}
                        </p>
                        {/* Sign in / Sign up Toggle */}
                        <div className="mt-5 flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                            <button onClick={() => { setAuthMode("signin"); setError(""); setInfo(""); }} className={tabClass(authMode === "signin")}>Sign In</button>
                            <button onClick={() => { setAuthMode("signup"); setError(""); setInfo(""); }} className={tabClass(authMode === "signup")}>Create Account</button>
                        </div>
                    </div>

                    <div className="px-8 py-6 space-y-4">
                        {/* Alerts */}
                        {error && (
                            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex gap-2 items-start">
                                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                            </div>
                        )}
                        {info && (
                            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                                <p className="text-sm text-green-700 dark:text-green-400">{info}</p>
                            </div>
                        )}

                        {/* Social Buttons — always visible */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Google */}
                            <button onClick={handleGoogle} disabled={loading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-all disabled:opacity-50">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>

                            {/* Apple */}
                            <button onClick={handleApple} disabled={loading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-all disabled:opacity-50">
                                <svg className="h-4 w-4" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.1-147.1-102.3C345 885 221 813.7 221 650.7c0-28.1 5.5-56.8 17.9-82.8 50-105.4 163.1-175.8 282.8-175.8 43.8 0 101.5 14.1 139.5 41.2l.5.2zM534.1.3c33.9 0 67.8 10.8 97 30.5-53.4 30.5-82 85.4-82 138.5 0 52.8 29 110.8 83.7 141.5l-.2.2c-25.9 2.6-53.8-5.8-80.5-5.8-42.3 0-83.7 14.1-118.7 39.5-49.1 34.4-79.3 90.2-79.3 149.6 0 22.4 4.5 44.8 13 65.7-54.1-31.4-80.1-87.5-80.1-155.9C286.1 276.2 411.4.3 534.1.3z" />
                                </svg>
                                Apple
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white dark:bg-gray-900 px-3 text-gray-400">or continue with</span>
                            </div>
                        </div>

                        {/* Email / Phone Mode Switcher */}
                        <div className="flex gap-2">
                            <button onClick={() => { setInputMode("email"); setError(""); }} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${inputMode === "email" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}>
                                📧 Email
                            </button>
                            <button onClick={() => { setInputMode("phone"); setError(""); }} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${inputMode === "phone" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}>
                                📱 Phone
                            </button>
                        </div>

                        {/* Email form */}
                        {inputMode === "email" && (
                            <form onSubmit={handleEmailSubmit} className="space-y-3">
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address"
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password (min 6 characters)"
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                <button type="submit" disabled={loading}
                                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 dark:shadow-none">
                                    {loading ? "Please wait..." : authMode === "signin" ? "Sign In with Email" : "Create Account"}
                                </button>
                            </form>
                        )}

                        {/* Phone form */}
                        {inputMode === "phone" && (
                            <div className="space-y-3">
                                {!otpSent ? (
                                    <>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 801 234 5678 (with country code)"
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                        <button onClick={handleSendOtp} disabled={loading}
                                            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 dark:shadow-none">
                                            {loading ? "Sending..." : "Send Verification Code"}
                                        </button>
                                    </>
                                ) : (
                                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Enter 6-digit code" maxLength={6}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 tracking-widest text-center text-lg" />
                                        <button type="submit" disabled={loading}
                                            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 dark:shadow-none">
                                            {loading ? "Verifying..." : "Verify & Continue"}
                                        </button>
                                        <button type="button" onClick={() => { setOtpSent(false); setInfo(""); setError(""); }} className="w-full text-center text-xs text-indigo-600 hover:underline">
                                            ← Change phone number
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-6 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            By continuing, you agree to our{" "}
                            <Link href="/legal/terms" className="text-indigo-600 hover:underline">Terms</Link>
                            {" "}&amp;{" "}
                            <Link href="/legal/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
