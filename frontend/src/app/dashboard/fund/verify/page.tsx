
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!reference) {
            setStatus('error');
            setMessage('No transaction reference found.');
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await api.get(`/wallet/fund/verify?reference=${reference}`);
                setStatus('success');
                setMessage(`Successfully funded wallet with ₦${res.amount.toLocaleString()}`);

                // Redirect to dashboard after a delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } catch (err: any) {
                console.error('Verification Error:', err);
                setStatus('error');
                setMessage(err.response?.data?.error || 'Payment verification failed.');
            }
        };

        verifyPayment();
    }, [reference, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
                    <p className="text-gray-600">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2 text-green-700">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Dashboard
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2 text-red-700">Verification Failed</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function FundVerifyPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <VerifyContent />
        </Suspense>
    );
}
