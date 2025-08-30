import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Duet - Dating App',
  description: 'Connect with compatible couples in your area. A modern dating app for meaningful relationships.',
  manifest: '/manifest.json',
  themeColor: '#FF6B6B',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Duet',
  },
  keywords: ['dating', 'couples', 'relationships', 'pwa', 'mobile'],
  authors: [{ name: 'Duet Team' }],
  generator: 'Next.js',
  category: 'dating',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FF6B6B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Duet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#FF6B6B" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Icons and Favicons */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
      </head>
      <body className="min-h-screen bg-background overflow-x-hidden">
        <div className="min-h-screen flex flex-col relative">
          <div className="flex-1 pb-safe">
            {children}
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}