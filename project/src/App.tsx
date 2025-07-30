import React, { useState, useEffect } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import ActorSelector from './components/ActorSelector';
import DynamicForm from './components/DynamicForm';
import ResultDisplay from './components/ResultDisplay';
import { ApiService } from './services/api';
import { Actor, ActorSchema, ActorRun } from './types/apify';
import { RefreshCw, LogOut } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [actorSchema, setActorSchema] = useState<ActorSchema | null>(null);
  const [result, setResult] = useState<ActorRun | null>(null);
  
  const [isLoadingActors, setIsLoadingActors] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeySubmit = async (key: string) => {
    setIsLoadingActors(true);
    setError(null);
    
    try {
      const service = new ApiService(key);
      const actorList = await service.fetchActors();
      
      setApiKey(key);
      setApiService(service);
      setActors(actorList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate API key');
    } finally {
      setIsLoadingActors(false);
    }
  };

  const handleActorSelect = async (actor: Actor) => {
    if (!apiService) return;
    
    setSelectedActor(actor);
    setActorSchema(null);
    setResult(null);
    setIsLoadingSchema(true);
    setError(null);

    try {
      const schema = await apiService.fetchActorSchema(actor.id);
      setActorSchema(schema);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load actor schema');
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleRunActor = async (input: any) => {
    if (!apiService || !selectedActor) return;

    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const runResult = await apiService.runActor(selectedActor.id, input);
      setResult(runResult);

      // If the run is still in progress, poll for updates
      if (runResult.status === 'RUNNING' || runResult.status === 'READY') {
        pollRunStatus(runResult.runId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run actor');
    } finally {
      setIsRunning(false);
    }
  };

  const pollRunStatus = async (runId: string) => {
    if (!apiService) return;

    const poll = async () => {
      try {
        const status = await apiService.getRunStatus(runId);
        setResult(status);

        if (status.status === 'RUNNING' || status.status === 'READY') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get run status');
      }
    };

    poll();
  };

  const handleLogout = () => {
    setApiKey(null);
    setApiService(null);
    setActors([]);
    setSelectedActor(null);
    setActorSchema(null);
    setResult(null);
    setError(null);
  };

  if (!apiKey) {
    return (
      <ApiKeyInput
        onApiKeySubmit={handleApiKeySubmit}
        isLoading={isLoadingActors}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Apify Integration</h1>
                <p className="text-gray-600 mt-1">Manage and execute your Apify actors</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            )}

            <ActorSelector
              actors={actors}
              selectedActor={selectedActor}
              onActorSelect={handleActorSelect}
              isLoading={isLoadingActors}
            />

            {isLoadingSchema && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-3" />
                <span className="text-gray-600">Loading actor schema...</span>
              </div>
            )}

            {actorSchema && selectedActor && (
              <DynamicForm
                schema={actorSchema}
                onSubmit={handleRunActor}
                isRunning={isRunning}
              />
            )}

            {result && <ResultDisplay result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;