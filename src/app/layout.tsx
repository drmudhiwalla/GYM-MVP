import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScreeningProvider } from "@/lib/context";
import Providers from "@/components/Providers";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "DrMudhiwalla - Gym Health Screening",
  description: "Preventive health screening for gym members",
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#35AEF4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full">
        <Providers>
          <ScreeningProvider>
            <Logo />
            {children}
          </ScreeningProvider>
        </Providers>
      </body>
    </html>
  );
}
