// app/lib/api.ts
import { CreateAgentRequest, CreateAgentResponse } from './types';

// Function to create an agent
export async function createAgent(
  requestData: CreateAgentRequest
): Promise<CreateAgentResponse> {
  try {
    const response = await fetch('/api/create-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create agent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
}