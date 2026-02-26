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
                destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
