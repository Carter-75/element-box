import React from 'react';
import dynamic from 'next/dynamic';

const PhysicsCanvas = dynamic(() => import('@/app/components/PhysicsCanvas'), {
  ssr: false,
  loading: () => <div style={{ width: '100vw', height: '100vh', backgroundColor: '#222' }} />
});

export default function Home() {
  return (
      <PhysicsCanvas />
  );
}
