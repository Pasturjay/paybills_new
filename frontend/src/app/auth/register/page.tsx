"use client";

import Link from "next/link";

// Register page redirects to the unified login/register flow on login page
// since Firebase OAuth handles both sign-up and sign-in in the same step.
export default function RegisterPage() {
    return (
        <meta httpEquiv="refresh" content="0; url=/auth/login" />
    );
}
