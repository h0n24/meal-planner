import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal planner",
  description: "Meal planner ready for Vercel + Vercel Postgres"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
