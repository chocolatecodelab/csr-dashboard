import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | CSR Dashboard",
    default: "Authentication | CSR Dashboard",
  },
};

// Layout untuk halaman authentication (NO sidebar, NO header)
export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-1 dark:bg-dark-2">
      {children}
    </div>
  );
}
