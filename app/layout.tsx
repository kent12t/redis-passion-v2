import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { NeoBrutalismProvider } from "./components/ui/neobrutalism-provider";

const overusedGrotesk = localFont({
  src: './fonts/OverusedGroteskRoman-VF.ttf',
  variable: '--font-overused-grotesk',
  display: 'swap',
});

const futuraBold = localFont({
  src: './fonts/FuturaBold.otf',
  variable: '--font-futura-bold',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Rediscover Your Passion",
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
        className={`${overusedGrotesk.variable} ${futuraBold.variable} antialiased`}
      >
        <NeoBrutalismProvider>
          <div className="app-container">
            <div className="app-content">
              {children}
            </div>
          </div>
        </NeoBrutalismProvider>
      </body>
    </html>
  );
}
