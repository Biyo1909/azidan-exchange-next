import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AZIDAN EXCHANGE — Rocket Speed Exchange",
  description:
    "Trade Bitcoin, Ethereum, USDT and gift cards for Naira at live rates. Fast, transparent, and built for Nigeria.",
  keywords: ["crypto to naira", "gift card to naira", "AZIDAN EXCHANGE", "Bitcoin Nigeria"],
  openGraph: {
    title: "AZIDAN EXCHANGE — Rocket Speed Exchange",
    description: "Sell crypto and gift cards for Naira at live rates.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('azidan-theme')||'light';document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
