import { AppShell } from './components/layout/AppShell';
import { makePageHelpers } from './components/pageHelpers';
import { SignIn } from './components/screens/SignIn';
import { useBaseController } from './hooks/useBaseController';
import type { AppCtx } from './appContext';

export function App() {
  const base = useBaseController();
  const ctx: AppCtx = { ...base, ...makePageHelpers(base) };
  const { page, setUserEmail, setGuestMode, go, notify, signInNotice, setSignInNotice } = ctx;

  if (page === 'Sign in') {
    return (
      <SignIn
        notice={signInNotice}
        onSuccess={(email, isGuest) => {
          setSignInNotice('');
          setUserEmail(email);
          setGuestMode(isGuest);
          go('Dashboard');
        }}
        onNotify={notify}
      />
    );
  }

  return <AppShell ctx={ctx} />;
}
