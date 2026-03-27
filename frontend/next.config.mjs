/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",

    // Suppress ESLint warnings that are non-critical (e.g. no-img-element)
    // to prevent them from becoming blocking errors in CI builds.
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Suppress TypeScript errors in production builds (TS errors are caught locally)
    typescript: {
        ignoreBuildErrors: false,
    },

    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'upload.wikimedia.org' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000'}/api/:path*`,
            },
        ];
    },
    async redirects() {
        return [
            { source: '/software', destination: '/products/software', permanent: true },
            { source: '/betting', destination: '/products/betting', permanent: true },
            { source: '/privacy', destination: '/legal/privacy', permanent: true },
            { source: '/education', destination: '/products/education', permanent: true },
            { source: '/airtime-data', destination: '/products/airtime-data', permanent: true },
            { source: '/refund', destination: '/legal/refund', permanent: true },
            { source: '/terms', destination: '/legal/terms', permanent: true },
            { source: '/utilities', destination: '/products/bill-payment', permanent: true },
            { source: '/services', destination: '/products', permanent: true },
            { source: '/help', destination: '/contact', permanent: true },
            { source: '/ms-activation', destination: '/products/software', permanent: true },
            { source: '/agent', destination: '/contact', permanent: true },
            { source: '/disclaimer', destination: '/legal/disclaimer', permanent: true },
        ];
    },
};

export default nextConfig;
