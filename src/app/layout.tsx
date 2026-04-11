import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Noto_Serif } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { hasAdSenseConfig } from "@/lib/adsense";
import { Analytics } from '@vercel/analytics/next';

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "JobAccess",
    template: "%s | JobAccess"
  },
  description: "All Jobs. One Platform",
  openGraph: {
    title: "JobAccess",
    description: "All Jobs. One Platform",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "JobAccess",
    description: "All Jobs. One Platform"
  },
  icons: {
    icon: "/jobaccess-icon.png",
    shortcut: "/jobaccess-icon.png",
    apple: "/jobaccess-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${bodyFont.variable} font-[var(--font-body)]`}>
        <ThemeProvider>
          {hasAdSenseConfig() ? (
            <Script
              id="adsense-script"
              async
              strategy="afterInteractive"
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            />
          ) : null}
          <Header />
          <main className="container mt-8">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
