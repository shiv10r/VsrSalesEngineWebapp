import { ChevronRight, Code2, KeyRound, LogOut, Moon, Play, ShieldAlert, Sun } from 'lucide-react';
import { SettingRow } from '../Helpers';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SettingsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, settingsTab, setSettingsTab, dark, setDark, guestMode, go, killSwitchEngaged,
    handleToggleKillSwitch, handleRunSmokeDrill, isRunningSmokeDrill, smokeDrillResult,
  } = ctx;

  return (
    <>
      {pageHeading('Settings', 'Manage the workspace defaults and development environment safeguards.', null, 'WORKSPACE CONFIGURATION')}
      <div className="settings-layout">
        <aside className="panel settings-nav">
          {['General', 'Authentication', 'Guest mode', 'Outreach safety', 'Source policy', 'Data & privacy', 'About'].map(t => (
            <button key={t} className={settingsTab === t ? 'selected' : ''} onClick={() => setSettingsTab(t)}>
              <span>{t}</span><ChevronRight size={14} />
            </button>
          ))}
        </aside>
        <section className="panel settings-main">
          {settingsTab === 'General' && (
            <>
              <div className="settings-title"><h2>Workspace preferences</h2></div>
              <SettingRow title="Color theme" desc="Toggle light and dark themes.">
                <div className="theme-pick">
                  <button className={!dark ? 'picked' : ''} onClick={() => setDark(false)}><Sun size={15} />Light</button>
                  <button className={dark ? 'picked' : ''} onClick={() => setDark(true)}><Moon size={15} />Dark</button>
                </div>
              </SettingRow>
            </>
          )}
          {settingsTab === 'Authentication' && (
            <>
              <div className="settings-title"><h2>Authentication</h2></div>
              <div className="auth-callout">
                <KeyRound size={19} />
                <div><strong>JWT authentication is required by default</strong><p>Enforced server-side in ASP.NET Core.</p></div>
              </div>
              <SettingRow title="Guest bypass in production" desc="Security boundary constraint."><Pill type="red">Strictly Disabled</Pill></SettingRow>
            </>
          )}
          {settingsTab === 'Guest mode' && (
            <>
              <div className="settings-title"><h2>Development guest mode</h2></div>
              <div className="guest-settings-card">
                <div className="guest-settings-icon"><Code2 size={20} /></div>
                <div className="guest-settings-copy">
                  <strong>Guest access status</strong>
                  <p>Currently {guestMode ? 'active in local development session.' : 'disabled; using authenticated token.'}</p>
                </div>
              </div>
              <div className="settings-footer">
                <Button onClick={() => go('Sign in')} icon={LogOut}>Open sign-in screen</Button>
              </div>
            </>
          )}
          {settingsTab === 'Outreach safety' && (
            <>
              <div className="settings-title"><h2>Outreach safety & kill switch</h2></div>
              <div className="auth-callout" style={{ borderColor: killSwitchEngaged ? 'var(--red, #ef4444)' : 'var(--green, #22c55e)' }}>
                <ShieldAlert size={20} color={killSwitchEngaged ? '#ef4444' : '#22c55e'} />
                <div style={{ flex: 1 }}>
                  <strong>{killSwitchEngaged ? 'EMERGENCY KILL SWITCH ACTIVE' : 'Outreach Protection: Active & Guarded'}</strong>
                  <p>{killSwitchEngaged ? 'All outbound sending is halted immediately. No live emails or sink messages will be sent.' : 'All outreach is strictly routed to the safe test sink (dev-sink@vsrsalesengine.local). Real sending remains locked.'}</p>
                </div>
                <Button variant={killSwitchEngaged ? 'primary' : 'secondary'} onClick={handleToggleKillSwitch}>
                  {killSwitchEngaged ? 'Disengage kill switch' : 'Engage emergency kill switch'}
                </Button>
              </div>

              <SettingRow title="Operational smoke drill" desc="Validate DB connectivity, permitted sources, reliability metrics, and sandbox sink.">
                <Button variant="secondary" onClick={handleRunSmokeDrill} disabled={isRunningSmokeDrill}>
                  <Play size={14} /> {isRunningSmokeDrill ? 'Verifying...' : 'Run operational smoke drill'}
                </Button>
              </SettingRow>

              {smokeDrillResult && (
                <div style={{ background: 'var(--panel-subtle, rgba(255,255,255,0.03))', borderRadius: 8, padding: 14, margin: '12px 0', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Operational Verification Result</span>
                    <Pill type={smokeDrillResult.status === 'PASS' ? 'green' : 'amber'}>{smokeDrillResult.status}</Pill>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {smokeDrillResult.checks?.map((c: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{c.component}</span>
                        <span>{c.detail} <Pill type={c.status === 'PASS' ? 'green' : 'red'}>{c.status}</Pill></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <SettingRow title="Outreach mode" desc="Current runtime routing mode.">
                <Pill type="neutral">Test (Sandbox Sink)</Pill>
              </SettingRow>
              <SettingRow title="Default sink recipient" desc="Safe destination for intercepted drafts.">
                <code>dev-sink@vsrsalesengine.local</code>
              </SettingRow>
              <SettingRow title="Statutory compliance gate" desc="Unsubscribe headers, postal identity, and opt-out policy.">
                <Pill type="green">Enforced</Pill>
              </SettingRow>
            </>
          )}
          {settingsTab === 'Source policy' && (
            <>
              <div className="settings-title"><h2>Source policy & legal boundaries</h2></div>
              <SettingRow title="LinkedIn scraping prohibition" desc="Strictly enforced architectural constraint.">
                <Pill type="green">No Scraping / Manual Only</Pill>
              </SettingRow>
              <SettingRow title="Public job feeds policy" desc="Attribution notices and rate limits.">
                <Pill type="green">Permitted with Attribution</Pill>
              </SettingRow>
              <SettingRow title="Canonical deduplication" desc="Duplicate detection on normalized URLs and company/title pairs.">
                <Pill type="green">Active</Pill>
              </SettingRow>
            </>
          )}
          {settingsTab === 'Data & privacy' && (
            <>
              <div className="settings-title"><h2>Data & privacy protection</h2></div>
              <SettingRow title="SSRF protection" desc="Client and server blocks against private/loopback IP requests.">
                <Pill type="green">Active</Pill>
              </SettingRow>
              <SettingRow title="Prompt injection scrub" desc="Neutralizes system commands in external job postings.">
                <Pill type="green">Active</Pill>
              </SettingRow>
              <SettingRow title="Pre-send suppression lookup" desc="Checks suppression database prior to any dispatch attempt.">
                <Pill type="green">Active</Pill>
              </SettingRow>
            </>
          )}
          {settingsTab === 'About' && (
            <>
              <div className="settings-title"><h2>About VSR Sales Engine</h2></div>
              <SettingRow title="Frontend stack" desc="UI framework."><strong>React + TypeScript (Vite)</strong></SettingRow>
              <SettingRow title="Backend API" desc="Web API framework."><strong>.NET 10 LTS ASP.NET Core</strong></SettingRow>
              <SettingRow title="Database" desc="Target database."><strong>Supabase PostgreSQL</strong></SettingRow>
            </>
          )}
        </section>
      </div>
    </>
  );
}
