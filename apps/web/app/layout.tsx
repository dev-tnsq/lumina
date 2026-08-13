import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AgentLauncher } from "@/components/AgentLauncher";

export const metadata: Metadata = {
  title: {
    default: "Lumina — Your copilot for XRP on Flare",
    template: "%s · Lumina",
  },
  description:
    "Lumina is an AI copilot that helps XRP holders enter Flare XRPFi safely: honest risk labels, guided deposits, and live on-chain positions — nothing invented.",
  applicationName: "Lumina",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070b12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <AgentLauncher />
        </Providers>
      </body>
    </html>
  );
}
