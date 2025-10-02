import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Get the origin from the request
  const origin = request.headers.get('origin');
  
  // Define allowed iframe parents for carter-portfolio.fyi
  const allowedOrigins = [
    'https://carter-portfolio.fyi',
    'https://www.carter-portfolio.fyi',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://preview.carter-portfolio.fyi',
    // Add any staging/development domains as needed
  ];

  // Security headers for iframe embedding
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Physics simulations may need eval
    "style-src 'self' 'unsafe-inline'", // Bulma and custom styles
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${allowedOrigins.join(' ')} 'self'`, // Allow embedding in portfolio
  ].join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', cspDirectives);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Fallback for older browsers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers for iframe communication
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};