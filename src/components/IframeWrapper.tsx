'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useIframe } from '@/lib/iframe-context';

interface IframeWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function IframeWrapper({ children, className = '' }: IframeWrapperProps) {
  const { isInIframe, sendMessageToParent } = useIframe();
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (!isInIframe) return;

    // Handle window resize in iframe
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setDimensions({ width: newWidth, height: newHeight });
      
      // Notify parent of size changes for physics simulation area
      sendMessageToParent({
        type: 'IFRAME_SIZE_CHANGED',
        width: newWidth,
        height: newHeight,
        contentType: 'physics-simulation',
      });
    };

    // Handle visibility changes for performance optimization
    const handleVisibilityChange = () => {
      sendMessageToParent({
        type: 'IFRAME_VISIBILITY_CHANGED',
        visible: !document.hidden,
      });
    };

    // Handle physics-specific events
    const handleBeforeUnload = () => {
      sendMessageToParent({
        type: 'IFRAME_BEFORE_UNLOAD',
      });
    };

    // Listen for interactions to optimize physics performance
    const handleInteraction = () => {
      sendMessageToParent({
        type: 'PHYSICS_USER_INTERACTION',
        timestamp: Date.now(),
      });
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Physics simulation interaction events
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    // Initial size report
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isInIframe, sendMessageToParent]);

  // Iframe-specific styles for physics simulation
  const iframeStyles: React.CSSProperties = isInIframe ? {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    // Ensure physics canvas gets full space
    display: 'flex',
    flexDirection: 'column',
    // Remove any margins/padding that could interfere with simulation
    margin: 0,
    padding: 0,
    // Optimize for performance in iframe
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    // Ensure proper z-index for physics elements
    zIndex: 1,
  } : {};

  // Additional classes for iframe mode
  const iframeClasses = isInIframe 
    ? 'iframe-mode physics-simulation-frame' 
    : '';

  return (
    <div 
      className={`iframe-wrapper ${iframeClasses} ${className}`}
      style={iframeStyles}
      data-iframe={isInIframe}
      data-physics-container="true"
    >
      {children}
    </div>
  );
}