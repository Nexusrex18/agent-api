// app/components/ResponseDisplay.tsx
"use client";

import React from 'react';
import { CreateAgentResponse } from '../lib/types';

interface ResponseDisplayProps {
  response: CreateAgentResponse | null;
  error: string | null;
  isLoading: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  error,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Creating agent...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 border border-red-200 rounded-md bg-red-50">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div className="mt-8 p-4 border border-green-200 rounded-md bg-green-50">
      <h3 className="text-lg font-medium text-green-800">Agent Created Successfully!</h3>
      <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Agent ID:</span> {response.agent_id}
        </p>
        {response.agent_name && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Name:</span> {response.agent_name}
          </p>
        )}
        <p className="text-sm text-gray-700">
          <span className="font-medium">Voice:</span> {response.voice}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Language:</span> {response.language}
        </p>
      </div>
    </div>
  );
};

export default ResponseDisplay;