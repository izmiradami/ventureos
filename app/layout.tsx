import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuroraBackground } from "@/components/shared/aurora-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: "VentureOS — Launch a startup with one prompt",
  description:
    "VentureOS is an autonomous AI venture studio. It discovers opportunities, builds companies, and prepares them for revenue.",
  keywords: ["AI", "startup", "venture studio", "autonomous agent", "Stripe"],
  openGraph: {
    title: "VentureOS — Launch a startup with one prompt",
    description:
      "Autonomous AI venture studio: discover opportunities, build companies, prepare for revenue.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} min-h-screen`}
      >
        <AuroraBackground />
        {children}
      </body>
    </html>
  );
}
