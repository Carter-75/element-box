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
  const { isInIframe, onPhysicsEvent, onElementAdded, onSimulationReset } = useIframe();

  // Pass iframe context to PhysicsCanvas if needed
  const canvasProps = {
    isEmbedded: isInIframe,
    onElementAdded,
    onSimulationReset,
    onPhysicsEvent,
  };

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
      <PhysicsCanvas {...canvasProps} />
    </div>
  );
}

export default function Home() {
  return <PhysicsCanvasWrapper />;
}
