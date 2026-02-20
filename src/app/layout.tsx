import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal planner",
  description: "Lokální plánovač jídel s recepty, týdenním plánem a nákupem"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
