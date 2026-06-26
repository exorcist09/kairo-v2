import type { Metadata } from "next";
import { Radio_Canada } from "next/font/google";
import "./globals.css";

const radioCanada = Radio_Canada({
  variable: "--font-radio-canada",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kairo",
  description: "Visual Workflow and Job scheduler",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${radioCanada.variable} ${radioCanada.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
