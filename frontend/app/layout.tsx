import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sahayak — Voice-to-Form Engine",
  description:
    "An AI-powered voice assistant that helps low-literacy farmers and rural families fill out complex agricultural subsidy and microfinance forms using natural spoken conversation.",
  keywords: ["voice form", "agri subsidy", "microfinance", "accessibility", "Vapi AI"],
  openGraph: {
    title: "Sahayak — Voice-to-Form Engine",
    description: "Speak naturally. Let Sahayak fill the form for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950">{children}</body>
    </html>
  );
}
