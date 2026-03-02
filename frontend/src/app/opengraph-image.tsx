import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PayBills - Seamless Utility Payments';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a0a14',
                }}
            >
                {/* Background Accent */}
                <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: '#6366f1', filter: 'blur(150px)', opacity: 0.3, borderRadius: '50%' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <svg
                        width="140" height="105" viewBox="0 0 160 120"
                        fill="none"
                    >
                        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#6366f1" />
                        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#6366f1" />
                        <rect x="115" y="35" width="20" height="8" rx="4" fill="#0a0a14" />
                    </svg>
                    <span style={{ fontSize: 100, fontWeight: 900, color: 'white', letterSpacing: '-0.05em', fontFamily: 'sans-serif' }}>
                        Pay<span style={{ color: '#6366f1' }}>Bills</span>
                    </span>
                </div>
                <p style={{ fontSize: 32, color: '#94a3b8', marginTop: 40, fontWeight: 600, letterSpacing: '0.05em' }}>
                    Instant Airtime, Data & Virtual Cards
                </p>
            </div>
        ),
        { ...size }
    );
}
