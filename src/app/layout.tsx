import type { Metadata } from "next";
import {
  Geist_Mono,
  Zalando_Sans_Expanded,
  Zalando_Sans_SemiExpanded,
} from "next/font/google";
import "./globals.css";

const zalandoSans = Zalando_Sans_Expanded({
  display: "swap",
  variable: "--font-zalando-sans-expanded",
  weight: "variable",
  subsets: ["latin"],
});

const zalandoBody = Zalando_Sans_SemiExpanded({
  display: "swap",
  variable: "--font-zalando-sans-semiexpanded",
  weight: "variable",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modulate",
  description: "Create private podcast briefings from your work and social signals.",
  metadataBase: new URL("https://modulate.news"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${zalandoBody.variable} ${zalandoSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
