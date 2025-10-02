'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface IframeContextType {
  isInIframe: boolean;
  parentOrigin: string | null;
  sendMessageToParent: (message: any) => void;
  // Physics simulation specific events
  onElementAdded?: (element: string) => void;
  onSimulationReset?: () => void;
  onPhysicsEvent?: (event: string, data?: any) => void;
}

const IframeContext = createContext<IframeContextType | null>(null);

interface IframeProviderProps {
  children: ReactNode;
}

export function IframeProvider({ children }: IframeProviderProps) {
  const [isInIframe, setIsInIframe] = useState(false);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're running in an iframe
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    if (inIframe) {
      // Listen for messages from parent
      const handleMessage = (event: MessageEvent) => {
        // Validate origin for security
        const allowedOrigins = [
          'https://carter-portfolio.fyi',
          'https://www.carter-portfolio.fyi',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:8080',
          'https://preview.carter-portfolio.fyi',
        ];

        if (allowedOrigins.includes(event.origin)) {
          setParentOrigin(event.origin);
          
          // Handle specific iframe commands
          if (event.data?.type === 'IFRAME_RESIZE') {
            // Handle resize requests from parent
            sendMessageToParent({
              type: 'RESIZE_RESPONSE',
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }
          
          if (event.data?.type === 'IFRAME_FOCUS') {
            // Handle focus events for physics simulation
            window.focus();
          }
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Notify parent that iframe is ready
      window.parent.postMessage({
        type: 'IFRAME_READY',
        source: 'element-box-physics',
        timestamp: Date.now(),
      }, '*');

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  const sendMessageToParent = (message: any) => {
    if (isInIframe && window.parent) {
      const allowedOrigins = [
        'https://carter-portfolio.fyi',
        'https://www.carter-portfolio.fyi',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'https://preview.carter-portfolio.fyi',
      ];

      // Send to all allowed origins or use detected parent origin
      const targetOrigin = parentOrigin || '*';
      
      window.parent.postMessage({
        source: 'element-box-physics',
        timestamp: Date.now(),
        ...message,
      }, targetOrigin);
    }
  };

  // Physics simulation specific event handlers
  const onElementAdded = (element: string) => {
    sendMessageToParent({
      type: 'PHYSICS_ELEMENT_ADDED',
      element,
    });
  };

  const onSimulationReset = () => {
    sendMessageToParent({
      type: 'PHYSICS_SIMULATION_RESET',
    });
  };

  const onPhysicsEvent = (event: string, data?: any) => {
    sendMessageToParent({
      type: 'PHYSICS_EVENT',
      event,
      data,
    });
  };

  const contextValue: IframeContextType = {
    isInIframe,
    parentOrigin,
    sendMessageToParent,
    onElementAdded,
    onSimulationReset,
    onPhysicsEvent,
  };

  return (
    <IframeContext.Provider value={contextValue}>
      {children}
    </IframeContext.Provider>
  );
}

export function useIframe(): IframeContextType {
  const context = useContext(IframeContext);
  if (!context) {
    throw new Error('useIframe must be used within an IframeProvider');
  }
  return context;
}

// Hook to check if currently in iframe
export function useIsInIframe(): boolean {
  const context = useContext(IframeContext);
  return context?.isInIframe ?? false;
}