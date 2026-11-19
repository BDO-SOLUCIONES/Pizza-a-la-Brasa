import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import '@fontsource-variable/playfair-display'
import './globals.css'

import { CartProvider } from '@/components/cart/cart-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Pizza a la Brasa',
  description:
    'Pizza a la Brasa: pizzas artesanales horneadas a la leña. Pide a domicilio o recoge en tienda. Menú, promociones y más.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1410',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors />
        </CartProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}