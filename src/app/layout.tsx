
import type { Metadata } from "next";
import localFont from "next/font/local";
import LayoutContent from "./Components/LayoutContent";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "IntranetItsall4u",
  description: "Intranet para Itsall4u",};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutContent>
        {children}
        </LayoutContent>
      </body>
    </html>
  );
}
