import { Globe2, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export function SignInAside() {
  return (
    <aside className="signin-aside">
      <div className="signin-brand">
        <div className="signin-logo-badge">
          <span>V</span>
        </div>
        <div className="signin-brand-title">
          <span>VSR <b>Sales Engine</b></span>
          <span className="signin-version-tag">v0.1.0 LTS</span>
        </div>
      </div>

      <div className="signin-message">
        <div className="signin-eyebrow">
          <Sparkles size={13} />
          <span>ENTERPRISE B2B SALES PLATFORM</span>
        </div>

        <h1>Autonomous Lead Ingestion & Compliance Governance</h1>
        <p>
          Seamlessly discover commercial opportunities across company careers and public portals,
          synthesize grounded consultative outreach, and enforce statutory anti-spam compliance gates with Google Gemini AI.
        </p>

        <div className="signin-features-grid">
          <div className="signin-feature-item">
            <div className="signin-feature-icon">
              <Globe2 size={16} />
            </div>
            <div>
              <strong>Autonomous Discovery</strong>
              <span>Continuous background scans across careers, approved feeds, and procurement registries.</span>
            </div>
          </div>

          <div className="signin-feature-item">
            <div className="signin-feature-icon">
              <ShieldCheck size={16} />
            </div>
            <div>
              <strong>6-Point Compliance Gate</strong>
              <span>Strict fail-closed verification of sender identity, address, opt-out mechanisms, and daily caps.</span>
            </div>
          </div>

          <div className="signin-feature-item">
            <div className="signin-feature-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <strong>Gemini 2.5 Flash Extraction</strong>
              <span>1-click unstructured job snippet parsing, entity extraction, and smart form population.</span>
            </div>
          </div>

          <div className="signin-feature-item">
            <div className="signin-feature-icon">
              <Layers size={16} />
            </div>
            <div>
              <strong>Immutable Audit & Test Sink</strong>
              <span>Complete pipeline stage history with sandbox test-sink routing for zero risk.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="signin-aside-footer">
        <div className="signin-status-indicator">
          <span className="status-dot-pulse" />
          <span>Live Engine Connected • .NET 10 LTS Backend</span>
        </div>
        <span>SOC-2 & GDPR Fail-Closed Ready</span>
      </div>
    </aside>
  );
}
