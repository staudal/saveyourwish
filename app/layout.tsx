import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://saveyourwish.com"),
  title: {
    default: "SaveYourWish - Create and Share Wishlists",
    template: "%s | SaveYourWish",
  },
  description:
    "Create, share, and manage wishlists for birthdays, holidays, and special occasions. Avoid duplicate gifts and make gift-giving a delightful experience.",
  keywords: [
    "wishlist",
    "gift registry",
    "gift list",
    "birthday wishlist",
    "wedding registry",
    "gift management",
  ],
  authors: [{ name: "Jakob Staudal" }],
  creator: "Jakob Staudal",
  publisher: "SaveYourWish",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://saveyourwish.com",
    siteName: "SaveYourWish",
    title: "SaveYourWish - Create and Share Wishlists",
    description:
      "Create, share, and manage wishlists for birthdays, holidays, and special occasions.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SaveYourWish Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaveYourWish - Create and Share Wishlists",
    description:
      "Create, share, and manage wishlists for birthdays, holidays, and special occasions.",
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={`antialiased ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div data-vaul-drawer-wrapper="" className="min-h-dvh bg-background">
            {children}
          </div>
        </ThemeProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
