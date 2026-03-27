import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | PayBills User Agreement",
    description: "Review the Terms of Service for using PayBills. Understand your rights and responsibilities when using our digital payment and virtual card services.",
    keywords: ["paybills terms and conditions", "user agreement fintech", "payment service terms", "virtual card terms nigeria"],
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
