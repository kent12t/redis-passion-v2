import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { NeoBrutalismProvider } from "./components/ui/neobrutalism-provider";

const circularStdBold = localFont({
  src: '../public/fonts/CircularStd-Bold.otf',
  variable: '--font-circular-bold',
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
        className={`${circularStdBold.variable} antialiased`}
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
