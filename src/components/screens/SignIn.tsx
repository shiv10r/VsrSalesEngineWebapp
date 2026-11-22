import { Eye } from 'lucide-react';
import '../../styles/signin.css';
import { useSignIn } from '../../hooks/useSignIn';
import { SignInAside } from './SignInAside';
import { SignInForm } from './SignInForm';

interface SignInProps {
  onSuccess: (userEmail: string, isGuest: boolean) => void;
  onNotify: (msg: string) => void;
  notice?: string;
}

export const SignIn: React.FC<SignInProps> = (props) => {
  const s = useSignIn(props);

  return (
    <div className="si-shell">
      <SignInAside />
      <main className="si-main">
        <div className="si-card">
          <h2>Sign in</h2>
          <p className="si-sub">Use your work account to open the workspace.</p>

          {props.notice && <div className="si-alert" role="status"><span>{props.notice}</span></div>}

          <SignInForm s={s} />

          <div className="si-or"><span>or</span></div>

          <button type="button" className="si-guest" onClick={s.enterAsGuest} disabled={s.busy !== null}>
            <Eye size={18} aria-hidden="true" />
            <span>
              <strong>{s.busy === 'guest' ? 'Opening guest view…' : 'Explore as a guest'}</strong>
              <small>Read-only. Guests cannot run agents or change data.</small>
            </span>
          </button>
        </div>
      </main>
    </div>
  );
};
