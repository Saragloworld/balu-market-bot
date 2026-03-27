export const metadata = {
  title: "Balu — Market Intelligence Bot",
  description: "Real-time news sentiment alerts for XAUUSD, BTCUSD, EURUSD, USDJPY, AAPL, TSLA",
  manifest: "/manifest.json",
  themeColor: "#09090f",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: "#09090f" }}>{children}</body>
    </html>
  );
}