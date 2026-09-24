import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Grupo Eliade | 15 Anos de Celebração & Concerto de Gala",
  description: "Adquira seu ingresso para a celebração de 15 anos do Grupo Musical Eliade. Pagamento via PIX instantâneo e emissão com QR Code individual.",
  keywords: ["Grupo Eliade", "15 Anos", "Concerto", "Música", "Ingressos", "PIX"],
  manifest: "/manifest.json",
  openGraph: {
    title: "Grupo Eliade | 15 Anos de Celebração",
    description: "Garanta seu ingresso por R$ 10 para nossa noite de gala comemorativa.",
    images: ["/images/hero-banner.jpg"]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#07080c"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
