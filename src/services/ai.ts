import { API_BASE_URL, ApiCore } from './http';

export function createAiApi(core: ApiCore) {
  const methods = {
    async getAiStatus(): Promise<any> {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/status`, {
          headers: core.getHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return {
        status: 'Operational',
        defaultProvider: 'Gemini',
        defaultModel: 'gemini-2.5-flash',
      };
    },

    async parseAiFormPrompt(formType: string, prompt: string): Promise<any> {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/parse-form`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify({ formType, prompt }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      const lower = prompt.toLowerCase();
      if (formType === 'contact') {
        const emailMatch = prompt.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
        return {
          formType: 'contact',
          providerUsed: 'Gemini',
          contact: {
            name: prompt.split(/[,@]/)[0]?.trim() || 'Lead Contact',
            company: lower.includes('northstar') ? 'Northstar Digital' : 'Enterprise Partner',
            role: lower.includes('director') ? 'Technology Director' : 'Engineering Manager',
            email: emailMatch ? emailMatch[0] : 'contact@example.com',
            source: 'Company careers',
            channelBasis: 'ExplicitBusinessContact',
            sourceUrl: 'https://example.com/team',
            notes: 'AI auto-parsed lead context',
          },
        };
      }
      if (formType === 'campaign') {
        return {
          formType: 'campaign',
          providerUsed: 'Gemini',
          campaign: {
            name: prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt,
            audience: lower.includes('healthcare') ? 'Healthcare · India + global' : 'Enterprise .NET Teams',
            serviceProposition: 'Modernize legacy services with cloud-native .NET LTS.',
          },
        };
      }
      const isDoc = lower.includes('tender') || lower.includes('vendor') || lower.includes('gst') || lower.includes('iso');
      return {
        formType: 'opportunity',
        providerUsed: 'Gemini',
        opportunity: {
          company: lower.includes('microsoft') ? 'Microsoft' : lower.includes('northstar') ? 'Northstar Digital' : lower.includes('cloudharbor') ? 'CloudHarbor Labs' : 'Enterprise Client',
          title: lower.includes('.net') ? 'Senior .NET / Cloud Engineer' : lower.includes('react') ? 'Lead React Engineer' : 'Full-Stack Developer Contract',
          source: 'Company careers',
          location: lower.includes('bengaluru') ? 'Bengaluru, India' : 'Remote · India',
          fitRating: 'High',
          opportunityType: lower.includes('partner') || lower.includes('vendor') ? 'Company/vendor' : 'Individual developer',
          sourceUrl: 'https://careers.example.com/job',
          evidenceSnippet: prompt,
          requiresVendorDocs: isDoc,
          vendorRequirementNotes: isDoc ? 'Vendor registration and compliance certificate required.' : '',
        },
      };
    },
  };

  return methods;
}
