'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useIframe } from '@/lib/iframe-context';

const PhysicsCanvas = dynamic(() => import('@/app/components/PhysicsCanvas'), {
  ssr: false,
  loading: () => <div style={{ width: '100vw', height: '100vh', backgroundColor: '#222' }} />
});

// Wrapper component to use hooks
function PhysicsCanvasWrapper() {
  const { isInIframe } = useIframe();

  // Note: The PhysicsCanvas component can access iframe context through useIframe hook
  // if it needs iframe-specific behavior in the future

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
      data-physics-container="true"
      data-embedded={isInIframe}
    >
      <PhysicsCanvas />
    </div>
  );
}

export default function Home() {
  return <PhysicsCanvasWrapper />;
}
