import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HablaAI',
  description: 'Twój nowoczesny asystent AI do rozmów',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
