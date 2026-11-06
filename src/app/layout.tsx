import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DB Capital Smart Financial Platform | Credit, Loans, Wallets & Cards",
  description:
    "Your Money. Your Credit. Your Growth. Unified digital financial platform with prepaid wallets, standing order loan repayments, and Flutterwave virtual/physical smart cards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
