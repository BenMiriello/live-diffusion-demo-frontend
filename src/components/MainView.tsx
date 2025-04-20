import React, { useState, useRef, useEffect } from 'react';

interface MainViewProps {
  sourceImage?: ImageData | string | null;
  processedImage?: ImageData | string | null;
  isProcessing?: boolean;
  className?: string;
}

const MainView: React.FC<MainViewProps> = ({
  sourceImage = null,
  processedImage = null,
  isProcessing = false,
  className = '',
}) => {
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Draw processed image to canvas
  useEffect(() => {
    if (!processedImage) return;
    
    const canvas = processedCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Cannot get canvas context');
      return;
    }

    try {
      if (typeof processedImage === 'string') {
        // Handle URL string
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.onerror = () => setError('Failed to load processed image');
        img.src = processedImage;
      } else if (processedImage instanceof ImageData) {
        // Handle ImageData object
        canvas.width = processedImage.width;
        canvas.height = processedImage.height;
        ctx.putImageData(processedImage, 0, 0);
      }
    } catch (err) {
      setError(`Error drawing processed image: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error drawing processed image:', err);
    }
  }, [processedImage]);

  return (
    <div className={`main-view ${className}`}>
      {error && <div className="error-message">{error}</div>}
      
      <div className="view-container">
        {/* Processed view */}
        <div className="processed-view">
          <canvas
            ref={processedCanvasRef}
            className="processed-canvas"
          />
          {isProcessing && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <p>Processing...</p>
            </div>
          )}
          {!processedImage && !isProcessing && (
            <div className="placeholder">
              <p>No processed image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainView;
