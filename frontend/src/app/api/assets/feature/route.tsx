import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Generates a 1024x500 image, which is the required dimension for the Google Play Store Feature Graphic
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
                    background: '#003366', // Primary Navy Blue
                }}
            >
                <div style={{ position: 'absolute', top: -300, right: -200, width: 800, height: 800, background: '#6366f1', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -100, left: -200, width: 500, height: 500, background: '#ffffff', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', zIndex: 10 }}>
                    <svg
                        width="200" height="150" viewBox="0 0 160 120"
                        fill="none"
                    >
                        {/* Reversed White Fill */}
                        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#ffffff" />
                        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#ffffff" />
                        <rect x="115" y="35" width="20" height="8" rx="4" fill="#003366" />
                    </svg>
                    <span style={{ fontSize: 140, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.05em', fontFamily: 'sans-serif' }}>
                        PayBills
                    </span>
                </div>
                <p style={{ fontSize: 40, color: '#94a3b8', marginTop: 40, fontWeight: 500, letterSpacing: '0.05em', zIndex: 10 }}>
                    Secure. Instant. Zero Fees.
                </p>
            </div>
        ),
        {
            width: 1024,
            height: 500,
        }
    );
}
