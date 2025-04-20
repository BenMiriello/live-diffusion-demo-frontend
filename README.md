# Live Diffusion Demo - Frontend

This directory contains the web frontend for the Live Diffusion Demo, providing a responsive mobile-first interface that works on both mobile devices and desktop browsers.

## Development Setup

### HTTPS Setup for Mobile Camera Access

Mobile browsers require HTTPS to access device cameras. To set up HTTPS for local development:

1. Install mkcert:
   ```bash
   brew install mkcert
   mkcert -install
    ```
2. Generate certificates for your development environment:
    ```bash
    mkdir -p .cert
    mkcert -key-file .cert/key.pem -cert-file .cert/cert.pem localhost 127.0.0.1 ::1 your-tailscale-hostname "*.your-tailscale-domain"
    ```
3. The Vite configuration is already set up to use these certificates.
4. When accessing the app from other devices on your network or tailnet, you may need to accept the security warning since the certificate is only trusted on your development machine.

## Development Notes

- The frontend requires HTTPS for mobile camera access. See the [frontend README](./frontend/README.md) for setup instructions.
For cleaning up the certificates we don't need:
    ```bash
    # Remove the copied Tailscale certificates from earlier attempts
    rm -rf ~/Documents/certs

    # The original Tailscale certificates at /Library/Tailscale/certs/ will remain untouched
    # The mkcert-generated certificates in the frontend/.cert directory should be kept
    ```

## Technology Stack

- React 18+
- Vite for build tooling
- WebSockets for real-time communication
- Tailwind CSS for styling
- Media Capture and Streams API for webcam access

## Features

- Real-time webcam input processing
- Low-latency image generation (<1 second)
- Adjustable denoising strength
- Text prompt control with starter suggestions
- Mobile-first design with desktop compatibility
- Simple connection status and controls

## Development Roadmap

### Project Setup

- [ ] Initialize Vite project with React
- [ ] Set up ESLint and Prettier
- [ ] Configure Tailwind CSS
- [ ] Add responsive viewport configuration
- [ ] Create basic project structure

### Core Components

- [ ] Create App component with mobile-first layout
- [ ] Implement CameraView component for webcam preview
- [ ] Develop MainView component for generated image display
- [ ] Create ControlPanel component with start/stop button
- [ ] Implement ConnectionStatus indicator
- [ ] Build PromptInput component with text area
- [ ] Add DenoisingSlider component
- [ ] Create StarterPrompt library and randomization system

### WebSocket Integration

- [ ] Create WebSocket connection manager
- [ ] Implement frame capture from webcam
- [ ] Add frame sending logic with rate limiting
- [ ] Handle incoming processed frames
- [ ] Manage connection status and reconnection
- [ ] Implement error handling

### User Interface

- [ ] Design mobile-first layout with camera in top right
- [ ] Create main view that fills most of the screen
- [ ] Implement touch-friendly controls
- [ ] Add loading indicators
- [ ] Design prompt input area at bottom of screen
- [ ] Create status indicators and notifications

### Mobile Optimization

- [ ] Test and optimize for various mobile browsers
- [ ] Handle device orientation changes
- [ ] Implement responsive controls for different screen sizes
- [ ] Optimize camera access for mobile devices
- [ ] Ensure touch-friendly interactions

### Performance Optimization

- [ ] Implement efficient frame encoding
- [ ] Add adaptive quality based on connection
- [ ] Optimize render performance
- [ ] Add frame rate control
- [ ] Implement lazy loading where applicable

### User Experience Enhancements

- [ ] Add visual feedback for processing state
- [ ] Implement error notifications
- [ ] Create helpful tooltips and instructions
- [ ] Add keyboard shortcuts for desktop
- [ ] Create animation transitions

### Testing and Finalization

- [ ] Test across multiple browsers
- [ ] Verify mobile compatibility
- [ ] Test with different camera resolutions
- [ ] Fix cross-browser compatibility issues
- [ ] Add final polish and styling

## Requirements

- Node.js 16+
- Modern web browser with WebRTC support

## Usage

Instructions for running the frontend will be added here once development progresses.

## Development

Instructions for development setup and contributing will be added here.
