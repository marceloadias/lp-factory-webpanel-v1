import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Factory",
  description: "LP Factory - Painel administrativo para Factory Engine",
};

import { ThemeSync } from "@/components/theme-sync";
import { HealthPoller } from "@/components/health-poller";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          themes={["light", "dark", "custom"]}
        >
          <ThemeSync />
          <HealthPoller />
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
