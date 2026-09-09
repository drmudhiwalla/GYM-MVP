import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScreeningProvider } from "@/lib/context";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "DrMudhiwalla - Gym Health Screening",
  description: "Preventive health screening for gym members",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
            <a href="/" className="text-logo" style={{ textDecoration: 'none' }}>
              <div className="logo-title">DrMudhiwalla</div>
              <div className="logo-subtitle">HealthTech <span className="pvt-ltd">Pvt Ltd</span></div>
            </a>
            {children}
          </ScreeningProvider>
        </Providers>
      </body>
    </html>
  );
}
