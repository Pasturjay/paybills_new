'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
                    <p className="text-gray-600 mb-6">{error.message}</p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                        Reload Application
                    </button>
                </div>
            </body>
        </html>
    );
}
