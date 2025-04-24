// app/components/PlatformSelector.tsx
"use client";

import React from 'react';
import { PLATFORM_OPTIONS } from '../lib/types';

interface PlatformSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Platform
      </label>
      <div className="flex space-x-4">
        {PLATFORM_OPTIONS.map((platform) => (
          <label key={platform.id} className="inline-flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600"
              value={platform.id}
              checked={value === platform.id}
              onChange={() => onChange(platform.id)}
            />
            <span className="ml-2">{platform.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PlatformSelector;