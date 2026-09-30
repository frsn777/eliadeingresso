import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Culto Musical de Gratidão - 15 anos do Grupo Eliade",
  description: "Culto Musical de Gratidão em celebração aos 15 anos do Grupo Eliade. 7 de Novembro, 18h, no Auditório do Centro de Educação Profissional de Música Walkíria Lima. Garanta seu ingresso por R$ 10 via PIX.",
  keywords: ["Grupo Eliade", "15 Anos", "Culto Musical de Gratidão", "Walkíria Lima", "Ingressos", "PIX"],
  manifest: "/manifest.json",
  openGraph: {
    title: "Culto Musical de Gratidão - 15 anos do Grupo Eliade",
    description: "7 de Novembro às 18h no Auditório do Walkíria Lima. Adquira seu ingresso oficial por R$ 10.",
    images: ["/images/eliade-foto1.jpeg"]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#060b1a"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
