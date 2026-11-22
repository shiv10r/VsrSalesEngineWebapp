import { ChevronRight, Code2, KeyRound, LogOut, Moon, Sun } from 'lucide-react';
import { SettingRow } from '../Helpers';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SettingsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, settingsTab, setSettingsTab, dark, setDark, guestMode, go,
  } = ctx;

  return (
    <>
      {pageHeading('Settings', 'Manage the workspace defaults and development environment safeguards.', null, 'WORKSPACE CONFIGURATION')}
      <div className="settings-layout">
        <aside className="panel settings-nav">
          {['General', 'Authentication', 'Guest mode', 'Source policy', 'Data & privacy', 'About'].map(t => (
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
            </>
          )}
          {settingsTab === 'About' && (
            <>
              <div className="settings-title"><h2>About VSR Sales Engine</h2></div>
              <SettingRow title="Frontend stack" desc="UI framework."><strong>React + TypeScript (Vite)</strong></SettingRow>
              <SettingRow title="Backend API" desc="Web API framework."><strong>.NET 10 LTS ASP.NET Core</strong></SettingRow>
            </>
          )}
        </section>
      </div>
    </>
  );
}
