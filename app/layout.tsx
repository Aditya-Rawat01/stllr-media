import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STLLR Media — Photography & Videography",
  description:
    "STLLR Media is a creative studio specialising in photography, videography and creative production.",
  icons: {
    icon: [
      { url: "/icon.jpg", type: "image/jpeg" },
      { url: "/references/stllr_media_logo.jpg", type: "image/jpeg" },
    ],
    apple: "/references/stllr_media_logo.jpg",
    shortcut: "/references/stllr_media_logo.jpg",
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} min-h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#080808] text-[#f0ede8]">
        
        <ClerkProvider>
          {children}
        </ClerkProvider>
      
      </body>
    </html>
  );
}