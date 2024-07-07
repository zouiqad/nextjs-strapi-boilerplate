import { ThemeProvider } from '@/utils/theme-provider'
import type { Metadata } from 'next'

import Header from '@/app/shared/header'
import Footer from '@/app/shared/footer'

import { inter } from '@/app/fonts'

import '@/app/globals.css'
import { cn } from '@/utils/class-names'

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          'bg-background text-foreground flex min-h-screen flex-col justify-between',
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
