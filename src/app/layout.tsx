import type { Metadata } from "next";
import "./globals.css";
import { NavigationFeedback } from "@/components/app/navigation-feedback";

export const metadata: Metadata = {
  title: "Folqen",
  description: "AI Creator Command Center for urban legends, mystery, and folklore content.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <NavigationFeedback />
        {children}
      </body>
    </html>
  );
}
