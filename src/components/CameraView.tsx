import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onFrame?: (imageData: ImageData) => void;
  frameRate?: number;
  width?: number;
  height?: number;
  mirrored?: boolean;
  active?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  onFrame,
  frameRate = 24,
  width = 640,
  height = 480,
  mirrored = true,
  active = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and start the webcam
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser doesn't support getUserMedia");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      setIsStreamActive(false);
      setError(`Camera access error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error accessing camera:', err);
    }
  };

  // Start or stop webcam and frame capture based on 'active' prop
  useEffect(() => {
    let frameInterval: number | null = null;
    
    // Start capturing frames at specified frameRate
    const startFrameCapture = () => {
      if (!onFrame) return null;

      const interval = 1000 / frameRate;
      return window.setInterval(() => {
        captureFrame();
      }, interval);
    };

    if (active && !isStreamActive) {
      startCamera();
    }
    
    if (isStreamActive && onFrame) {
      frameInterval = startFrameCapture();
    }

    // Cleanup function to stop everything when component unmounts or 'active' changes
    return () => {
      if (frameInterval !== null) {
        window.clearInterval(frameInterval);
      }
      
      // Stop the stream only if we're deactivating
      if (!active && isStreamActive && videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsStreamActive(false);
      }
    };
  }, [active, frameRate, onFrame, isStreamActive]);

  // Capture a frame from the video feed
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !onFrame || !isStreamActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image if specified
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // If mirrored, reset the transform
    if (mirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Get the image data and pass it to the onFrame callback
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    onFrame(imageData);
  };

  // Handle click on camera area when inactive
  const handleCameraClick = () => {
    if (!isStreamActive) {
      startCamera();
    }
  };

  return (
    <div className="camera-view" onClick={handleCameraClick}>
      {error && <div className="camera-error">{error}</div>}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`camera-video ${mirrored ? 'mirrored' : ''} ${!isStreamActive ? 'hidden' : ''}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Hidden canvas for frame capturing */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
        width={width} 
        height={height} 
      />
      
      {!isStreamActive && !error && (
        <div className="camera-placeholder">
          <p>Click to activate camera</p>
        </div>
      )}
    </div>
  );
};

export default CameraView;
