"use client";

// Prevent Next.js from statically prerendering this page at build time.
// Firebase requires browser environment at runtime.
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    signInWithPopup,
    OAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Lock, Mail, Phone, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type AuthMode = "signin" | "signup";
type InputMode = "email" | "phone";
type AppView = "main" | "forgot-password";

export default function AuthPage() {
    const router = useRouter();
    const [authMode, setAuthMode] = useState<AuthMode>("signin");
    const [inputMode, setInputMode] = useState<InputMode>("email");
    const [view, setView] = useState<AppView>("main");

    // Email/Password state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Phone state
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const recaptchaContainerRef = useRef<HTMLDivElement>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    // Setup invisible reCAPTCHA for phone sign-in
    useEffect(() => {
        if (inputMode === "phone" && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                size: "invisible",
            });
        }
    }, [inputMode]);

    // Sync with backend after successful Firebase auth
    const syncWithBackend = async (idToken: string) => {
        try {
            const res = await fetch("/api/auth/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`
                },
            });

            if (res.ok) {
                const data = await res.json();
                // Store the platform-specific JWT token, not the Firebase ID token
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                return true;
            } else {
                const e = await res.json().catch(() => ({}));
                console.error("Backend sync failed:", e.error || "unknown error");
                setError(e.error || "Sync failed. Please contact support.");
                return false;
            }
        } catch (err) {
            console.error("Backend sync network error:", err);
            setError("Unable to connect to service. Please check your internet.");
            return false;
        }
    };

    const handlePostAuth = async (user: any) => {
        const idToken = await user.getIdToken();
        const success = await syncWithBackend(idToken);
        if (success) {
            router.push("/dashboard");
        } else {
            setLoading(false);
        }
    };

    // ── Google Sign-in ──────────────────────────────────────
    const handleGoogle = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handlePostAuth(result.user);
        } catch (err: any) {
            if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
                setError("Sign-in was cancelled.");
            } else {
                setError(err.message || "Google sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Apple Sign-in ───────────────────────────────────────
    const handleApple = async () => {
        setLoading(true);
        setError("");
        try {
            const provider = new OAuthProvider("apple.com");
            provider.addScope("email");
            provider.addScope("name");
            const result = await signInWithPopup(auth, provider);
            await handlePostAuth(result.user);
        } catch (err: any) {
            if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
                setError("Sign-in was cancelled.");
            } else {
                setError(err.message || "Apple sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Email / Password ────────────────────────────────────
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setInfo("");
        try {
            let result;
            if (authMode === "signin") {
                result = await signInWithEmailAndPassword(auth, email, password);
            } else {
                result = await createUserWithEmailAndPassword(auth, email, password);
            }
            await handlePostAuth(result.user);
        } catch (err: any) {
            const msg: Record<string, string> = {
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password.",
                "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
                "auth/weak-password": "Password must be at least 6 characters.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/invalid-credential": "Incorrect email or password. Please try again.",
                "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
                "auth/operation-not-allowed": "This sign-in method is currently disabled. Please contact the administrator.",
            };
            setError(msg[err.code] || err.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Phone / OTP ─────────────────────────────────────────
    const handleSendOtp = async () => {
        if (!phone) { setError("Please enter a phone number."); return; }
        setLoading(true);
        setError("");
        setInfo("");
        try {
            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, { size: "invisible" });
            }
            const confirm = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
            setConfirmResult(confirm);
            setOtpSent(true);
            setInfo(`Verification code sent to ${phone}`);
        } catch (err: any) {
            const msg: Record<string, string> = {
                "auth/invalid-phone-number": "Please include the country code, e.g. +2348012345678",
                "auth/too-many-requests": "Too many attempts. Please try again later.",
                "auth/quota-exceeded": "SMS quota exceeded. Try email sign-in instead.",
            };
            setError(msg[err.code] || err.message || "Failed to send OTP.");
            recaptchaVerifierRef.current?.clear();
            recaptchaVerifierRef.current = null;
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || !confirmResult) { setError("Enter the code you received."); return; }
        setLoading(true);
        setError("");
        try {
            const result = await confirmResult.confirm(otp);
            await handlePostAuth(result.user);
        } catch (err: any) {
            setError(err.code === "auth/invalid-verification-code"
                ? "Invalid code. Please check and try again."
                : err.message || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password ─────────────────────────────────────
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setError("Please enter your email address above."); return; }
        setLoading(true);
        setError("");
        setInfo("");
        try {
            await sendPasswordResetEmail(auth, email);
            setInfo(`Password reset email sent to ${email}. Check your inbox (and spam folder).`);
        } catch (err: any) {
            const msg: Record<string, string> = {
                "auth/user-not-found": "No account found with this email address.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/too-many-requests": "Too many requests. Please wait before trying again.",
            };
            setError(msg[err.code] || err.message || "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password View ────────────────────────────────
    if (view === "forgot-password") {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
                    <button onClick={() => { setView("main"); setError(""); setInfo(""); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Sign In
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-7 h-7 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                        <p className="text-gray-500 text-sm mt-2">Enter your email and we'll send you a reset link</p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {info && (
                        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{info}</span>
                        </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    // ── Main Auth View ──────────────────────────────────────
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome to Paybills</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {authMode === "signin" ? "Sign in to your account" : "Create your free account today"}
                        </p>
                    </div>

                    {/* Sign In / Create Account Toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => { setAuthMode("signin"); setError(""); setInfo(""); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setAuthMode("signup"); setError(""); setInfo(""); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === "signup" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500"}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Error / Info */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {info && !error && (
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3 mb-4 text-sm">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{info}</span>
                        </div>
                    )}

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={handleGoogle}
                            disabled={loading}
                            className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium text-gray-700"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                                <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" />
                                <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
                                <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={handleApple}
                            disabled={loading}
                            className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium text-gray-700"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-xs text-gray-400">or continue with</span>
                        </div>
                    </div>

                    {/* Email / Phone Toggle */}
                    <div className="flex gap-2 mb-5">
                        <button
                            onClick={() => { setInputMode("email"); setError(""); setInfo(""); setOtpSent(false); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${inputMode === "email" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                        >
                            <Mail className="w-4 h-4" /> Email
                        </button>
                        <button
                            onClick={() => { setInputMode("phone"); setError(""); setInfo(""); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${inputMode === "phone" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                        >
                            <Phone className="w-4 h-4" /> Phone
                        </button>
                    </div>

                    {/* Email Form */}
                    {inputMode === "email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={authMode === "signup" ? "Min. 6 characters" : "••••••••"}
                                        required
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {authMode === "signin" && (
                                    <button
                                        type="button"
                                        onClick={() => { setView("forgot-password"); setError(""); setInfo(""); }}
                                        className="text-xs text-indigo-600 hover:underline mt-1.5 block"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : authMode === "signin" ? "Sign In" : "Create Account"}
                            </button>
                        </form>
                    )}

                    {/* Phone Form */}
                    {inputMode === "phone" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+2348012345678"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">Include country code, e.g. +234 for Nigeria</p>
                            </div>

                            {!otpSent ? (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                                </button>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Code</label>
                                        <input
                                            type="number"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm tracking-widest font-mono"
                                        />
                                    </div>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={loading}
                                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                                    </button>
                                    <button
                                        onClick={() => { setOtpSent(false); setOtp(""); setConfirmResult(null); recaptchaVerifierRef.current?.clear(); recaptchaVerifierRef.current = null; }}
                                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        ← Change number
                                    </button>
                                </>
                            )}

                            {/* Invisible reCAPTCHA container */}
                            <div ref={recaptchaContainerRef} />
                        </div>
                    )}

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        By continuing you agree to our{" "}
                        <Link href="/legal/terms" className="text-indigo-600 hover:underline">Terms</Link>
                        {" & "}
                        <Link href="/legal/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
