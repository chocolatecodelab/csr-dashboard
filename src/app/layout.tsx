import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { AlertProvider } from "@/providers/alert-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | CSR Dashboard - Corporate Social Responsibility Management",
    default: "CSR Dashboard - Corporate Social Responsibility Management",
  },
  description:
    "Comprehensive CSR dashboard for managing Corporate Social Responsibility programs, stakeholders, budgets, and impact tracking.",
};

// Root layout hanya provide global styles, providers, dan NextTopLoader
// Sidebar & Header akan di-render di (dashboard)/layout.tsx
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AlertProvider>
            <NextTopLoader color="#5750F1" showSpinner={false} />
            {children}
          </AlertProvider>
        </Providers>
      </body>
    </html>
  );
}
