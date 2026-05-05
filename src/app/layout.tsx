import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Folqen",
  description: "AI Creator Command Center for urban legends, mystery, and folklore content.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
