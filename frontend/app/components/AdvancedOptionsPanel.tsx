// app/components/AdvancedOptionsPanel.tsx
"use client";

import React, { useState } from 'react';

interface AdvancedOptionsPanelProps {
  platform: string;
  retellLlmConfig: Record<string, any>;
  onConfigChange: (config: Record<string, any>) => void;
}

const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = ({
  platform,
  retellLlmConfig,
  onConfigChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [configJson, setConfigJson] = useState(
    JSON.stringify(retellLlmConfig || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState('');

  const handleConfigChange = (value: string) => {
    setConfigJson(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError('');
      onConfigChange(parsed);
    } catch (e) {
      setJsonError('Invalid JSON format');
    }
  };

  if (platform !== 'retell') {
    return null;
  }

  return (
    <div className="mb-4 border border-gray-200 rounded-md p-4">
      <button
        type="button"
        className="flex justify-between w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">Advanced Retell LLM Configuration</span>
        <span>{isOpen ? '▼' : '►'}</span>
      </button>

      {isOpen && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Provide custom LLM configuration for Retell in JSON format:
          </p>
          <textarea
            className={`mt-1 block w-full border ${
              jsonError ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm p-2 h-32 font-mono text-sm`}
            value={configJson}
            onChange={(e) => handleConfigChange(e.target.value)}
          />
          {jsonError && (
            <p className="mt-1 text-sm text-red-600">{jsonError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedOptionsPanel;