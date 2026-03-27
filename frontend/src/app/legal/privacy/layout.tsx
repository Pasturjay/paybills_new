import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Your Data Security is Our Priority",
    description: "Read the PayBills Privacy Policy to understand how we collect, use, and protect your personal information in compliance with NDPA and NDPR regulations in Nigeria.",
    keywords: ["paybills privacy policy", "ndpa compliance nigeria", "data protection fintech", "financial data security", "privacy laws nigeria"],
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
