import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Lumina — Safe XRP into Flare XRPFi",
    template: "%s · Lumina",
  },
  description:
    "Lumina is your copilot for putting XRP to work on Flare, safely. Explore strategies with honest risk labels, get a guided path, and see your positions clearly.",
  applicationName: "Lumina",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lumina" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7f3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
