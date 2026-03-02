import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a',
                    borderRadius: '40px',
                }}
            >
                <svg
                    width="100" height="75" viewBox="0 0 160 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#6366f1" />
                    <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#6366f1" />
                    <rect x="115" y="35" width="20" height="8" rx="4" fill="#0f172a" />
                </svg>
            </div>
        ),
        { ...size }
    )
}
