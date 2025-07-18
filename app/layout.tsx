import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { NeoBrutalismProvider } from "./components/ui/neobrutalism-provider";
import { Analytics } from "@vercel/analytics/next";

const circularStdMedium = localFont({
  src: '../public/fonts/circular-std-medium-500.ttf',
  variable: '--font-circular-medium',
  display: 'swap',
  preload: true,
});

const circularStdBold = localFont({
  src: '../public/fonts/CircularStd-Bold.ttf',
  variable: '--font-circular-bold',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Ideal Pursuits",
  description: "Personalized recommendations for your unique interests and passions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${circularStdMedium.variable} ${circularStdBold.variable} antialiased`}
      >
        <NeoBrutalismProvider>
          <div className="app-container">
            <div className="app-content">
              {children}
            </div>
          </div>
        </NeoBrutalismProvider>
        <Analytics />
      </body>
    </html>
  );
}
