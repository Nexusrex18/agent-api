// app/page.tsx
import AgentForm from './components/AgentForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">
            AI Agent Creator
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Create conversational AI agents for Vapi or Retell using a unified interface
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <AgentForm />
        </div>
        
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Create AI voice agents with a standardized API</p>
        </div>
      </div>
    </div>
  );
}