import type { ReactNode } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { CartSheet } from '@/components/cart/cart-sheet'

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSheet />
    </div>
  )
}
