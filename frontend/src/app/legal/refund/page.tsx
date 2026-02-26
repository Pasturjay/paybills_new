import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RefundPolicy() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <Navbar />

            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8">Refund and Dispute Policy</h1>
                    <div className="prose prose-blue max-w-none text-gray-700">
                        <p className="mb-6"><strong>Last Updated:</strong> February 2026</p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">1. Overview</h2>
                        <p>
                            At Paybills, we are committed to providing seamless financial services. However, due to the nature of digital transactions and possible downtimes with third-party service providers (banks, Telcos, DisCos), transaction failures may occasionally occur. This policy outlines how refunds, chargebacks, and transaction disputes are handled on our platform, in accordance with the Central Bank of Nigeria (CBN) guidelines on consumer protection and electronic payments.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">2. Failed Transactions and Auto-Refunds</h2>
                        <p>
                            If a transaction (such as airtime, data, or bill payment) is initiated and your wallet or bank account is debited but the value is not delivered, our system will typically detect the failure and initiate an automatic reversal.
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li><strong>Wallet Debits:</strong> If paid via your Paybills wallet, auto-refunds are processed instantly or within 24 hours.</li>
                            <li><strong>Bank/Card Debits:</strong> Reversals to your debit card or bank account may take between 24 and 48 working hours, depending on the settlement gateways (e.g., NIBSS, Paystack, Interswitch) and your bank&apos;s policies.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">3. Electricity Token Delays</h2>
                        <p>
                            Electricity (DisCo) token generation is dependent on the availability of the distribution company&apos;s API. If a token generation is delayed, please wait up to 24 hours before escalating the issue. If the DisCo confirms the transaction failed, the amount debited will be fully refunded to your source account or Paybills wallet.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">4. Virtual Card Funding and Withdrawals</h2>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Funds loaded into your virtual dollar card can be withdrawn back to your Naira wallet at any time, subject to prevailing exchange rates and applicable fees.</li>
                            <li>Disputes regarding authorized transactions on your virtual card must be raised within 30 days of the transaction date. Chargebacks for virtual card transactions are governed by the respective card network (Visa/Mastercard) and can take between 45 to 120 days to resolve.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">5. Non-Refundable Transactions</h2>
                        <p>The following scenarios are strictly non-refundable:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Transactions sent to an incorrect phone number or meter number provided by the user.</li>
                            <li>Successful transactions where the service provider has confirmed value delivery.</li>
                            <li>Suspended accounts due to fraudulent activity or violation of our Terms of Service.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-8 mb-4">6. Dispute Resolution Process</h2>
                        <p>
                            If you experience a transaction failure and have not received an auto-refund within the stipulated time, please contact our support team. Provide your Transaction ID, amount, and date. We will investigate the issue with the relevant telecom partner or settlement bank.
                        </p>
                        <p>
                            If a dispute remains unresolved beyond standard CBN resolution timelines, you have the right to escalate the matter to the Consumer Protection Department of the CBN.
                        </p>

                        <p className="mt-8">
                            <strong>Contact for Issues:</strong> <a href="mailto:support@paybills.ng" className="text-blue-600 hover:underline">support@paybills.ng</a><br />
                            <strong>Office Address:</strong> 35 Aka itiam lane<br />
                            <strong>Social Channels:</strong> Instagram (@usepaybills), X/Twitter (@usepaybills), Facebook (@usepaybills)
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
