import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Brightloop Subscription Management System",
  description: "Ledger-style subscription management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-paper text-ink selection:bg-selected">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

