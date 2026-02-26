export const metadata = {
    title: 'PayBills',
    description: 'Fintech Super App',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
