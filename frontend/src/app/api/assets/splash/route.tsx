import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
                    background: '#ffffff', // White background as per user's phone mockup
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
                    <svg
                        width="320" height="240" viewBox="0 0 160 120"
                        fill="none"
                    >
                        {/* Primary Navy Blue Fill */}
                        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#003366" />
                        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#003366" />
                        <rect x="115" y="35" width="20" height="8" rx="4" fill="#ffffff" />
                    </svg>
                    <span style={{ fontSize: 130, fontWeight: 900, color: '#003366', letterSpacing: '-0.05em', fontFamily: 'sans-serif' }}>
                        PayBills
                    </span>
                </div>
            </div>
        ),
        {
            width: 1284,
            height: 2778, // Exact iPhone Pro Max dimensions for perfectly crisp native splash screens
        }
    );
}
