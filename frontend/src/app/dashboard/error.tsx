'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong!</h2>
            <p className="text-gray-500 mb-6 max-w-md">{error.message || 'An unexpected error occurred while loading this page.'}</p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
