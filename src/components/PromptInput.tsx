import React, { useState, useEffect } from 'react';

interface PromptInputProps {
  initialPrompt?: string;
  initialNegativePrompt?: string;
  starterPrompt?: string;
  disabled?: boolean;
  onSubmit?: (prompt: string, negativePrompt: string) => void;
  onChange?: (prompt: string, negativePrompt: string) => void;
  className?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
  initialPrompt = '',
  initialNegativePrompt = '',
  starterPrompt = '',
  disabled = false,
  onSubmit,
  onChange,
  className = '',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || starterPrompt);
  const [negativePrompt, setNegativePrompt] = useState(initialNegativePrompt);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  
  // Update local state when props change
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    } else if (starterPrompt && !prompt) {
      setPrompt(starterPrompt);
    }
  }, [initialPrompt, starterPrompt, prompt]);
  
  useEffect(() => {
    setNegativePrompt(initialNegativePrompt);
  }, [initialNegativePrompt]);

  // Call onChange handler when either prompt changes
  useEffect(() => {
    if (onChange) {
      onChange(prompt, negativePrompt);
    }
  }, [prompt, negativePrompt, onChange]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleNegativePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNegativePrompt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(prompt, negativePrompt);
    }
  };

  const handleToggleNegativePrompt = () => {
    setShowNegativePrompt(!showNegativePrompt);
  };

  return (
    <div className={`prompt-input ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="prompt-container">
          <label htmlFor="prompt" className="prompt-label">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            disabled={disabled}
            placeholder="Enter your prompt here..."
            rows={2}
            className="prompt-textarea"
          />
        </div>

        <div className="negative-prompt-toggle">
          <button
            type="button"
            onClick={handleToggleNegativePrompt}
            className="toggle-button"
          >
            {showNegativePrompt ? 'Hide' : 'Show'} Negative Prompt
          </button>
        </div>

        {showNegativePrompt && (
          <div className="negative-prompt-container">
            <label htmlFor="negative-prompt" className="negative-prompt-label">
              Negative Prompt
            </label>
            <textarea
              id="negative-prompt"
              value={negativePrompt}
              onChange={handleNegativePromptChange}
              disabled={disabled}
              placeholder="Enter what you don't want to see..."
              rows={2}
              className="negative-prompt-textarea"
            />
          </div>
        )}

        <div className="prompt-actions">
          <button
            type="submit"
            disabled={disabled || !prompt.trim()}
            className="submit-button"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
