import 'bulma/css/bulma.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { IframeProvider } from '@/lib/iframe-context';
import IframeWrapper from '@/components/IframeWrapper';
import HeaderAd from './components/ads/HeaderAd';
import PopupAd from './components/ads/PopupAd';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Element Box - Physics Simulation',
  description: 'An advanced physics simulation with a wide variety of elements to choose from.',
  keywords: 'physics simulation, falling sand, particle physics, interactive simulation',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

// Client component to handle iframe detection
function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <IframeProvider>
      <IframeWrapper>
        <LayoutInner>{children}</LayoutInner>
      </IframeWrapper>
    </IframeProvider>
  );
}

// Server component to check if in iframe context
function LayoutInner({ children }: { children: React.ReactNode }) {
  // Check for iframe-specific headers or referrer
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  const userAgent = headersList.get('user-agent') || '';
  
  // Basic server-side iframe detection (will be enhanced client-side)
  const possibleIframe = referer.includes('carter-portfolio.fyi') || 
                        referer.includes('localhost:3000') ||
                        referer.includes('localhost:3001');

  return (
    <html lang="en">
      <body className={possibleIframe ? 'iframe-mode' : ''}>
        {/* Conditionally render ads - hidden via CSS in iframe mode but better to not render at all */}
        {!possibleIframe && <HeaderAd />}
        
        <main 
          style={{ 
            flex: 1, 
            position: 'relative',
            width: possibleIframe ? '100vw' : 'auto',
            height: possibleIframe ? '100vh' : 'auto',
            overflow: possibleIframe ? 'hidden' : 'auto'
          }}
        >
          {children}
        </main>
        
        {/* Conditionally render popup ads */}
        {!possibleIframe && <PopupAd />}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LayoutContent>{children}</LayoutContent>;
}
