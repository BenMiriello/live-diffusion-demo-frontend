import React, { useState, useEffect } from 'react';
import { DiffusionSettings } from '../services/api';

interface ControlPanelProps {
  initialSettings?: Partial<DiffusionSettings>;
  onSettingsChange?: (settings: Partial<DiffusionSettings>) => void;
  onApplySettings?: (settings: Partial<DiffusionSettings>) => void;
  disabled?: boolean;
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  initialSettings = {},
  onSettingsChange,
  onApplySettings,
  disabled = false,
  className = '',
}) => {
  // Default settings
  const defaultSettings: DiffusionSettings = {
    prompt: '',
    negativePrompt: '',
    steps: 20,
    guidance: 7.5,
    seed: -1,
    useRandomSeed: true,
  };

  // Combine default settings with initial settings
  const combinedSettings = { ...defaultSettings, ...initialSettings };
  
  // State for settings
  const [settings, setSettings] = useState<DiffusionSettings>(combinedSettings);
  const [expanded, setExpanded] = useState(false);

  // Update settings when props change
  useEffect(() => {
    setSettings(prevSettings => ({ ...prevSettings, ...initialSettings }));
  }, [initialSettings]);

  // Handle changes to settings
  const handleChange = (field: keyof DiffusionSettings, value: any) => {
    const updatedSettings = { ...settings, [field]: value };
    
    // Special case for seed/useRandomSeed relationship
    if (field === 'useRandomSeed' && value === true) {
      updatedSettings.seed = -1;
    }
    
    setSettings(updatedSettings);
    
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  // Handle apply button
  const handleApply = () => {
    if (onApplySettings) {
      onApplySettings(settings);
    }
  };

  // Toggle advanced settings panel
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`control-panel ${className} ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header">
        <h3>Diffusion Controls</h3>
        <button 
          onClick={toggleExpanded}
          className="toggle-button"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : 'Show'} Advanced Settings
        </button>
      </div>

      {expanded && (
        <div className="panel-content">
          <div className="control-group">
            <label htmlFor="steps-slider">Steps: {settings.steps}</label>
            <input
              id="steps-slider"
              type="range"
              min="1"
              max="50"
              value={settings.steps}
              onChange={(e) => handleChange('steps', parseInt(e.target.value, 10))}
              disabled={disabled}
              className="slider"
            />
          </div>

          <div className="control-group">
            <label htmlFor="guidance-slider">Guidance Scale: {settings.guidance.toFixed(1)}</label>
            <input
              id="guidance-slider"
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={settings.guidance}
              onChange={(e) => handleChange('guidance', parseFloat(e.target.value))}
              disabled={disabled}
              className="slider"
            />
          </div>

          <div className="control-group seed-control">
            <div className="seed-toggle">
              <label htmlFor="random-seed-toggle">
                <input
                  id="random-seed-toggle"
                  type="checkbox"
                  checked={settings.useRandomSeed}
                  onChange={(e) => handleChange('useRandomSeed', e.target.checked)}
                  disabled={disabled}
                />
                Use Random Seed
              </label>
            </div>

            {!settings.useRandomSeed && (
              <div className="seed-input">
                <label htmlFor="seed-value">Seed Value:</label>
                <input
                  id="seed-value"
                  type="number"
                  min="0"
                  max="2147483647"
                  value={settings.seed < 0 ? '' : settings.seed}
                  onChange={(e) => {
                    const value = e.target.value === '' ? -1 : parseInt(e.target.value, 10);
                    handleChange('seed', value);
                  }}
                  disabled={disabled || settings.useRandomSeed}
                  placeholder="Enter seed"
                />
              </div>
            )}
          </div>

          <div className="control-actions">
            <button
              onClick={handleApply}
              disabled={disabled}
              className="apply-button"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
