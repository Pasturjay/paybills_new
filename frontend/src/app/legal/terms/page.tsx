import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <Navbar />

            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
                    <div className="prose prose-blue max-w-none text-gray-700">
                        <p className="mb-6"><strong>Last Updated:</strong> February 2026</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Paybills platform (website, mobile application, and related services), you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and Paybills. If you do not agree, please do not use our services.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">2. Eligibility and Registration</h2>
                        <p>
                            To use Paybills, you must be a resident of Nigeria or a jurisdiction where we operate, and at least 18 years of age. You agree to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Provide accurate, current, and complete information during registration.</li>
                            <li>Comply with Know Your Customer (KYC) requirements, including the provision of a valid Bank Verification Number (BVN) and National Identification Number (NIN) where applicable, as mandated by the Central Bank of Nigeria (CBN).</li>
                            <li>Maintain the security of your account credentials (passwords, PINs, and OTPs). Paybills will not be liable for losses resulting from shared or compromised credentials.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">3. Services Provided</h2>
                        <p>
                            Paybills provides a digital platform for making payments, including but not limited to purchasing airtime and data, paying electricity and cable TV bills, funding betting wallets, and generating virtual cards for online transactions. We act as an intermediary and integrate with third-party service providers (Telcos, DisCos, Banks, etc.).
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">4. Compliance and Prohibited Activities</h2>
                        <p>You agree to use the platform strictly for lawful purposes. Prohibited activities include, but are not limited to:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Money laundering, terrorism financing, or circumventing Nigerian financial regulations.</li>
                            <li>Fraudulent activities, chargeback fraud, or funding an account with stolen cards.</li>
                            <li>Interfering with the security or operation of the Paybills platform.</li>
                        </ul>
                        <p>We are obligated to report any suspicious activities to regulatory bodies such as the Nigerian Financial Intelligence Unit (NFIU) and the EFCC in accordance with Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT) laws.</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
                        <p>
                            While we strive for a 99.9% uptime, Paybills provides its services on an &quot;as is&quot; and &quot;as available&quot; basis. We shall not be liable for any indirect, incidental, or consequential damages resulting from network downtimes, third-party service provider failures (e.g., banking switch downtime), or your inability to use the platform.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">6. Governing Law and Dispute Resolution</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the Laws of the Federal Republic of Nigeria. Any disputes arising out of or in connection with these Terms shall first be attempted to be resolved amicably through our customer support. If unresolved within 30 days, it shall be settled by binding arbitration in Nigeria under the Arbitration and Mediation Act 2023.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">7. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account without prior notice if we suspect a violation of these Terms, involvement in fraudulent activities, or as directed by an order from a competent Nigerian court or regulatory authority.
                        </p>

                        <p className="mt-8">
                            <strong>Contact:</strong> For inquiries about these terms, please contact <a href="mailto:support@paybills.ng" className="text-blue-600 hover:underline">support@paybills.ng</a> or reach us at 35 Aka itiam lane. Connect with us on social media @usepaybills.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
