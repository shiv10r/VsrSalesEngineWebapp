import { AppShell } from './components/layout/AppShell';
import { makePageHelpers } from './components/pageHelpers';
import { SignIn } from './components/screens/SignIn';
import { useBaseController } from './hooks/useBaseController';
import type { AppCtx } from './appContext';

export function App() {
  const base = useBaseController();
  const ctx: AppCtx = { ...base, ...makePageHelpers(base) };
  const { page, setUserEmail, setGuestMode, go, notify } = ctx;

  if (page === 'Sign in') {
    return (
      <SignIn
        onSuccess={(email, isGuest) => {
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
