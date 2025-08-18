import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { NeoBrutalismProvider } from "./components/ui/neobrutalism-provider";
import { LanguageProvider } from "./lib/language-context";
import { DebugProvider } from "./lib/debug-context";
import { GesturePrevention } from "./components/ui/gesture-prevention";
import { DebugButton } from "./components/ui/debug-button";
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

const notoSansTamilBold = localFont({
  src: '../public/fonts/NotoSansTamil-Bold.ttf',
  variable: '--font-noto-tamil-bold',
  display: 'swap',
  preload: true,
});

const notoSansTamilMedium = localFont({
  src: '../public/fonts/NotoSansTamil-Medium.ttf',
  variable: '--font-noto-tamil-medium',
  display: 'swap',
  preload: true,
});

const notoSansSCBold = localFont({
  src: '../public/fonts/NotoSansSC-Bold.ttf',
  variable: '--font-noto-sc-bold',
  display: 'swap',
  preload: true,
});

const notoSansSCMedium = localFont({
  src: '../public/fonts/NotoSansSC-Medium.ttf',
  variable: '--font-noto-sc-medium',
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
        className={`${circularStdMedium.variable} ${circularStdBold.variable} ${notoSansTamilBold.variable} ${notoSansTamilMedium.variable} ${notoSansSCBold.variable} ${notoSansSCMedium.variable} antialiased`}
      >
        <DebugProvider>
          <NeoBrutalismProvider>
            <LanguageProvider>
              <GesturePrevention />
              <div className="app-container">
                <div className="app-content">
                  {children}
                </div>
              </div>
              <DebugButton />
            </LanguageProvider>
          </NeoBrutalismProvider>
        </DebugProvider>
        <Analytics />
      </body>
    </html>
  );
}
