import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fontara Seguros — Protegendo o que importa para você',
  description:
    'Soluções completas em seguros para pessoas e empresas. Vida, auto, saúde, residencial e muito mais com a proteção que você merece.',
  keywords: 'seguros, seguro de vida, seguro auto, seguro residencial, seguro empresarial, fontara',
  openGraph: {
    title: 'Fontara Seguros',
    description: 'Soluções completas em seguros para pessoas e empresas.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  )
}
