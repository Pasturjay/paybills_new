import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <Navbar />

            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <div className="prose prose-blue max-w-none text-gray-700">
                        <p className="mb-6"><strong>Last Updated:</strong> February 2026</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Paybills (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your privacy and ensuring that your personal data is handled in compliance with the Nigeria Data Protection Act (NDPA) 2023, the Nigeria Data Protection Regulation (NDPR), and other applicable data protection laws in Nigeria. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website, mobile application, and related services (the &quot;Platform&quot;).
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>
                        <p>We collect information to provide, improve, and secure our services, as well as to comply with regulatory requirements (such as the Central Bank of Nigeria&apos;s KYC/AML directives). The types of information we collect include:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li><strong>Personal Identifiable Information (PII):</strong> Full name, email address, phone number, date of birth, residential address, Bank Verification Number (BVN), and National Identification Number (NIN).</li>
                            <li><strong>Financial Information:</strong> Bank account details, debit/credit card information, transaction history, and wallet balances.</li>
                            <li><strong>Device &amp; Technical Data:</strong> IP address, device type, operating system, browser type, and location data.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
                        <p>Your personal data is used for the following purposes:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>To create and manage your Paybills account.</li>
                            <li>To process bill payments, airtime/data top-ups, virtual card issuance, and fund transfers.</li>
                            <li>To verify your identity and comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations stipulated by the CBN.</li>
                            <li>To detect, prevent, and mitigate fraud and other illegal activities.</li>
                            <li>To communicate with you regarding transaction updates, promotional offers, and service changes.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">4. Sharing and Disclosure</h2>
                        <p>We do not sell your personal data. We may share your information with:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li><strong>Service Providers:</strong> Payment gateways, identity verification services (NIMC, NIBSS), and cloud hosting providers.</li>
                            <li><strong>Regulatory Authorities:</strong> The Central Bank of Nigeria (CBN), the Economic and Financial Crimes Commission (EFCC), and the Nigeria Data Protection Commission (NDPC) when required by law.</li>
                            <li><strong>Affiliates and Partners:</strong> Trusted business partners who work with us strictly under confidentiality agreements.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h2>
                        <p>
                            We employ bank-grade security measures, including end-to-end encryption, regular vulnerability assessments, and strict access controls, to safeguard your information against unauthorized access, alteration, or disclosure. However, no internet-based platform can guarantee 100% security.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights</h2>
                        <p>Under the NDPA, you have the right to:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Request access to the personal data we hold about you.</li>
                            <li>Request the correction of inaccurate or incomplete data.</li>
                            <li>Request the deletion of your data, subject to CBN&apos;s data retention policies for financial institutions (usually a minimum of 5 years).</li>
                            <li>Object to or restrict the processing of your data.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
                        <p>
                            If you have questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact our Data Protection Officer at:
                            <br /><br />
                            <strong>Email:</strong> <a href="mailto:privacy@paybills.ng" className="text-blue-600 hover:underline">privacy@paybills.ng</a><br />
                            <strong>Address:</strong> 35 Aka itiam lane<br />
                            <strong>Social Media:</strong> @usepaybills (Instagram, X/Twitter, Facebook)
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
