
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Key } from 'lucide-react';
import { api } from '@/lib/api';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your purchase...');
    const [licenseKeys, setLicenseKeys] = useState<any[]>([]);

    useEffect(() => {
        if (!reference) {
            setStatus('error');
            setMessage('No transaction reference found.');
            return;
        }

        const verifyPurchase = async () => {
            try {
                const res = await api.get(`/products/software/verify?reference=${reference}`);
                setStatus('success');
                setMessage(res.message || 'Software purchase successful!');
                setLicenseKeys(res.data?.items || []);
            } catch (err: any) {
                console.error('Software Verification Error:', err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Software purchase verification failed.');
            }
        };

        verifyPurchase();
    }, [reference]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 max-w-2xl mx-auto">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Delivering Your Software</h1>
                    <p className="text-gray-600">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold mb-2 text-green-700">Purchase Successful!</h1>
                    <p className="text-gray-600 mb-8">{message}</p>

                    <div className="w-full space-y-4 mb-8">
                        {licenseKeys.map((item, idx) => (
                            <div key={idx} className="bg-white border border-green-100 rounded-xl p-4 shadow-sm flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold text-gray-800">{item.softwareName}</span>
                                </div>
                                <div className="w-full bg-gray-50 p-3 rounded font-mono text-sm break-all select-all flex justify-between items-center border border-gray-100">
                                    <span className="text-blue-700">{item.licenseKey}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(item.licenseKey)}
                                        className="text-xs text-blue-600 hover:underline px-2"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/dashboard/history')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        View Purchase History
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
                            Retry Verification
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

export default function SoftwareVerifyPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <VerifyContent />
        </Suspense>
    );
}
