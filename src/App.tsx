import { useState, useEffect } from 'react';
import './App.css';
import CameraView from './components/CameraView';
import MainView from './components/MainView';
import ConnectionStatus from './components/ConnectionStatus';
import PromptInput from './components/PromptInput';
import ControlPanel from './components/ControlPanel';
import { useWebSocket, ConnectionStatus as WSStatus } from './services/websocket';
import { apiService, DiffusionSettings } from './services/api';

function App() {
  // State for images
  const [sourceImage, setSourceImage] = useState<ImageData | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for connection
  const [connectionStatus, setConnectionStatus] = useState<WSStatus>(WSStatus.DISCONNECTED);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // State for settings
  const [settings, setSettings] = useState<DiffusionSettings>({
    prompt: '',
    negativePrompt: '',
    steps: 20,
    guidance: 7.5,
    seed: -1,
    useRandomSeed: true,
  });
  
  // State for UI
  const [showControls, setShowControls] = useState(false);
  const [starterPrompt, setStarterPrompt] = useState('');
  
  // Initialize WebSocket connection
  const { 
    status, 
    error, 
    connect, 
    disconnect, 
    sendFrame, 
    isConnected,
    sendMessage
  } = useWebSocket();
  
  // Sync WebSocket status with local state
  useEffect(() => {
    setConnectionStatus(status);
    setConnectionError(error);
  }, [status, error]);
  
  // Handle frame from camera
  const handleFrame = (imageData: ImageData) => {
    setSourceImage(imageData);
    
    // Only send frames if connected
    if (isConnected() && !isProcessing) {
      setIsProcessing(true);
      sendFrame(imageData);
      
      // Simulate processing for demo purposes
      // In real implementation, the processed image would come back via WebSocket
      setTimeout(() => {
        // Create a fake processed image (just a canvas with the original image)
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(imageData, 0, 0);
          
          // Add some text to simulate processing
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Processed Image (Demo)', canvas.width / 2, canvas.height / 2);
          
          setProcessedImage(canvas.toDataURL());
          setIsProcessing(false);
        }
      }, 500);
    }
  };
  
  // Handle prompt submission
  const handlePromptSubmit = (prompt: string, negativePrompt: string) => {
    const updatedSettings = {
      ...settings,
      prompt,
      negativePrompt,
    };
    
    setSettings(updatedSettings);
    setShowControls(false);
    
    // In a real implementation, send settings to backend
    console.log('Submitting prompt:', updatedSettings);
  };
  
  // Handle settings changes
  const handleSettingsChange = (newSettings: Partial<DiffusionSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Handle apply settings
  const handleApplySettings = (newSettings: Partial<DiffusionSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setShowControls(false);
    
    // In a real implementation, send settings to backend
    console.log('Applying settings:', newSettings);
  };
  
  // Connect/disconnect from WebSocket
  const toggleConnection = () => {
    if (isConnected()) {
      disconnect();
    } else {
      connect();
    }
  };
  
  // Toggle controls panel
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>LD</h1>
        </div>
        
        <div className="header-center">
          {connectionError && (
            <ConnectionStatus 
              status={connectionStatus}
              error={connectionError}
            />
          )}
        </div>
        
        <div className="header-right">
          <div className="mini-camera">
            <CameraView
              onFrame={sourceImage ? undefined : handleFrame}
              frameRate={6}
              active={true}
              width={120}
              height={90}
            />
          </div>
        </div>
      </header>
      
      <div className="controls-bar">
        <div className="controls-preview">
          <span className="prompt-preview">
            {settings.prompt ? settings.prompt : "Enter a prompt..."}
          </span>
          <button 
            className="toggle-controls-button"
            onClick={toggleControls}
            aria-expanded={showControls}
          >
            <span className="toggle-icon">{showControls ? '▲' : '▼'}</span>
            Options
          </button>
        </div>
        
        {showControls && (
          <div className="controls-panel">
            <PromptInput
              initialPrompt={settings.prompt}
              initialNegativePrompt={settings.negativePrompt}
              starterPrompt={starterPrompt}
              disabled={!isConnected() || isProcessing}
              onSubmit={handlePromptSubmit}
            />
            
            <ControlPanel
              initialSettings={settings}
              onSettingsChange={handleSettingsChange}
              onApplySettings={handleApplySettings}
              disabled={!isConnected() || isProcessing}
            />
            
            <div className="connection-controls">
              <button 
                onClick={toggleConnection}
                className={isConnected() ? 'disconnect-button' : 'connect-button'}
              >
                {isConnected() ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <main className="app-main">
        <MainView
          sourceImage={sourceImage}
          processedImage={processedImage}
          isProcessing={isProcessing}
        />
      </main>
    </div>
  );
}

export default App;
