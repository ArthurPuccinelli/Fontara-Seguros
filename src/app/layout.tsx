import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fontara Seguradora | Seguro Auto, Vida e Empresarial",
  description:
    "Proteção completa para você e sua empresa. Cotação grátis em 2 minutos. Seguro Auto, Vida e Empresarial com aprovação imediata. Regulada pela SUSEP.",
  keywords: "seguro auto, seguro de vida, seguro empresarial, seguradora digital, cotação seguro",
  openGraph: {
    title: "Fontara Seguradora",
    description: "Proteção completa para auto, vida e empresas. Cotação em 2 minutos.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
