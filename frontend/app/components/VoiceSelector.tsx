// app/components/VoiceSelector.tsx
"use client";

import React from 'react';
import { VOICE_OPTIONS } from '../lib/types';

interface VoiceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
        Voice
      </label>
      <select
        id="voice"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select a voice</option>
        {VOICE_OPTIONS.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;