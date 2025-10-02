# Element Box Physics Simulation - Iframe Embedding Guide

## Overview

The Element Box Physics Simulation now supports secure iframe embedding, allowing it to be showcased on portfolio websites while maintaining full interactive functionality. This implementation includes advanced physics simulation compatibility, security headers, and responsive design.

## Quick Start

### Basic Embedding

```html
<iframe 
  src="https://your-element-box-domain.com"
  width="800" 
  height="600"
  frameborder="0"
  allowfullscreen
  title="Element Box Physics Simulation">
</iframe>
```

### Responsive Embedding

```html
<div style="position: relative; width: 100%; padding-bottom: 75%; height: 0; overflow: hidden;">
  <iframe 
    src="https://your-element-box-domain.com"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allowfullscreen
    title="Element Box Physics Simulation">
  </iframe>
</div>
```

## Advanced Integration

### Portfolio Website Integration

For integration with carter-portfolio.fyi or similar portfolio sites:

```javascript
// Portfolio component example
function PhysicsSimulationEmbed() {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    const handleMessage = (event) => {
      // Validate origin for security
      if (event.origin === 'https://your-element-box-domain.com') {
        const { type, data } = event.data;
        
        switch (type) {
          case 'IFRAME_READY':
            console.log('Physics simulation loaded');
            break;
          case 'PHYSICS_ELEMENT_ADDED':
            console.log('Element added:', data.element);
            break;
          case 'PHYSICS_SIMULATION_RESET':
            console.log('Simulation reset');
            break;
          case 'PHYSICS_USER_INTERACTION':
            console.log('User interaction detected');
            break;
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  return (
    <iframe
      ref={iframeRef}
      src="https://your-element-box-domain.com"
      style={{ width: '100%', height: '600px' }}
      frameborder="0"
      title="Physics Simulation"
    />
  );
}
```

## Features in Iframe Mode

### Automatic Adjustments

When embedded as an iframe, the application automatically:

1. **Removes Advertisements**: All header and popup ads are hidden
2. **Optimizes Layout**: Uses full viewport dimensions for physics simulation
3. **Enhances Performance**: Applies GPU acceleration and performance optimizations
4. **Provides Communication**: Sends physics events to parent window
5. **Responsive Design**: Adapts to iframe container size

### Physics Simulation Features

- **Full Interactive Physics**: All particle types, elements, and interactions work normally
- **Touch/Mouse Support**: Complete input handling for desktop and mobile
- **Real-time Simulation**: 60fps physics simulation with collision detection
- **Element Palette**: All physics elements remain accessible
- **Performance Optimization**: Hardware acceleration and efficient rendering

## Security Features

### Content Security Policy (CSP)

The application includes strict CSP headers that:

- Allow embedding only from authorized domains (carter-portfolio.fyi)
- Prevent XSS attacks and unauthorized script execution
- Enable necessary physics simulation functionality
- Support cross-origin communication for portfolio integration

### Authorized Domains

The following domains are pre-approved for embedding:

- `https://carter-portfolio.fyi`
- `https://www.carter-portfolio.fyi`
- `https://preview.carter-portfolio.fyi`
- Local development: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:8080`

## Communication API

### Events Sent to Parent

The iframe sends the following events to the parent window:

```typescript
// Iframe is ready and loaded
{
  type: 'IFRAME_READY',
  source: 'element-box-physics',
  timestamp: number
}

// Physics element was added
{
  type: 'PHYSICS_ELEMENT_ADDED',
  element: string,
  source: 'element-box-physics'
}

// Simulation was reset
{
  type: 'PHYSICS_SIMULATION_RESET',
  source: 'element-box-physics'
}

// User interaction occurred
{
  type: 'PHYSICS_USER_INTERACTION',
  timestamp: number,
  source: 'element-box-physics'
}

// Iframe size changed
{
  type: 'IFRAME_SIZE_CHANGED',
  width: number,
  height: number,
  contentType: 'physics-simulation',
  source: 'element-box-physics'
}

// Visibility changed (tab switching, etc.)
{
  type: 'IFRAME_VISIBILITY_CHANGED',
  visible: boolean,
  source: 'element-box-physics'
}
```

### Commands from Parent

The iframe accepts these commands from the parent:

```typescript
// Request iframe to resize
{
  type: 'IFRAME_RESIZE',
  width?: number,
  height?: number
}

// Focus the iframe for interaction
{
  type: 'IFRAME_FOCUS'
}
```

## Styling and Customization

### CSS Classes Applied in Iframe Mode

- `.iframe-mode`: Applied to body element
- `.physics-simulation-frame`: Applied to main container
- `.physics-controls`: Positioned physics element controls
- Hide ads: `.header-ad`, `.popup-ad` display set to none

### Custom Styling

You can customize the iframe appearance from the parent:

```css
/* Parent page styles */
.physics-iframe {
  border: 2px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  background: #222;
}

.physics-iframe:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}
```

## Performance Considerations

### Optimization Features

1. **Hardware Acceleration**: CSS transforms use GPU acceleration
2. **Efficient Rendering**: Canvas operations optimized for iframe context
3. **Memory Management**: Automatic cleanup of physics particles
4. **Responsive Updates**: Dynamic sizing based on container changes

### Best Practices

1. **Container Sizing**: Provide adequate space (minimum 400x300px)
2. **Loading States**: Handle iframe loading with appropriate fallbacks
3. **Error Handling**: Implement message validation and error boundaries
4. **Performance Monitoring**: Listen for interaction events to gauge engagement

## Troubleshooting

### Common Issues

1. **Iframe Not Loading**
   - Check domain authorization in middleware
   - Verify CSP headers allow embedding
   - Ensure HTTPS for production domains

2. **Physics Not Responding**
   - Verify iframe has focus for mouse/touch events
   - Check browser console for JavaScript errors
   - Ensure adequate iframe dimensions

3. **Communication Issues**
   - Validate message origins in event handlers
   - Check for typos in event type strings
   - Verify parent domain is authorized

### Debug Mode

Add debug query parameter for additional logging:

```
https://your-element-box-domain.com?debug=true
```

This enables:
- Console logging of iframe events
- Physics performance metrics
- Communication status indicators

## Browser Support

### Fully Supported
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Support
- iOS Safari 13+
- Chrome Mobile 80+
- Samsung Internet 12+

### Required Features
- ES6 modules
- Canvas 2D context
- PostMessage API
- CSS transforms
- Intersection Observer

## Development Setup

### Local Testing

1. Start the Element Box application:
```bash
npm run dev
```

2. Test iframe embedding with a simple HTML file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Test</title>
</head>
<body>
    <iframe 
        src="http://localhost:3000"
        width="800" 
        height="600"
        frameborder="0">
    </iframe>
</body>
</html>
```

### Production Deployment

Ensure your deployment includes:

1. **Environment Variables**: Set authorized domains
2. **CSP Headers**: Configure security policies
3. **HTTPS**: Enable secure connections
4. **Compression**: Enable gzip for better performance

## License and Usage

This iframe embedding functionality is designed specifically for portfolio showcasing on carter-portfolio.fyi and authorized domains. For other embedding scenarios, please ensure compliance with the application's usage terms.

## Support

For technical issues with iframe embedding:

1. Check browser developer console for errors
2. Verify domain authorization
3. Test with minimal HTML implementation
4. Review security headers and CSP policies

The physics simulation maintains full functionality within iframe constraints while providing a secure, performant embedded experience suitable for portfolio showcasing.