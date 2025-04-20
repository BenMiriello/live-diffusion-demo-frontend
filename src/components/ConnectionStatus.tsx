import React from 'react';
import { ConnectionStatus as Status } from '../services/websocket';

interface ConnectionStatusProps {
  status: Status;
  error?: string | null;
  serverInfo?: {
    version?: string;
    uptime?: number;
    model?: string;
  };
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error = null,
  serverInfo = {},
  className = '',
}) => {
  const getStatusText = () => {
    switch (status) {
      case Status.CONNECTED:
        return 'Connected';
      case Status.CONNECTING:
        return 'Connecting...';
      case Status.DISCONNECTED:
        return 'Disconnected';
      case Status.ERROR:
        return 'Connection Error';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case Status.CONNECTED:
        return 'connected';
      case Status.CONNECTING:
        return 'connecting';
      case Status.DISCONNECTED:
        return 'disconnected';
      case Status.ERROR:
        return 'error';
      default:
        return 'unknown';
    }
  };

  // Format uptime as hours:minutes:seconds
  const formatUptime = (uptimeSeconds?: number): string => {
    if (uptimeSeconds === undefined) return '--:--:--';
    
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className={`connection-status ${getStatusClass()} ${className}`}>
      <div className="status-indicator">
        <span className={`status-dot ${getStatusClass()}`}></span>
        <span className="status-text">{getStatusText()}</span>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {status === Status.CONNECTED && serverInfo && (
        <div className="server-info">
          {serverInfo.version && (
            <div className="server-version">
              <span className="label">Version:</span>
              <span className="value">{serverInfo.version}</span>
            </div>
          )}
          
          {serverInfo.uptime !== undefined && (
            <div className="server-uptime">
              <span className="label">Uptime:</span>
              <span className="value">{formatUptime(serverInfo.uptime)}</span>
            </div>
          )}
          
          {serverInfo.model && (
            <div className="server-model">
              <span className="label">Model:</span>
              <span className="value">{serverInfo.model}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
