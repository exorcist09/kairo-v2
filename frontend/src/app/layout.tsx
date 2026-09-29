import type { Metadata } from "next";
import { Radio_Canada } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const radioCanada = Radio_Canada({
  variable: "--font-radio-canada",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kairo",
  description: "Visual Workflow and Job scheduler",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M 44.5 11.2 Q 50 8 55.5 11.2 L 82.5 26.8 Q 88 30 88 36 L 88 64 Q 88 70 82.5 73.2 L 55.5 88.8 Q 50 92 44.5 88.8 L 17.5 73.2 Q 12 70 12 64 L 12 36 Q 12 30 17.5 26.8 Z M 51.8 32.3 Q 56 30 60.2 32.4 L 82.5 45.0 Q 86 47 81.5 49.5 L 48.2 67.7 Q 44 70 39.8 67.6 L 17.5 55.0 Q 14 53 18.5 50.5 Z' fill='%232563eb'/></svg>",
        type: "image/svg+xml",
      },
    ],
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
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
