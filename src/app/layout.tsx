import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ForgeOS — Construction Management',
  description:
    'One connected workspace to manage projects, coordinate teams and keep every construction milestone moving forward.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
