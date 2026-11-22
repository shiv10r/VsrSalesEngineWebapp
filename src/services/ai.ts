import { API_BASE_URL, ApiCore } from './http';

export function createAiApi(core: ApiCore) {
  const methods = {
    /** Returns what the server says about the AI assistant, or null when it cannot be reached. */
    async getAiStatus(): Promise<any> {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/status`, { headers: core.getHeaders() });
        if (res.ok) return await res.json();
      } catch {
        // unreachable
      }
      return null;
    },

    /** Asks the server to read a free-text prompt into form fields. Returns null when it cannot; never invents fields. */
    async parseAiFormPrompt(formType: string, prompt: string): Promise<any> {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/parse-form`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify({ formType, prompt }),
        });
        if (res.ok) return await res.json();
      } catch {
        // unreachable
      }
      return null;
    },
  };

  return methods;
}
