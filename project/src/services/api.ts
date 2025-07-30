const API_BASE_URL = 'https://apify-runner.onrender.com/';

export class ApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };
  }

  async fetchActors() {
    const response = await fetch(`${API_BASE_URL}/actors`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch actors');
    }

    const data = await response.json();
    return data.data.items || [];
  }

  async fetchActorSchema(actorId: string) {
    const response = await fetch(`${API_BASE_URL}/actor-schema/${actorId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch actor schema');
    }

    return response.json();
  }

  async runActor(actorId: string, input: any) {
    const response = await fetch(`${API_BASE_URL}/run-actor`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ actorId, input }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to run actor');
    }

    return response.json();
  }

  async getRunStatus(runId: string) {
    const response = await fetch(`${API_BASE_URL}/run-status/${runId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get run status');
    }

    return response.json();
  }
}
