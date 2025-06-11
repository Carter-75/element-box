import 'bulma/css/bulma.min.css';
import './globals.css';
import type { Metadata } from 'next';
import HeaderAd from './components/ads/HeaderAd';
import PopupAd from './components/ads/PopupAd';

export const metadata: Metadata = {
  title: 'Falling Sand Simulation',
  description: 'A simple physics simulation game.',
  other: {
    'google-adsense-account': 'ca-pub-8347349621527130',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <HeaderAd />
        <main style={{ flex: 1, position: 'relative' }}>
          {children}
        </main>
        <PopupAd />
      </body>
    </html>
  );
}
