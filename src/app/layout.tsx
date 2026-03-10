import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivilERP | Destylus Construction",
  description: "Enterprise Resource Planning for Construction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
