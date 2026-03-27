import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refund Policy | Transaction Protection on PayBills",
    description: "Learn about our refund process and transaction protection policies. We ensure fair and transparent handling of failed or disputed digital payment transactions.",
    keywords: ["paybills refund policy", "failed transaction refund", "disputed payment nigeria", "refund process fintech"],
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
