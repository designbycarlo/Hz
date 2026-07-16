import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hz Radio",
  description: "Hz Radio: a web radio app. Hz — the unit of frequency.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

const zoomLock = `
(function() {
  var d = document;
  // Prevent gesture zoom (iOS Safari)
  d.addEventListener('gesturestart', function(e) { e.preventDefault(); });
  d.addEventListener('gesturechange', function(e) { e.preventDefault(); });
  d.addEventListener('gestureend', function(e) { e.preventDefault(); });
  // Prevent multi-touch pinch zoom
  d.addEventListener('touchmove', function(e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  // Prevent Ctrl/Meta + scroll zoom (desktop)
  d.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); }
  }, { passive: false });
  // Prevent Ctrl/Meta + +/-/0 zoom (keyboard)
  d.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
      e.preventDefault();
    }
  });
})();
`;

const themeInit = `
(function() {
  try {
    var t = localStorage.getItem('color-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script dangerouslySetInnerHTML={{ __html: zoomLock }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
