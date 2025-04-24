// app/components/AgentForm.tsx
"use client";

import React, { useState } from 'react';
import { CreateAgentRequest, CreateAgentResponse, LANGUAGE_OPTIONS } from '../lib/types';
import { createAgent } from '../lib/api';
import PlatformSelector from './PlatformSelector';
import VoiceSelector from './VoiceSelector';
import AdvancedOptionsPanel from './AdvancedOptionsPanel';
import ResponseDisplay from './ResponseDisplay';

const AgentForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CreateAgentResponse | null>(null);
  
  const [formData, setFormData] = useState<CreateAgentRequest>({
    platform: 'vapi',
    voice: 'emma',
    language: 'en',
    agent_name: '',
    prompt: '',
    voicemail_message: '',
    retell_llm_config: {},
  });

  const handleChange = (field: keyof CreateAgentRequest, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRetellConfigChange = (config: Record<string, any>) => {
    setFormData({ ...formData, retell_llm_config: config });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Remove retell_llm_config if platform is vapi
      const requestData = { ...formData };
      if (requestData.platform === 'vapi') {
        delete requestData.retell_llm_config;
      }

      const result = await createAgent(requestData);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PlatformSelector
          value={formData.platform}
          onChange={(value) => handleChange('platform', value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name
            </label>
            <input
              type="text"
              id="agent_name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.agent_name || ''}
              onChange={(e) => handleChange('agent_name', e.target.value)}
              placeholder="My AI Agent"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <VoiceSelector
          value={formData.voice}
          onChange={(value) => handleChange('voice', value)}
        />

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Agent Prompt
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.prompt || ''}
            onChange={(e) => handleChange('prompt', e.target.value)}
            placeholder="You are a helpful assistant..."
          ></textarea>
        </div>

        <div>
          <label htmlFor="voicemail_message" className="block text-sm font-medium text-gray-700 mb-1">
            Voicemail Message
          </label>
          <textarea
            id="voicemail_message"
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.voicemail_message || ''}
            onChange={(e) => handleChange('voicemail_message', e.target.value)}
            placeholder="I'm not available right now. Please leave a message..."
          ></textarea>
        </div>

        <AdvancedOptionsPanel
          platform={formData.platform}
          retellLlmConfig={formData.retell_llm_config || {}}
          onConfigChange={handleRetellConfigChange}
        />

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              onClick={() => {
                setFormData({
                  platform: 'vapi',
                  voice: 'emma',
                  language: 'en',
                  agent_name: '',
                  prompt: '',
                  voicemail_message: ''
                });
                setResponse(null);
                setError(null);
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </div>
      </form>

      <ResponseDisplay
        response={response}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AgentForm;