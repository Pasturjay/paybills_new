import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Frequently Asked Questions (FAQ) | PayBills Support",
    description: "Find answers to common questions about bill payments, airtime top-ups, virtual cards, and wallet funding on PayBills Nigeria.",
    keywords: ["paybills faq", "how to buy airtime nigeria", "pay electricity bill help", "virtual card support", "paybills refund process"],
};

export default function FAQ() {
    const faqs = [
        {
            q: "How do I fund my wallet?",
            a: "You can fund your wallet via Paystack or Flutterwave using your debit card or bank transfer. Just click on 'Fund Wallet' in your dashboard."
        },
        {
            q: "Are transactions instant?",
            a: "Yes! Airtime, data, and bill payments are processed instantly. You will receive your value within seconds of a successful transaction."
        },
        {
            q: "Is PayBills secure?",
            a: "Absolutely. We use bank-grade encryption and secure payment gateways (Paystack/Flutterwave) to ensure your data and funds are protected."
        },
        {
            q: "Can I get a refund for a failed transaction?",
            a: "Yes. If a transaction fails but your wallet was debited, our system automatically initiates a reversal. If you have any issues, contact support."
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
                    <div className="space-y-8">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-gray-100 pb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
